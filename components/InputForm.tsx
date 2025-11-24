import React, { useState } from 'react';
import { ArticleConfig, ToneOption, LengthOption, LanguageOption } from '../types';
import { Sparkles, PenTool, Globe } from 'lucide-react';

interface InputFormProps {
  onSubmit: (config: ArticleConfig) => void;
  isGenerating: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isGenerating }) => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<ToneOption>(ToneOption.PROFESSIONAL);
  const [length, setLength] = useState<LengthOption>(LengthOption.MEDIUM);
  const [language, setLanguage] = useState<LanguageOption>(LanguageOption.ENGLISH);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit({ topic, tone, length, language });
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
      <div className="mb-6">
        <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center mb-4">
            <PenTool className="text-white" size={20} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Draft your story</h2>
        <p className="text-gray-500 mt-2">Enter a topic, we'll handle the prose.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
            What do you want to write about?
          </label>
          <textarea
            id="topic"
            rows={4}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all resize-none text-gray-800 placeholder-gray-400"
            placeholder="e.g. The future of sustainable architecture in urban environments..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isGenerating}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <div className="relative">
              <div className="absolute left-3 top-3.5 pointer-events-none text-gray-500">
                <Globe size={16} />
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageOption)}
                disabled={isGenerating}
                className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-black outline-none"
              >
                {Object.values(LanguageOption).map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
            <div className="relative">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as ToneOption)}
                disabled={isGenerating}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-black outline-none"
              >
                {Object.values(ToneOption).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
            <div className="relative">
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as LengthOption)}
                disabled={isGenerating}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-black outline-none"
              >
                {Object.values(LengthOption).map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!topic.trim() || isGenerating}
          className={`w-full py-4 px-6 rounded-xl flex items-center justify-center gap-2 text-white font-medium transition-all ${
            !topic.trim() || isGenerating
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-black hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Crafting...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Generate Article</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;