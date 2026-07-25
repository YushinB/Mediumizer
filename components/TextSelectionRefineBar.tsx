import React, { useState, useEffect } from 'react';
import { Sparkles, Scissors, TrendingUp, Wand2, X, Check, Loader2 } from 'lucide-react';

interface TextSelectionRefineBarProps {
  selectedText: string;
  position: { top: number; left: number };
  onRefineSelection: (action: string, customInstruction?: string) => void;
  onClose: () => void;
  isRefiningSelection: boolean;
}

export const TextSelectionRefineBar: React.FC<TextSelectionRefineBarProps> = ({
  selectedText,
  position,
  onRefineSelection,
  onClose,
  isRefiningSelection,
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  if (!selectedText.trim()) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    onRefineSelection('custom', customPrompt.trim());
    setShowCustom(false);
  };

  return (
    <div
      style={{
        top: `${Math.max(10, position.top - 60)}px`,
        left: `${Math.max(10, position.left)}px`,
      }}
      className="fixed z-40 transform -translate-x-1/2 bg-gray-900 border border-gray-700 text-white rounded-2xl shadow-2xl p-2 font-sans flex flex-col gap-2 animate-fade-in max-w-sm"
    >
      <div className="flex items-center justify-between px-2 pt-1 border-b border-gray-800 pb-1.5 text-[11px] font-semibold text-gray-300">
        <div className="flex items-center gap-1.5 text-green-400">
          <Sparkles size={13} />
          <span>Refine Highlighted Text ({selectedText.trim().split(/\s+/).length} words)</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-0.5 rounded-full"
        >
          <X size={12} />
        </button>
      </div>

      {!showCustom ? (
        <div className="flex items-center gap-1 flex-wrap p-1">
          <button
            disabled={isRefiningSelection}
            onClick={() => onRefineSelection('grammar')}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            title="Fix grammar & polish style"
          >
            <Sparkles size={12} className="text-yellow-400" />
            <span>Polish</span>
          </button>

          <button
            disabled={isRefiningSelection}
            onClick={() => onRefineSelection('shorten')}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            title="Make selection concise"
          >
            <Scissors size={12} className="text-purple-400" />
            <span>Shorten</span>
          </button>

          <button
            disabled={isRefiningSelection}
            onClick={() => onRefineSelection('expand')}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            title="Add detail to selection"
          >
            <TrendingUp size={12} className="text-blue-400" />
            <span>Expand</span>
          </button>

          <button
            disabled={isRefiningSelection}
            onClick={() => setShowCustom(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Wand2 size={12} />
            <span>Custom</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleCustomSubmit} className="p-1">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="How to rewrite selection? (e.g. make humorous)..."
            className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-xs text-white placeholder:text-gray-500 focus:outline-hidden focus:ring-1 focus:ring-green-500 mb-2"
            autoFocus
          />
          <div className="flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={() => setShowCustom(false)}
              className="text-gray-400 hover:text-white px-2 py-0.5"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!customPrompt.trim() || isRefiningSelection}
              className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded-md text-xs font-semibold disabled:opacity-40"
            >
              Apply
            </button>
          </div>
        </form>
      )}

      {isRefiningSelection && (
        <div className="flex items-center gap-2 text-xs text-green-400 px-2 pb-1 animate-pulse">
          <Loader2 size={12} className="animate-spin" />
          <span>Refine stream in progress...</span>
        </div>
      )}
    </div>
  );
};

export default TextSelectionRefineBar;
