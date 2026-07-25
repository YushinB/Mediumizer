import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are a top-tier writer and editor for Medium.com. 
Your goal is to transform user inputs into engaging, high-quality, widely-read articles.
Follow these rules:
1. Use a captivating, click-worthy (but not clickbait) headline.
2. Structure the content with clear headings (H2, H3).
3. Use short paragraphs and sentence variety to maintain rhythm.
4. Format the output strictly in Markdown.
5. Do not include the title in the body if you return it separately, but for this stream, include the Title as an H1 at the very top.
6. If a process, workflow, or system architecture needs visualization, use a Mermaid diagram code block (start with \`\`\`mermaid).
7. If mathematical formulas are needed, use LaTeX syntax enclosed in single '$' for inline (e.g., $E=mc^2$) or double '$$' for block equations.
8. At the very end of the response, strictly add a section header "## SEO Keywords" followed by a comma-separated list of 5-10 relevant tags.
9. When analyzing external sources (like YouTube videos via Search), prioritize finding specific transcripts, summaries, or reviews of that exact content over general knowledge.
`;

const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Stream Article Generation
  app.post("/api/generate-article", async (req, res) => {
    const { topic, tone, length, source, language } = req.body || {};

    if (!topic) {
      res.status(400).json({ error: "Topic is required" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      const ai = getGenAIClient();
      let prompt = "";
      let tools: any[] = [];
      let temperature = 0.7;

      if (source === "youtube") {
        temperature = 0.3;
        prompt = `
          TASK: Create a comprehensive blog post that accurately reflects the content of this YouTube video: "${topic}".
          
          SETTINGS:
          - Tone: ${tone || "engaging"}
          - Language: ${language || "English"}

          INSTRUCTIONS:
          1. Analyze the Request: You need the actual content of the video.
          2. Use Google Search to find transcripts, captions, or detailed summaries of "${topic}".
          3. Base your article primarily on the retrieved information.
          
          OUTPUT FORMAT:
          - Title (H1)
          - Subtitle (blockquote)
          - Body (H2/H3)
          - Mermaid diagram (if applicable)
          - ## SEO Keywords
        `;
        tools = [{ googleSearch: {} }];
      } else if (source === "outline") {
        prompt = `
          TASK: Create a comprehensive, structured OUTLINE for a ${length || "medium"} article about: "${topic}".
          
          SETTINGS:
          - Tone: ${tone || "engaging"}
          - Language: ${language || "English"}
          
          INSTRUCTIONS:
          - Do NOT write the full article. Create the skeleton/plan.
          - Provide 3 compelling Title options at the top.
          - Structure the output clearly using Markdown nested lists.
          
          OUTPUT FORMAT:
          # [Working Title Placeholder]
          
          ## Title Options
          1. [Option 1]
          2. [Option 2]
          3. [Option 3]
          
          ## Article Outline
          
          ### I. Introduction
          - Hook: [Idea for opening hook]
          - Core Thesis: [The main argument]
          
          ### II. [Main Section 1]
          - Key Point A
          - Key Point B
          
          ### V. Conclusion
          - Summary of key takeaways
          
          ## SEO Keywords
        `;
      } else {
        prompt = `
          Write a ${length || "medium"} article about the following topic: "${topic}".
          
          Tone: ${tone || "engaging"}.
          Language: ${language || "English"}.
          
          Ensure the article is written entirely in ${language || "English"}.
          Ensure the article feels human, insightful, and polished. 
          Include a Title (H1) at the start, followed by a subtitle (blockquoted), and then the body.
          Use Mermaid charts for complex logic, flows, or timelines where appropriate.
          End the article with a list of 5-10 SEO keywords/tags.
        `;
      }

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.6-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: temperature,
          tools: tools.length > 0 ? tools : undefined,
        },
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error("Error generating article on server:", error);
      res.write(
        `data: ${JSON.stringify({ error: error?.message || "Failed to generate article" })}\n\n`
      );
      res.end();
    }
  });

  // API Route: Generate Cover Image
  app.post("/api/generate-cover", async (req, res) => {
    const { topic } = req.body || {};

    if (!topic) {
      res.status(400).json({ error: "Topic is required" });
      return;
    }

    try {
      const ai = getGenAIClient();
      const isUrl = /^(http|https):\/\/[^ "]+$/.test(topic);

      const promptText = isUrl
        ? `A minimalist, high-quality, artistic editorial cover illustration for a blog post about video content and digital media. Extract the essence of digital storytelling.`
        : `A minimalist, high-quality, artistic editorial cover illustration for a blog post about: "${topic}".`;

      const prompt = `${promptText} 
      The style should be modern, abstract or flat design, suitable for a tech or culture publication. 
      No text on the image. High contrast, pleasing colors.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [{ text: prompt }],
        },
      });

      let base64Image = "";
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            base64Image = part.inlineData.data;
            break;
          }
        }
      }

      if (!base64Image) {
        res.status(500).json({ error: "No image data generated" });
        return;
      }

      const mimeType = parts?.find((p) => p.inlineData)?.inlineData?.mimeType || "image/png";
      res.json({ imageUrl: `data:${mimeType};base64,${base64Image}` });
    } catch (error: any) {
      console.error("Error generating cover image on server:", error);
      res.status(500).json({ error: error?.message || "Failed to generate cover image" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
