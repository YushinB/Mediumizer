import { ArticleConfig } from "../types";

export const streamArticleGeneration = async (
  config: ArticleConfig,
  onChunk: (text: string) => void
): Promise<string> => {
  try {
    const response = await fetch("/api/generate-article", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server returned error ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body received from server");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const jsonStr = trimmed.slice(6);
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              accumulatedText += parsed.text;
              onChunk(accumulatedText);
            }
          } catch (e) {
            // Ignore parse errors on incomplete frames
          }
        }
      }
    }

    return accumulatedText;
  } catch (error: any) {
    console.error("Error generating article:", error);
    throw new Error(error?.message || "Failed to generate article content. Please try again.");
  }
};

export const generateCoverImage = async (topic: string): Promise<string> => {
  const fallbackUrl = `https://picsum.photos/seed/${encodeURIComponent(topic.slice(0, 35))}/1200/630`;
  try {
    const response = await fetch("/api/generate-cover", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      return fallbackUrl;
    }

    const data = await response.json();
    return data.imageUrl || fallbackUrl;
  } catch (error) {
    console.error("Error generating cover image:", error);
    return fallbackUrl;
  }
};

export interface RefineRequest {
  content: string;
  action: string;
  customInstruction?: string;
  targetTone?: string;
  fullArticle?: string;
}

export const streamArticleRefinement = async (
  reqData: RefineRequest,
  onChunk: (text: string) => void
): Promise<string> => {
  try {
    const response = await fetch("/api/refine-article", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqData),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server returned error ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body received from server");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const jsonStr = trimmed.slice(6);
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              accumulatedText += parsed.text;
              onChunk(accumulatedText);
            }
          } catch (e) {
            // Ignore parse errors on incomplete frames
          }
        }
      }
    }

    return accumulatedText;
  } catch (error: any) {
    console.error("Error refining article:", error);
    throw new Error(error?.message || "Failed to refine article content. Please try again.");
  }
};
