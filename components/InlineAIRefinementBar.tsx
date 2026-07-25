import React, { useState } from 'react';
import {
  Wand2,
  Zap,
  TrendingUp,
  Scissors,
  CheckCheck,
  Type,
  PlusCircle,
  RotateCcw,
  RotateCw,
  Sparkles,
  MessageSquare,
  ChevronDown,
  X,
  Loader2
} from 'lucide-react';

export interface RefinementOptions {
  action: 'punchy' | 'expand' | 'shorten' | 'grammar' | 'tone' | 'add_subheadings' | 'add_examples' | 'custom';
  customInstruction?: string;
  targetTone?: string;
}

interface InlineAIRefinementBarProps {
  onRefine: (options: RefinementOptions) => void;
  isRefining: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  historyCount: number;
}

export const InlineAIRefinementBar: React.FC<InlineAIRefinementBarProps> = ({
  onRefine,
  isRefining,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  historyCount,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customText, setCustomText] = useState('');
  const [showToneDropdown, setShowToneDropdown] = useState(false);
  const [selectedTone, setSelectedTone] = useState('Thought Leader');

  const presetChips = [
    {
      id: 'punchy' as const,
      label: 'Make Punchy',
      icon: Zap,
      color: 'hover:border-amber-300 hover:bg-amber-50 text-amber-900 bg-amber-50/50 border-amber-200/80',
      description: 'More engaging and bold'
    },
    {
      id: 'expand' as const,
      label: 'Expand & Deepen',
      icon: TrendingUp,
      color: 'hover:border-blue-300 hover:bg-blue-50 text-blue-900 bg-blue-50/50 border-blue-200/80',
      description: 'Add depth and insights'
    },
    {
      id: 'shorten' as const,
      label: 'Simplify & Shorten',
      icon: Scissors,
      color: 'hover:border-purple-300 hover:bg-purple-50 text-purple-900 bg-purple-50/50 border-purple-200/80',
      description: 'Concise & clear'
    },
    {
      id: 'grammar' as const,
      label: 'Polish & Fix Grammar',
      icon: CheckCheck,
      color: 'hover:border-emerald-300 hover:bg-emerald-50 text-emerald-900 bg-emerald-50/50 border-emerald-200/80',
      description: 'Improve flow & accuracy'
    },
    {
      id: 'add_subheadings' as const,
      label: 'Add Subheadings',
      icon: Type,
      color: 'hover:border-indigo-300 hover:bg-indigo-50 text-indigo-900 bg-indigo-50/50 border-indigo-200/80',
      description: 'Improve scannability'
    },
    {
      id: 'add_examples' as const,
      label: 'Add Examples',
      icon: PlusCircle,
      color: 'hover:border-rose-300 hover:bg-rose-50 text-rose-900 bg-rose-50/50 border-rose-200/80',
      description: 'Real-world case studies'
    },
  ];

  const toneOptions = [
    'Thought Leader',
    'Storyteller',
    'Conversational & Warm',
    'Academic & Rigorous',
    'Persuasive & Bold',
    'Journalistic',
    'Witty & Playful'
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim() || isRefining) return;
    onRefine({
      action: 'custom',
      customInstruction: customText.trim(),
    });
    setCustomText('');
    setShowCustomModal(false);
  };

  const handleToneSelect = (tone: string) => {
    setSelectedTone(tone);
    setShowToneDropdown(false);
    onRefine({
      action: 'tone',
      targetTone: tone,
    });
  };

  return (
    <div className="mb-8 p-4 bg-gradient-to-r from-gray-900 via-slate-900 to-zinc-900 text-white rounded-2xl shadow-lg border border-gray-800 font-sans">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30">
            <Wand2 size={16} />
          </div>
          <div>
            <span className="text-xs font-bold tracking-wide uppercase text-gray-200">
              Inline AI Refinement Tools
            </span>
            <span className="ml-2 text-[10px] text-green-400 font-medium px-2 py-0.5 rounded-full bg-green-950/80 border border-green-800/50">
              Powered by Gemini 3.6
            </span>
          </div>
        </div>

        {/* Undo / Redo History Controls */}
        <div className="flex items-center gap-1.5 bg-gray-800/80 p-1 rounded-xl border border-gray-700/60">
          <button
            onClick={onUndo}
            disabled={!canUndo || isRefining}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Undo AI Refinement"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo || isRefining}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Redo AI Refinement"
          >
            <RotateCw size={14} />
          </button>
          {historyCount > 0 && (
            <span className="px-2 text-[10px] font-mono text-gray-400 border-l border-gray-700">
              {historyCount} edit{historyCount === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </div>

      {/* Main Refinement Preset Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {presetChips.map((chip) => {
          const Icon = chip.icon;
          return (
            <button
              key={chip.id}
              disabled={isRefining}
              onClick={() => onRefine({ action: chip.id })}
              className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 active:scale-95 disabled:opacity-50 ${chip.color}`}
              title={chip.description}
            >
              <Icon size={14} className="shrink-0 transition-transform group-hover:scale-110" />
              <span>{chip.label}</span>
            </button>
          );
        })}

        {/* Tone Selector Dropdown */}
        <div className="relative">
          <button
            disabled={isRefining}
            onClick={() => setShowToneDropdown(!showToneDropdown)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles size={14} className="text-yellow-400" />
            <span>Tone: {selectedTone}</span>
            <ChevronDown size={12} className="text-gray-400" />
          </button>

          {showToneDropdown && (
            <div className="absolute left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-1.5 z-30 animate-fade-in font-sans">
              <div className="px-2 py-1 text-[10px] uppercase tracking-wider font-semibold text-gray-400 border-b border-gray-800 mb-1">
                Select Tone
              </div>
              {toneOptions.map((tone) => (
                <button
                  key={tone}
                  onClick={() => handleToneSelect(tone)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedTone === tone
                      ? 'bg-green-600/30 text-green-300 font-semibold'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom Prompt Button */}
        <button
          disabled={isRefining}
          onClick={() => setShowCustomModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-green-600 hover:bg-green-500 text-white transition-all shadow-xs active:scale-95 disabled:opacity-50"
        >
          <MessageSquare size={14} />
          <span>Custom Instruction...</span>
        </button>
      </div>

      {/* Refinement Progress Streaming Banner */}
      {isRefining && (
        <div className="mt-3 pt-2.5 border-t border-gray-800/80 flex items-center justify-between text-xs text-green-400 animate-pulse">
          <div className="flex items-center gap-2">
            <Loader2 size={14} className="animate-spin text-green-400" />
            <span className="font-medium">Refining article with Gemini... Streaming updates live below.</span>
          </div>
        </div>
      )}

      {/* Custom Instruction Modal / Drawer Overlay */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-gray-900 border border-gray-800 text-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setShowCustomModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30">
                <Wand2 size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Custom AI Refinement</h3>
                <p className="text-xs text-gray-400">Instruct Gemini on how to transform or enrich your article.</p>
              </div>
            </div>

            <form onSubmit={handleCustomSubmit}>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="E.g., Add a key takeaway summary box at the top, make the conclusion more inspiring, or add a section about future trends..."
                rows={4}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-gray-100 focus:outline-hidden focus:ring-2 focus:ring-green-500/40 focus:border-green-500 placeholder:text-gray-600 mb-4"
                autoFocus
              />

              <div className="flex items-center justify-between">
                <div className="flex gap-1.5 flex-wrap">
                  {['Add Call-to-Action', 'Make Punchier', 'Add Analogies'].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setCustomText(sug)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!customText.trim() || isRefining}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-40"
                  >
                    <Wand2 size={14} />
                    <span>Apply Refinement</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InlineAIRefinementBar;
