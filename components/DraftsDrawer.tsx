import React, { useState } from 'react';
import {
  X,
  Clock,
  Trash2,
  Copy,
  Check,
  FileText,
  Search,
  Download,
  Plus,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { SavedDraft } from '../types';

interface DraftsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: SavedDraft[];
  activeDraftId: string | null;
  onSelectDraft: (draft: SavedDraft) => void;
  onDeleteDraft: (id: string) => void;
  onClearAll: () => void;
  onNewArticle: () => void;
}

export const DraftsDrawer: React.FC<DraftsDrawerProps> = ({
  isOpen,
  onClose,
  drafts,
  activeDraftId,
  onSelectDraft,
  onDeleteDraft,
  onClearAll,
  onNewArticle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);

  if (!isOpen) return null;

  const filteredDrafts = drafts.filter((d) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = d.title.toLowerCase().includes(term);
    const contentMatch = d.content.toLowerCase().includes(term);
    const topicMatch = d.config?.topic.toLowerCase().includes(term);
    return titleMatch || contentMatch || topicMatch;
  });

  const handleCopy = async (e: React.MouseEvent, draft: SavedDraft) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(draft.content);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = draft.content;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedId(draft.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy draft:', err);
    }
  };

  const handleExportMd = (e: React.MouseEvent, draft: SavedDraft) => {
    e.stopPropagation();
    const blob = new Blob([draft.content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedTitle = draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    link.download = `${sanitizedTitle || 'article-draft'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-gray-200">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-700">
                <Clock size={16} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Drafts & History</h2>
                <p className="text-xs text-gray-500">{drafts.length} saved article{drafts.length === 1 ? '' : 's'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onNewArticle();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs font-medium transition-colors shadow-xs"
                title="Start a new article draft"
              >
                <Plus size={14} />
                <span>New</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close panel"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Search bar */}
          {drafts.length > 0 && (
            <div className="p-4 border-b border-gray-100 bg-white">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search saved articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-gray-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Drafts List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {drafts.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                  <BookOpen size={20} />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">No drafts saved yet</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mb-6">
                  Articles you generate will automatically be saved here so you can review or re-edit anytime.
                </p>
                <button
                  onClick={() => {
                    onNewArticle();
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-full text-xs font-medium hover:bg-gray-800 transition-colors"
                >
                  <Sparkles size={14} className="text-yellow-400" />
                  Generate First Article
                </button>
              </div>
            ) : filteredDrafts.length === 0 ? (
              <div className="text-center py-12 px-4 text-gray-500">
                <p className="text-xs">No drafts matching "{searchTerm}"</p>
              </div>
            ) : (
              filteredDrafts.map((draft) => {
                const isActive = draft.id === activeDraftId;
                const snippet = draft.content
                  .replace(/^#\s+.*$/m, '')
                  .replace(/[*_#`[\]()]/g, '')
                  .trim()
                  .slice(0, 110);

                return (
                  <div
                    key={draft.id}
                    onClick={() => {
                      onSelectDraft(draft);
                      onClose();
                    }}
                    className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-green-50/40 border-green-300 ring-1 ring-green-400/30 shadow-xs'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-green-800 transition-colors">
                        {draft.title || 'Untitled Article'}
                      </h4>
                      {draft.coverImage && (
                        <img
                          src={draft.coverImage}
                          alt=""
                          className="w-10 h-10 rounded-md object-cover border border-gray-200 shrink-0"
                        />
                      )}
                    </div>

                    {snippet && (
                      <p className="text-[11px] text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                        {snippet}...
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span>{formatRelativeTime(draft.updatedAt)}</span>
                        <span>•</span>
                        <span>{draft.wordCount} words</span>
                        {draft.config?.tone && (
                          <>
                            <span>•</span>
                            <span className="capitalize px-1.5 py-0.5 rounded-xs bg-gray-100 text-gray-600 font-medium">
                              {draft.config.tone}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleCopy(e, draft)}
                          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          title="Copy Markdown"
                        >
                          {copiedId === draft.id ? (
                            <Check size={13} className="text-emerald-600" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>

                        <button
                          onClick={(e) => handleExportMd(e, draft)}
                          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          title="Export .md file"
                        >
                          <Download size={13} />
                        </button>

                        {deleteConfirmId === draft.id ? (
                          <div className="flex items-center gap-1 bg-red-50 p-0.5 rounded-lg border border-red-200" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteDraft(draft.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-[10px] font-bold transition-all shadow-2xs"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(null);
                              }}
                              className="p-0.5 text-gray-400 hover:text-gray-700 rounded-md"
                              title="Cancel"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(draft.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete draft"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {drafts.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              {isConfirmingClearAll ? (
                <div className="flex items-center justify-between gap-2 p-2 bg-red-50 rounded-xl border border-red-200">
                  <span className="text-[11px] font-semibold text-red-800">Clear all saved drafts?</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsConfirmingClearAll(false)}
                      className="px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:text-gray-900 bg-white rounded-lg border border-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClearAll();
                        setIsConfirmingClearAll(false);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs"
                    >
                      Confirm Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{drafts.length} draft{drafts.length === 1 ? '' : 's'} stored locally</span>
                  <button
                    onClick={() => setIsConfirmingClearAll(true)}
                    className="text-red-600 hover:text-red-700 font-semibold text-xs hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    <span>Clear all history</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DraftsDrawer;
