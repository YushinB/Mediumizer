import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ArticleConfig, ToneOption, LengthOption } from "../types";

// Initialize the API client
// Note: process.env.API_KEY is injected automatically in the runtime environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
`;

export const streamArticleGeneration = async (
  config: ArticleConfig,
  onChunk: (text: string) => void
): Promise<string> => {
  const prompt = `
    Write a ${config.length} article about the following topic: "${config.topic}".
    
    Tone: ${config.tone}.
    Language: ${config.language}.
    
    Ensure the article is written entirely in ${config.language}.
    Ensure the article feels human, insightful, and polished. 
    Include a Title (H1) at the start, followed by a subtitle (blockquoted), and then the body.
    Use Mermaid charts for complex logic, flows, or timelines where appropriate.
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3-pro-preview", // Using Pro for higher reasoning/writing quality
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // Creativity balance
      },
    });

    let fullText = "";
    for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
            fullText += text;
            onChunk(fullText);
        }
    }
    return fullText;
  } catch (error) {
    console.error("Error generating article:", error);
    throw new Error("Failed to generate article content.");
  }
};

export const generateCoverImage = async (topic: string): Promise<string> => {
  const prompt = `A minimalist, high-quality, artistic editorial cover illustration for a blog post about: "${topic}". 
  The style should be modern, abstract or flat design, suitable for a tech or culture publication. 
  No text on the image. High contrast, pleasing colors.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // No explicit imageConfig needed for standard flash-image generation unless ratio changes
        // Default is usually 1:1, but flash-image often handles prompts for "landscape" well contextually,
        // though strictly aspect ratio control is limited in flash-image compared to Imagen.
        // We will crop via CSS if needed, or ask for landscape composition in prompt.
      }
    });

    // Extract image
    // Note: Gemini 2.5 Flash Image returns image in inlineData within candidates
    // We need to iterate to find it.
    let base64Image = "";
    
    // Check parts
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
        // Fallback or error if no image found (rare)
        throw new Error("No image data returned");
    }

    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error("Error generating image:", error);
    // Return a placeholder or empty string to handle gracefully
    return ""; 
  }
};