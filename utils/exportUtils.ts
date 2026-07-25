import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AuthorProfile } from '../types';

export type ExportFormat = 'md' | 'jekyll' | 'devto' | 'html' | 'txt' | 'json' | 'pdf';

export interface ExportArticleData {
  title: string;
  content: string;
  coverImage: string | null;
  tags: string[];
  authorProfile?: AuthorProfile;
  wordCount: number;
  readTimeMinutes: number;
}

/**
 * Helper to extract clean article title
 */
export const getArticleTitle = (content: string): string => {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) return match[1].replace(/[*_~`]/g, '').trim();
  const firstLine = content.split('\n')[0] || 'mediumizer-story';
  return firstLine.replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'mediumizer-story';
};

/**
 * Helper to extract excerpt/description
 */
export const getArticleExcerpt = (content: string): string => {
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && !l.startsWith('!['));
  return lines[0]?.slice(0, 180) || 'A Mediumizer story.';
};

/**
 * Helper to strip Markdown formatting for plain text
 */
export const stripMarkdown = (markdown: string): string => {
  return markdown
    .replace(/^#+\s+/gm, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/!\[(.*?)\]\(.*?\)/g, '') // Remove images
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/^>\s+/gm, '') // Remove blockquotes
    .replace(/^[\*\-\+]\s+/gm, '') // Remove list bullets
    .replace(/^\d+\.\s+/gm, '') // Remove numbered lists
    .trim();
};

/**
 * Trigger file download in browser
 */
export const downloadBlob = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Standard Raw Markdown (.md)
 */
export const generateRawMarkdown = (data: ExportArticleData): string => {
  return data.content;
};

/**
 * Jekyll / Hugo Markdown (.md)
 */
export const generateJekyllMarkdown = (data: ExportArticleData): string => {
  const today = new Date().toISOString().split('T')[0];
  const title = data.title;
  const tagsStr = `[${data.tags.map((t) => `"${t}"`).join(', ')}]`;
  const excerpt = getArticleExcerpt(data.content);

  const frontMatter = [
    '---',
    'layout: post',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `date: ${today}`,
    `tags: ${tagsStr}`,
    `excerpt: "${excerpt.replace(/"/g, '\\"')}"`,
    data.authorProfile ? `author: "${data.authorProfile.name}"` : 'author: "Mediumizer"',
    data.coverImage ? `header_image: "${data.coverImage}"` : '',
    '---',
  ]
    .filter(Boolean)
    .join('\n');

  return `${frontMatter}\n\n${data.content}`;
};

/**
 * Dev.to / Hashnode Markdown (.md)
 */
export const generateDevToMarkdown = (data: ExportArticleData): string => {
  const title = data.title;
  const tagsStr = data.tags.slice(0, 4).join(', ');
  const excerpt = getArticleExcerpt(data.content);

  const frontMatter = [
    '---',
    `title: ${title}`,
    `published: true`,
    `description: ${excerpt}`,
    `tags: ${tagsStr}`,
    data.coverImage ? `cover_image: ${data.coverImage}` : '',
    '---',
  ]
    .filter(Boolean)
    .join('\n');

  return `${frontMatter}\n\n${data.content}`;
};

/**
 * Plain Text (.txt)
 */
export const generatePlainText = (data: ExportArticleData): string => {
  return stripMarkdown(data.content);
};

/**
 * JSON Story Bundle (.json)
 */
export const generateJSONBundle = (data: ExportArticleData): string => {
  const bundle = {
    metadata: {
      exportedAt: new Date().toISOString(),
      generator: 'Mediumizer AI Article Generator',
      version: '1.0',
    },
    article: {
      title: data.title,
      wordCount: data.wordCount,
      readTimeMinutes: data.readTimeMinutes,
      tags: data.tags,
      coverImage: data.coverImage,
      markdownContent: data.content,
      plainTextContent: stripMarkdown(data.content),
    },
    author: data.authorProfile || null,
  };
  return JSON.stringify(bundle, null, 2);
};

/**
 * Standalone HTML File (.html)
 */
export const generateHTMLDocument = (data: ExportArticleData): string => {
  const formattedBody = data.content
    .split('\n\n')
    .map((para) => {
      const trimmed = para.trim();
      if (trimmed.startsWith('# ')) return `<h1>${trimmed.slice(2)}</h1>`;
      if (trimmed.startsWith('## ')) return `<h2>${trimmed.slice(3)}</h2>`;
      if (trimmed.startsWith('### ')) return `<h3>${trimmed.slice(4)}</h3>`;
      if (trimmed.startsWith('> ')) return `<blockquote>${trimmed.slice(2)}</blockquote>`;
      return `<p>${trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}</p>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif;
      line-height: 1.8;
      color: #242424;
      background-color: #ffffff;
      max-width: 740px;
      margin: 40px auto;
      padding: 0 20px;
    }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; font-weight: 800; line-height: 1.25; }
    h2 { font-size: 1.75rem; margin-top: 2rem; margin-bottom: 1rem; font-weight: 700; }
    h3 { font-size: 1.35rem; margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: 600; }
    p { margin-bottom: 1.5rem; font-size: 1.125rem; }
    blockquote {
      border-left: 3px solid #242424;
      padding-left: 1.25rem;
      margin: 2rem 0;
      font-style: italic;
      color: #555555;
    }
    img.cover { width: 100%; height: auto; border-radius: 12px; margin-bottom: 2rem; }
    .author-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eeeeee;
      font-size: 0.9rem;
      color: #666666;
    }
    .author-meta img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
    .tags { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 3rem; pt-1rem; border-top: 1px solid #eee; }
    .tag { background: #f2f2f2; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; color: #444; }
  </style>
</head>
<body>
  ${
    data.authorProfile
      ? `<div class="author-meta">
          <img src="${data.authorProfile.avatarUrl}" alt="${data.authorProfile.name}">
          <div>
            <strong>${data.authorProfile.name}</strong> • ${data.readTimeMinutes} min read
            <div><small>${data.authorProfile.tagline || ''}</small></div>
          </div>
        </div>`
      : ''
  }

  ${data.coverImage ? `<img src="${data.coverImage}" alt="Cover Image" class="cover">` : ''}

  <article>
    ${formattedBody}
  </article>

  ${
    data.tags.length
      ? `<div class="tags">${data.tags.map((t) => `<span class="tag">#${t}</span>`).join('')}</div>`
      : ''
  }
</body>
</html>`;
};

/**
 * Smart PDF Document Generator
 * - Adds 15mm page margins (top, bottom, left, right)
 * - Automatically scans for horizontal white space gaps between text lines before slicing
 * - Prevents cut-off text lines and broken characters
 */
export const generatePDFDocument = async (
  element: HTMLElement,
  filename: string
): Promise<void> => {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = 210;
  const pdfHeight = 297;
  const marginMm = 15;

  const printableWidthMm = pdfWidth - marginMm * 2; // 180mm
  const printableHeightMm = pdfHeight - marginMm * 2; // 267mm

  const pxPerMm = canvas.width / printableWidthMm;
  const maxSliceHeightPx = Math.floor(printableHeightMm * pxPerMm);

  let currentY = 0;
  let pageIndex = 0;

  // Helper to find a white gap between text lines
  const findBestCutY = (startY: number, targetHeightPx: number): number => {
    const idealY = startY + targetHeightPx;
    if (idealY >= canvas.height) {
      return canvas.height;
    }

    const searchBackPx = Math.min(140, Math.floor(targetHeightPx * 0.25));
    const minSearchY = idealY - searchBackPx;

    const imageData = ctx.getImageData(0, minSearchY, canvas.width, searchBackPx);
    const data = imageData.data;

    let bestY = idealY;
    let minDarkPixels = Infinity;

    for (let r = searchBackPx - 1; r >= 0; r--) {
      let darkCount = 0;
      const rowOffset = r * canvas.width * 4;
      const step = 4;

      for (let x = 0; x < canvas.width; x += step) {
        const idx = rowOffset + x * 4;
        const red = data[idx];
        const green = data[idx + 1];
        const blue = data[idx + 2];
        const alpha = data[idx + 3];

        if (alpha > 50 && (red < 240 || green < 240 || blue < 240)) {
          darkCount++;
        }
      }

      if (darkCount === 0) {
        return minSearchY + r;
      }

      if (darkCount < minDarkPixels) {
        minDarkPixels = darkCount;
        bestY = minSearchY + r;
      }
    }

    return bestY;
  };

  while (currentY < canvas.height) {
    const remainingPx = canvas.height - currentY;
    let cutY: number;

    if (remainingPx <= maxSliceHeightPx) {
      cutY = canvas.height;
    } else {
      cutY = findBestCutY(currentY, maxSliceHeightPx);
      if (cutY <= currentY) {
        cutY = currentY + maxSliceHeightPx;
      }
    }

    const sliceHeightPx = cutY - currentY;

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeightPx;
    const sliceCtx = sliceCanvas.getContext('2d');

    if (sliceCtx) {
      sliceCtx.fillStyle = '#ffffff';
      sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      sliceCtx.drawImage(
        canvas,
        0,
        currentY,
        canvas.width,
        sliceHeightPx,
        0,
        0,
        canvas.width,
        sliceHeightPx
      );

      const sliceDataUrl = sliceCanvas.toDataURL('image/png');
      const sliceHeightMm = sliceHeightPx / pxPerMm;

      if (pageIndex > 0) {
        pdf.addPage();
      }

      pdf.addImage(
        sliceDataUrl,
        'PNG',
        marginMm,
        marginMm,
        printableWidthMm,
        sliceHeightMm
      );
    }

    currentY = cutY;
    pageIndex++;
  }

  pdf.save(`${filename}.pdf`);
};
