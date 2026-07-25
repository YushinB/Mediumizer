import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, Share2, Copy, Check, Twitter, Linkedin, Facebook, FileText, Tag, Sparkles, Workflow, Image as ImageIcon } from 'lucide-react';
import mermaid from 'mermaid';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import InlineAIRefinementBar, { RefinementOptions } from './InlineAIRefinementBar';
import TextSelectionRefineBar from './TextSelectionRefineBar';
import ExportModal from './ExportModal';
import TableOfContents, { slugifyHeading } from './TableOfContents';
import { streamArticleRefinement, generateCoverImage } from '../services/geminiService';
import { ArticleAuthorHeader, ArticleAuthorFooter } from './ArticleAuthorCard';
import { AuthorProfile } from '../types';
import { generatePDFDocument } from '../utils/exportUtils';
import { generateMermaidSvgDataUrl, extractMermaidNodes } from '../utils/diagramImageGenerator';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
});

interface ArticlePreviewProps {
  content: string;
  coverImage: string | null;
  isGenerating: boolean;
  onUpdateContent?: (newContent: string) => void;
  authorProfile?: AuthorProfile;
  onEditAuthorProfile?: () => void;
}

interface MermaidDiagramProps {
  chart: string;
  onReplaceWithAIImage?: (chartCode: string, imageUrl: string) => void;
}

const MermaidDiagram = ({ chart, onReplaceWithAIImage }: MermaidDiagramProps) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'diagram' | 'ai-image'>('diagram');

  useEffect(() => {
    let isMounted = true;
    
    const renderChart = async () => {
      if (!chart) return;
      try {
        await mermaid.parse(chart);
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        
        if (isMounted) {
            setSvg(svg);
            setError(false);
        }
      } catch (err) {
        if (isMounted) setError(true);
      }
    };

    renderChart();
    
    return () => {
        isMounted = false;
    };
  }, [chart]);

  const handleGenerateAIImage = async () => {
    setIsGeneratingAI(true);
    try {
      const nodes = extractMermaidNodes(chart);
      const stepSummary = nodes.length > 0 
        ? nodes.map((n) => n.label).join(' -> ') 
        : chart.replace(/graph|flowchart|TD|LR/gi, '').slice(0, 150);

      const topic = `Technical process diagram illustration showing workflow steps: ${stepSummary}`;
      
      let url = await generateCoverImage(topic);

      // If AI model rate limited or returned placeholder photo, generate 100% relevant vector infographic
      if (!url || url.includes('picsum.photos')) {
        url = generateMermaidSvgDataUrl(chart);
      }

      setAiImageUrl(url);
      setActiveTab('ai-image');
    } catch (e) {
      console.error('Failed to generate AI illustration for diagram:', e);
      // Fallback to custom SVG vector infographic
      const fallbackSvg = generateMermaidSvgDataUrl(chart);
      setAiImageUrl(fallbackSvg);
      setActiveTab('ai-image');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleApplyToArticle = () => {
    if (aiImageUrl && onReplaceWithAIImage) {
      onReplaceWithAIImage(chart, aiImageUrl);
    }
  };

  if (error) {
     return <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-400 font-mono text-center my-6">Rendering diagram...</div>;
  }
  
  if (!svg) return <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-400 font-mono animate-pulse text-center my-6">Loading diagram...</div>;

  return (
    <div className="my-10 rounded-2xl border border-gray-200/80 bg-slate-50/50 p-4 shadow-xs overflow-hidden">
      {/* Header bar with AI Convert options */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-gray-200/60 text-xs font-sans">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <Workflow size={15} className="text-emerald-600" />
          <span>Workflow Diagram</span>
        </div>

        <div className="flex items-center gap-2">
          {aiImageUrl && (
            <div className="flex bg-gray-200/80 p-0.5 rounded-lg text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('diagram')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeTab === 'diagram' ? 'bg-white shadow-xs text-gray-900 font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mermaid Flow
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ai-image')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  activeTab === 'ai-image' ? 'bg-white shadow-xs text-emerald-800 font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                AI Illustration
              </button>
            </div>
          )}

          {!aiImageUrl ? (
            <button
              type="button"
              onClick={handleGenerateAIImage}
              disabled={isGeneratingAI}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shadow-2xs transition-all active:scale-95 disabled:opacity-50"
              title="Replace or augment this flowchart with a custom AI-generated editorial illustration"
            >
              <Sparkles size={13} className={isGeneratingAI ? 'animate-spin' : ''} />
              <span>{isGeneratingAI ? 'Generating AI Image...' : 'Convert to AI Illustration'}</span>
            </button>
          ) : (
            onReplaceWithAIImage && (
              <button
                type="button"
                onClick={handleApplyToArticle}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold transition-all active:scale-95"
                title="Replace diagram in article markdown"
              >
                <Check size={12} className="text-emerald-400" />
                <span>Insert Image into Article</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Main View Area */}
      {activeTab === 'diagram' || !aiImageUrl ? (
        <div className="flex justify-center overflow-x-auto py-2" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="flex flex-col items-center gap-2 py-2">
          <img
            src={aiImageUrl}
            alt="AI Generated Article Illustration"
            className="rounded-xl shadow-sm max-h-[420px] w-full object-cover border border-gray-100"
          />
          <span className="text-[11px] text-gray-400 italic">
            Generated with AI Editorial Illustration Engine
          </span>
        </div>
      )}
    </div>
  );
};

const ArticlePreview: React.FC<ArticlePreviewProps> = ({
  content,
  coverImage,
  isGenerating,
  onUpdateContent,
  authorProfile,
  onEditAuthorProfile,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  // AI Refinement & History State
  const [isRefining, setIsRefining] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Text Selection State
  const [selectedText, setSelectedText] = useState('');
  const [selectionPos, setSelectionPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isRefiningSelection, setIsRefiningSelection] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  // Sync history when a new content comes in
  useEffect(() => {
    if (content && !isRefining && (!history.length || history[historyIndex] !== content)) {
      if (historyIndex === -1 || Math.abs(content.length - (history[historyIndex]?.length || 0)) > 40) {
        setHistory([content]);
        setHistoryIndex(0);
      }
    }
  }, [content]);

  // Text selection listener inside article area
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 5 && printRef.current && printRef.current.contains(selection.anchorNode)) {
        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSelectedText(text);
          setSelectionPos({
            top: rect.top,
            left: rect.left + rect.width / 2,
          });
        } catch (e) {
          // ignore selection errors
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Don't close if clicking inside selection bar
      const target = e.target as HTMLElement;
      if (!target.closest('.text-selection-bar')) {
        setSelectedText('');
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const handleRefine = async (options: RefinementOptions) => {
    if (!content || isGenerating || isRefining) return;
    setIsRefining(true);
    const originalSnapshot = content;

    try {
      let accumulated = '';
      await streamArticleRefinement(
        {
          content: content,
          action: options.action,
          customInstruction: options.customInstruction,
          targetTone: options.targetTone,
        },
        (chunk) => {
          accumulated = chunk;
          if (onUpdateContent) {
            onUpdateContent(chunk);
          }
        }
      );

      if (accumulated.trim()) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(accumulated);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    } catch (error) {
      console.error('Refinement error:', error);
      if (onUpdateContent) {
        onUpdateContent(originalSnapshot);
      }
    } finally {
      setIsRefining(false);
    }
  };

  const handleRefineSelection = async (action: string, customInstruction?: string) => {
    if (!selectedText || !content || isRefiningSelection) return;
    setIsRefiningSelection(true);

    try {
      let replacement = '';
      await streamArticleRefinement(
        {
          content: selectedText,
          action: action,
          customInstruction: customInstruction,
          fullArticle: content,
        },
        (chunk) => {
          replacement = chunk;
        }
      );

      if (replacement.trim()) {
        const cleanReplacement = replacement.trim();
        const updated = content.replace(selectedText, cleanReplacement);

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(updated);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        if (onUpdateContent) {
          onUpdateContent(updated);
        }
      }
    } catch (error) {
      console.error('Selection refinement error:', error);
    } finally {
      setIsRefiningSelection(false);
      setSelectedText('');
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = historyIndex - 1;
      setHistoryIndex(prev);
      if (onUpdateContent) {
        onUpdateContent(history[prev]);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = historyIndex + 1;
      setHistoryIndex(next);
      if (onUpdateContent) {
        onUpdateContent(history[next]);
      }
    }
  };
  
  // Extract content and keywords
  const keywordMarker = /##\s*SEO\s*Keywords/i;
  const match = content.match(keywordMarker);
  let displayBody = content;
  let displayTags: string[] = [];

  if (match && match.index !== undefined) {
      displayBody = content.substring(0, match.index).trim();
      const tagsPart = content.substring(match.index + match[0].length).trim();
      if (tagsPart) {
          displayTags = tagsPart.split(/,|\n/)
            .map(t => t.replace(/^[-*•]\s*/, '').trim()) // remove bullets/hyphens
            .filter(t => t.length > 0 && !t.startsWith('#')); // cleanup
      }
  } else {
      // Fallback: if no split found, just show content (keywords might not be generated yet)
      displayBody = content;
  }

  const wordCount = displayBody ? displayBody.trim().split(/\s+/).filter(Boolean).length : 0;

  // Helper to extract title
  const getArticleTitle = (text: string) => {
    const titleMatch = text.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : 'Mediumizer Article';
  };

  const handleReplaceMermaidWithImage = (chartCode: string, imageUrl: string) => {
    if (!onUpdateContent || !content) return;

    const trimmedChart = chartCode.trim();
    // Try to find exact ```mermaid code block
    const blockExact = `\`\`\`mermaid\n${trimmedChart}\n\`\`\``;
    const blockInline = `\`\`\`mermaid ${trimmedChart} \`\`\``;
    
    let updated = content;
    if (updated.includes(blockExact)) {
      updated = updated.replace(blockExact, `\n\n![Editorial Illustration](${imageUrl})\n\n`);
    } else if (updated.includes(blockInline)) {
      updated = updated.replace(blockInline, `\n\n![Editorial Illustration](${imageUrl})\n\n`);
    } else {
      // Fallback regex search for mermaid block
      const snippet = trimmedChart.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp('```mermaid[\\s\\S]*?' + snippet + '[\\s\\S]*?```', 'm');
      updated = updated.replace(regex, `\n\n![Editorial Illustration](${imageUrl})\n\n`);
    }

    onUpdateContent(updated);
  };

  const handleDownloadJekyll = () => {
    if (!content) return;

    // 1. Extract Title (Assume first line starting with # is title)
    const titleMatch = displayBody.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Post';

    // 2. Extract Excerpt (Try to find the subtitle/blockquote)
    // Matches the first blockquote, often used as subtitle in this format
    const excerptMatch = displayBody.match(/^>\s+(.+)$/m);
    let excerpt = excerptMatch ? excerptMatch[1].trim() : "An insightful article generated by Mediumizer.";
    // Clean up excerpt if it contains markdown bold/italic
    excerpt = excerpt.replace(/[*_]/g, '');

    // 3. Prepare Body (Remove title if it exists to avoid duplication with Front Matter)
    let body = displayBody;
    if (titleMatch) {
        body = displayBody.replace(titleMatch[0], '').trim();
    }

    // 4. Generate Date and Slug for Filename
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const dateTimeStr = date.toISOString().replace('T', ' ').split('.')[0]; // YYYY-MM-DD HH:MM:SS

    // Better slugification for international characters (e.g. Vietnamese)
    const slug = title
        .toLowerCase()
        .normalize("NFD") // Decompose chars (e.g. ê -> e + ^)
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^\w\s-]/g, '') // Remove remaining non-word chars
        .replace(/\s+/g, '-')     // Space to hyphen
        .replace(/-+/g, '-')      // Collapse hyphens
        .replace(/^-+|-+$/g, ''); // Trim hyphens

    const filename = `${dateStr}-${slug}.md`;

    // 5. Construct Front Matter matching user request
    const tagsString = displayTags.length > 0 
        ? `[${displayTags.map(t => `"${t}"`).join(', ')}]` 
        : '[AI, Article]';

    const frontMatter = [
        '---',
        'layout: single',
        `title: "${title.replace(/"/g, '\\"')}"`,
        `date: ${dateTimeStr}`,
        'categories: [AI Generated]',
        `tags: ${tagsString}`,
        `excerpt: "${excerpt.replace(/"/g, '\\"')}"`,
        'header:',
        '  overlay_color: "#000"',
        '  overlay_filter: "0.5"',
        '  overlay_image: /assets/images/Blog-header.jpg',
        'author_profile: true',
        'mermaid: true',
        'mathjax: true',
        'custom_css:',
        '  - /assets/css/components.css',
        '---'
    ].join('\n');

    // 6. Combine Content (Front Matter + Body)
    const fileContent = `${frontMatter}\n\n${body}`;

    // 7. Trigger Download
    const blob = new Blob([fileContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsPdfGenerating(true);

    try {
      const title = getArticleTitle(content);
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'mediumizer-story';
      await generatePDFDocument(printRef.current, slug);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!content) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      try {
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed too: ', fallbackErr);
      }
    }
  };

  const handleShare = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    if (!content) return;
    
    const title = getArticleTitle(content);
    const url = window.location.href; // In production this would be the actual post URL
    
    let shareUrl = '';
    
    switch (platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsShareOpen(false);
  };

  return (
    <div className="w-full max-w-[720px] mx-auto bg-white min-h-[80vh] pb-24 transition-all duration-300 sm:hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-none sm:rounded-xl border-x-0 sm:border sm:border-gray-100 p-6 sm:p-12">
      
      {/* Inline AI Refinement Tools Bar */}
      {content && !isGenerating && (
        <InlineAIRefinementBar
          onRefine={handleRefine}
          isRefining={isRefining}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          historyCount={history.length - 1}
        />
      )}

      {/* Highlighted Text Selection AI Refine Bar */}
      {selectedText && (
        <div className="text-selection-bar">
          <TextSelectionRefineBar
            selectedText={selectedText}
            position={selectionPos}
            onRefineSelection={handleRefineSelection}
            onClose={() => setSelectedText('')}
            isRefiningSelection={isRefiningSelection}
          />
        </div>
      )}

      {/* Top Action & Quick Info Bar */}
      {content && (
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100 font-sans">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-medium text-gray-700">
              {content.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            <span>•</span>
            <span>
              {Math.max(1, Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200))} min read
            </span>
            {isGenerating && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5 text-amber-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Generating...
                </span>
              </>
            )}
          </div>

          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
              isCopied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-95'
            }`}
            title="Copy markdown content to clipboard"
          >
            {isCopied ? (
              <>
                <Check size={14} className="text-emerald-600 stroke-[2.5]" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={14} className="text-gray-500" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Wrapper for PDF Capture */}
      <div ref={printRef} className="bg-white">
          {/* Article Header / Cover */}
          {coverImage ? (
            <div className="mb-12 w-full animate-fade-in group -mx-6 sm:-mx-12 w-[calc(100%+3rem)] sm:w-[calc(100%+6rem)]">
              <div className="overflow-hidden shadow-sm">
                <img 
                  src={coverImage} 
                  alt="Article Cover" 
                  className="w-full h-64 md:h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <figcaption className="text-center text-sm text-gray-500 mt-3 font-sans">AI Generated Illustration</figcaption>
            </div>
          ) : isGenerating ? (
            <div className="w-full h-64 md:h-[350px] bg-gray-50 sm:rounded-lg animate-pulse flex items-center justify-center mb-10 text-gray-400">
              Generating cover image...
            </div>
          ) : null}

          <div className="">
            {/* Content Area */}
            {content ? (
                <>
                {authorProfile && onEditAuthorProfile && (
                  <ArticleAuthorHeader
                    profile={authorProfile}
                    wordCount={wordCount}
                    onEditProfile={onEditAuthorProfile}
                  />
                )}

                {/* Table of Contents for Long-Form Navigation */}
                {!isGenerating && (
                  <TableOfContents content={displayBody} />
                )}

                <article className="
                    prose prose-lg md:prose-xl max-w-none
                    font-serif text-[#242424]
                    
                    prose-p:text-[18px] md:prose-p:text-[21px] 
                    prose-p:leading-[1.58] 
                    prose-p:mb-8 
                    prose-p:font-serif 
                    prose-p:font-normal
                    prose-p:tracking-[-0.003em]
                    
                    prose-headings:font-sans 
                    prose-headings:font-bold 
                    prose-headings:tracking-tight 
                    prose-headings:text-[#242424]
                    
                    prose-h1:text-[32px] md:prose-h1:text-[46px] prose-h1:leading-[1.1] prose-h1:mb-10 prose-h1:font-extrabold
                    prose-h2:text-[26px] md:prose-h2:text-[32px] prose-h2:mt-12 prose-h2:mb-4 prose-h2:leading-[1.2]
                    prose-h3:text-[22px] md:prose-h3:text-[26px] prose-h3:mt-8 prose-h3:mb-3 prose-h3:leading-[1.2]
                    
                    prose-a:text-inherit prose-a:underline prose-a:decoration-gray-300 prose-a:underline-offset-[3px] hover:prose-a:decoration-gray-800 hover:prose-a:text-[#1a1a1a] transition-colors
                    
                    prose-strong:font-bold prose-strong:text-[#242424]
                    
                    prose-blockquote:not-italic prose-blockquote:font-serif 
                    prose-blockquote:text-[20px] md:prose-blockquote:text-[24px] 
                    prose-blockquote:leading-[1.4] 
                    prose-blockquote:text-[#242424] 
                    prose-blockquote:border-l-[3px] prose-blockquote:border-[#242424] 
                    prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:my-10 prose-blockquote:bg-transparent
                    
                    prose-img:my-10 prose-img:rounded-md prose-img:shadow-sm prose-img:w-full
                    
                    prose-code:text-[14px] prose-code:bg-[#F2F2F2] prose-code:text-[#242424] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-code:font-normal prose-code:font-mono
                    
                    prose-li:text-[18px] md:prose-li:text-[21px] prose-li:leading-[1.58] prose-li:my-2
                    prose-ul:my-8 prose-ol:my-8
                ">
                <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                        // Custom H1, H2, H3 with anchor IDs for Table of Contents navigation
                        h1: ({node, children, ...props}: any) => {
                            const text = React.Children.toArray(children).join('');
                            const id = slugifyHeading(text);
                            return <h1 id={id} className="font-sans text-[32px] md:text-[46px] font-extrabold leading-[1.1] tracking-tight text-[#242424] mb-10 scroll-mt-24" {...props}>{children}</h1>;
                        },
                        h2: ({node, children, ...props}: any) => {
                            const text = React.Children.toArray(children).join('');
                            const id = slugifyHeading(text);
                            return <h2 id={id} className="font-sans text-[26px] md:text-[32px] font-bold leading-[1.2] text-[#242424] mt-12 mb-4 scroll-mt-24" {...props}>{children}</h2>;
                        },
                        h3: ({node, children, ...props}: any) => {
                            const text = React.Children.toArray(children).join('');
                            const id = slugifyHeading(text);
                            return <h3 id={id} className="font-sans text-[22px] md:text-[26px] font-bold leading-[1.2] text-[#242424] mt-8 mb-3 scroll-mt-24" {...props}>{children}</h3>;
                        },
                        // Clean up blockquote to standard markdown if not overridden
                        blockquote: ({node, ...props}) => <blockquote {...props} />,
                        code({node, inline, className, children, ...props}: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            const isMermaid = match && match[1] === 'mermaid';
                            
                            if (isMermaid) {
                                return (
                                  <MermaidDiagram
                                    chart={String(children).replace(/\n$/, '')}
                                    onReplaceWithAIImage={handleReplaceMermaidWithImage}
                                  />
                                );
                            }

                            if (!inline && match) {
                                return (
                                    <div className="relative group rounded-md bg-[#F9F9F9] text-[#292929] p-6 overflow-x-auto my-8 text-sm font-mono leading-relaxed border border-gray-100">
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    </div>
                                );
                            }
                            
                            return (
                                <code className={`${className}`} {...props}>
                                    {children}
                                </code>
                            );
                        }
                    }}
                >
                    {displayBody}
                </ReactMarkdown>
                
                {isGenerating && (
                    <div className="flex items-center gap-2 mt-12 text-gray-300 justify-center">
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></span>
                    </div>
                )}
                </article>

                {authorProfile && onEditAuthorProfile && !isGenerating && (
                  <ArticleAuthorFooter
                    profile={authorProfile}
                    onEditProfile={onEditAuthorProfile}
                  />
                )}


                {/* Tags Section */}
                {!isGenerating && displayTags.length > 0 && (
                    <div className="mt-12 mb-6 pt-8 border-t border-gray-100">
                        <h4 className="flex items-center gap-2 text-sm font-sans font-bold text-gray-900 uppercase tracking-wider mb-4">
                            <Tag size={16} />
                            Suggested Keywords
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {displayTags.map((tag, idx) => (
                                <span key={idx} className="bg-[#F2F2F2] text-[#242424] px-4 py-2 rounded-full text-sm font-sans font-medium hover:bg-gray-200 transition-colors cursor-default">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-gray-300 border border-dashed border-gray-200 rounded-xl">
                    <div className="w-16 h-16 mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </div>
                    <p className="font-sans text-sm">Your story starts here.</p>
                </div>
            )}
            </div>
      </div>

        {!isGenerating && content && (
            <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-gray-500 gap-6">
                <div className="flex gap-3 flex-wrap items-center">
                    <button 
                        onClick={() => setIsExportModalOpen(true)}
                        className="flex items-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 transition-all px-5 py-2.5 rounded-full shadow-xs active:scale-95"
                        title="Export as Markdown, Jekyll, Dev.to, HTML, TXT, JSON or PDF"
                    >
                        <Download size={16} />
                        <span className="font-sans text-sm font-semibold">Export Options</span>
                    </button>

                    <button 
                        onClick={handleDownloadPDF}
                        disabled={isPdfGenerating}
                        className={`flex items-center gap-2 text-gray-600 hover:text-black transition-colors px-4 py-2.5 hover:bg-gray-50 rounded-full border border-gray-200 hover:border-gray-300 ${isPdfGenerating ? 'opacity-50 cursor-wait' : ''}`}
                        title="Quick Download PDF"
                    >
                        <FileText size={16} />
                        <span className="font-sans text-sm font-medium">
                            {isPdfGenerating ? 'Saving...' : 'PDF'}
                        </span>
                    </button>
                    
                    <button 
                        onClick={handleCopy}
                        className={`flex items-center gap-2 transition-colors px-4 py-2.5 rounded-full border ${
                          isCopied 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs' 
                            : 'text-gray-600 hover:text-black hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                        title="Copy markdown content to clipboard"
                    >
                        {isCopied ? <Check size={16} className="text-emerald-600 stroke-[2.5]" /> : <Copy size={16} />}
                        <span className="font-sans text-sm font-medium">{isCopied ? 'Copied!' : 'Copy'}</span>
                    </button>

                    <div className="relative">
                        <button 
                            onClick={() => setIsShareOpen(!isShareOpen)}
                            className={`flex items-center gap-2 text-gray-600 hover:text-black transition-colors px-4 py-2.5 rounded-full border border-gray-200 hover:border-gray-300 ${isShareOpen ? 'bg-gray-50 text-black border-gray-300' : 'hover:bg-gray-50'}`}
                        >
                            <Share2 size={16} />
                            <span className="font-sans text-sm font-medium">Share</span>
                        </button>

                        {isShareOpen && (
                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white p-2 rounded-xl shadow-xl border border-gray-100 z-10 animate-fade-in min-w-max">
                                <button 
                                    onClick={() => handleShare('twitter')} 
                                    className="p-2 hover:bg-gray-50 rounded-full text-gray-500 hover:text-[#1DA1F2] transition-colors"
                                    title="Share on Twitter"
                                >
                                    <Twitter size={20} />
                                </button>
                                <button 
                                    onClick={() => handleShare('linkedin')} 
                                    className="p-2 hover:bg-gray-50 rounded-full text-gray-500 hover:text-[#0A66C2] transition-colors"
                                    title="Share on LinkedIn"
                                >
                                    <Linkedin size={20} />
                                </button>
                                <button 
                                    onClick={() => handleShare('facebook')} 
                                    className="p-2 hover:bg-gray-50 rounded-full text-gray-500 hover:text-[#1877F2] transition-colors"
                                    title="Share on Facebook"
                                >
                                    <Facebook size={20} />
                                </button>
                                {/* Arrow */}
                                <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45"></div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-[10px] uppercase tracking-widest font-semibold text-gray-300">
                    Drafted with Mediumizer
                </div>
            </div>
        )}

        {/* Multi-Format Export Modal */}
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          content={content}
          coverImage={coverImage}
          tags={displayTags}
          authorProfile={authorProfile}
          wordCount={wordCount}
          readTimeMinutes={Math.max(1, Math.ceil(wordCount / 200))}
          printRef={printRef}
        />
    </div>
  );
};

export default ArticlePreview;