import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  X,
  FileCode,
  FileText,
  FileSpreadsheet,
  Globe,
  FileType,
  Printer,
  Code2,
  Sparkles
} from 'lucide-react';
import { AuthorProfile } from '../types';
import {
  ExportFormat,
  ExportArticleData,
  getArticleTitle,
  getArticleExcerpt,
  generateRawMarkdown,
  generateJekyllMarkdown,
  generateDevToMarkdown,
  generatePlainText,
  generateJSONBundle,
  generateHTMLDocument,
  generatePDFDocument,
  downloadBlob,
} from '../utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  coverImage: string | null;
  tags: string[];
  authorProfile?: AuthorProfile;
  wordCount: number;
  readTimeMinutes: number;
  printRef: React.RefObject<HTMLDivElement | null>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  content,
  coverImage,
  tags,
  authorProfile,
  wordCount,
  readTimeMinutes,
  printRef,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('md');
  const [isCopied, setIsCopied] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  if (!isOpen || !content) return null;

  const articleTitle = getArticleTitle(content);
  const slug = articleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'mediumizer-story';

  const exportData: ExportArticleData = {
    title: articleTitle,
    content,
    coverImage,
    tags,
    authorProfile,
    wordCount,
    readTimeMinutes,
  };

  const formatOptions: {
    id: ExportFormat;
    name: string;
    extension: string;
    icon: any;
    description: string;
    badge: string;
  }[] = [
    {
      id: 'md',
      name: 'Standard Markdown',
      extension: '.md',
      icon: FileCode,
      description: 'Clean Markdown content without meta headers. Perfect for Notion, Obsidian, or GitHub.',
      badge: 'Universal',
    },
    {
      id: 'jekyll',
      name: 'Jekyll / Hugo Blog',
      extension: '.md',
      icon: Code2,
      description: 'Markdown with YAML frontmatter header (title, tags, date, excerpt, header image).',
      badge: 'SSG Ready',
    },
    {
      id: 'devto',
      name: 'Dev.to / Hashnode',
      extension: '.md',
      icon: Globe,
      description: 'Frontmatter tuned specifically for Dev.to & Hashnode multi-platform cross-posting.',
      badge: 'Developer',
    },
    {
      id: 'html',
      name: 'Standalone HTML',
      extension: '.html',
      icon: FileCode,
      description: 'Self-contained HTML document styled with Medium typography & embedded CSS.',
      badge: 'Web Ready',
    },
    {
      id: 'txt',
      name: 'Plain Text',
      extension: '.txt',
      icon: FileType,
      description: 'Stripped of all Markdown tags for emails, transcriptions, or speech reading.',
      badge: 'Raw Text',
    },
    {
      id: 'json',
      name: 'JSON Story Bundle',
      extension: '.json',
      icon: FileSpreadsheet,
      description: 'Structured JSON payload including article metadata, author profile, and body content.',
      badge: 'Structured Data',
    },
    {
      id: 'pdf',
      name: 'PDF Document',
      extension: '.pdf',
      icon: FileText,
      description: 'Paginated PDF rendered with 15mm margins & smart paragraph line break detection.',
      badge: 'Print & Share',
    },
  ];

  // Get current generated preview string based on selection
  const getPreviewContent = (): string => {
    switch (selectedFormat) {
      case 'md':
        return generateRawMarkdown(exportData);
      case 'jekyll':
        return generateJekyllMarkdown(exportData);
      case 'devto':
        return generateDevToMarkdown(exportData);
      case 'html':
        return generateHTMLDocument(exportData);
      case 'txt':
        return generatePlainText(exportData);
      case 'json':
        return generateJSONBundle(exportData);
      case 'pdf':
        return `[PDF DOCUMENT EXPORT READY]\n\n• Paginated A4 layout with 15mm top/bottom/left/right margins\n• Smart whitespace-detection to prevent horizontal cut-off lines\n• Preserves author profile, cover illustration, and typography\n\nClick "Download PDF File" below or "Print / Vector PDF" for native browser vector printing.`;
      default:
        return content;
    }
  };

  const previewString = getPreviewContent();

  const handleCopyFormat = async () => {
    try {
      if (selectedFormat === 'pdf') return;
      await navigator.clipboard.writeText(previewString);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleDownloadFormat = async () => {
    if (selectedFormat === 'pdf') {
      if (!printRef.current) return;
      setIsExportingPDF(true);
      try {
        await generatePDFDocument(printRef.current, slug);
      } catch (e) {
        console.error('PDF export failed:', e);
      } finally {
        setIsExportingPDF(false);
      }
      return;
    }

    let fileContent = previewString;
    let mimeType = 'text/plain';
    let ext = '.txt';

    switch (selectedFormat) {
      case 'md':
      case 'jekyll':
      case 'devto':
        mimeType = 'text/markdown';
        ext = '.md';
        break;
      case 'html':
        mimeType = 'text/html';
        ext = '.html';
        break;
      case 'json':
        mimeType = 'application/json';
        ext = '.json';
        break;
      case 'txt':
        mimeType = 'text/plain';
        ext = '.txt';
        break;
    }

    downloadBlob(fileContent, `${slug}${ext}`, mimeType);
  };

  const handleNativePrint = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans no-print">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in my-8">
          
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-gray-900 to-zinc-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <Download size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Export & Publish Options</h3>
                <p className="text-xs text-gray-300">Choose your preferred format for publishing, archiving, or sharing.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-gray-100 min-h-[440px]">
            
            {/* Format Selection List */}
            <div className="md:col-span-5 p-5 space-y-2 bg-gray-50/50 overflow-y-auto max-h-[500px]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-2">
                Available Formats
              </div>

              {formatOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedFormat === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedFormat(opt.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-start gap-3 ${
                      isSelected
                        ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
                        : 'bg-white/80 border-gray-200/80 hover:border-gray-300 hover:bg-white'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isSelected ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-gray-900 truncate">
                          {opt.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 font-semibold shrink-0">
                          {opt.extension}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Preview & Action Panel */}
            <div className="md:col-span-7 p-6 flex flex-col justify-between bg-white">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Format Output Preview
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                      {selectedFormat.toUpperCase()}
                    </span>
                  </div>

                  {selectedFormat !== 'pdf' && (
                    <button
                      onClick={handleCopyFormat}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                        isCopied
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {isCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  )}
                </div>

                {/* Code / Text Preview Window */}
                <div className="relative rounded-xl border border-gray-800 bg-gray-950 p-4 font-mono text-xs text-emerald-400/90 h-[280px] overflow-auto shadow-inner">
                  <pre className="whitespace-pre-wrap break-words leading-relaxed font-mono">
                    {previewString}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-gray-400 truncate max-w-[200px]">
                  Filename: <strong className="text-gray-700">{slug}.{selectedFormat === 'pdf' ? 'pdf' : selectedFormat === 'html' ? 'html' : selectedFormat === 'json' ? 'json' : selectedFormat === 'txt' ? 'txt' : 'md'}</strong>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {selectedFormat === 'pdf' && (
                    <button
                      onClick={handleNativePrint}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-xs font-semibold transition-colors"
                      title="Use browser native print dialog to save vector PDF"
                    >
                      <Printer size={14} />
                      <span>Print / Vector PDF</span>
                    </button>
                  )}

                  <button
                    onClick={onClose}
                    className="px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    Close
                  </button>

                  <button
                    onClick={handleDownloadFormat}
                    disabled={isExportingPDF}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Download size={15} />
                    <span>
                      {isExportingPDF
                        ? 'Rendering PDF...'
                        : `Download ${selectedFormat.toUpperCase()} File`}
                    </span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ExportModal;
