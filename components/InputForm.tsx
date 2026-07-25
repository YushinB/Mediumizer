import React, { useState } from 'react';
import { ArticleConfig, ToneOption, LengthOption, LanguageOption, ArticleSource } from '../types';
import { Sparkles, PenTool, Globe, Youtube, Type, List } from 'lucide-react';

interface InputFormProps {
  onSubmit: (config: ArticleConfig) => void;
  isGenerating: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isGenerating }) => {
  const [inputValue, setInputValue] = useState('');
  const [source, setSource] = useState<ArticleSource>(ArticleSource.TOPIC);
  const [tone, setTone] = useState<ToneOption>(ToneOption.PROFESSIONAL);
  const [length, setLength] = useState<LengthOption>(LengthOption.MEDIUM);
  const [language, setLanguage] = useState<LanguageOption>(LanguageOption.ENGLISH);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit({ 
        topic: inputValue, // We map the input value to 'topic' property for the service
        source,
        tone, 
        length, 
        language 
      });
    }
  };

  const getPlaceholder = () => {
    switch (source) {
      case ArticleSource.TOPIC:
        return "e.g. The future of sustainable architecture in urban environments...";
      case ArticleSource.YOUTUBE:
        return "https://www.youtube.com/watch?v=...";
      case ArticleSource.OUTLINE:
        return "e.g. A comprehensive guide to machine learning for beginners...";
      default:
        return "";
    }
  };

  const getHelperText = () => {
    switch (source) {
      case ArticleSource.TOPIC:
        return "Enter a topic, we'll handle the prose.";
      case ArticleSource.YOUTUBE:
        return "Paste a YouTube link, we'll adapt the content.";
      case ArticleSource.OUTLINE:
        return "Enter a topic, we'll structure the ideas.";
      default:
        return "";
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
      <div className="mb-6">
        <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center mb-4">
            <PenTool className="text-white" size={20} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Draft your story</h2>
        <p className="text-gray-500 mt-2">
          {getHelperText()}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Source Toggle */}
        <div className="p-1 bg-gray-100 rounded-lg flex gap-1">
          <button
            type="button"
            onClick={() => { setSource(ArticleSource.TOPIC); setInputValue(''); }}
            disabled={isGenerating}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-md text-sm font-medium transition-all ${
              source === ArticleSource.TOPIC
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Type size={16} />
            Topic
          </button>
          <button
            type="button"
            onClick={() => { setSource(ArticleSource.OUTLINE); setInputValue(''); }}
            disabled={isGenerating}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-md text-sm font-medium transition-all ${
              source === ArticleSource.OUTLINE
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List size={16} />
            Outline
          </button>
          <button
            type="button"
            onClick={() => { setSource(ArticleSource.YOUTUBE); setInputValue(''); }}
            disabled={isGenerating}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-md text-sm font-medium transition-all ${
              source === ArticleSource.YOUTUBE
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Youtube size={16} />
            YouTube
          </button>
        </div>

        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
            {source === ArticleSource.YOUTUBE ? 'YouTube Video URL' : 'What do you want to write about?'}
          </label>
          <textarea
            id="topic"
            rows={source === ArticleSource.YOUTUBE ? 2 : 4}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all resize-none text-gray-800 placeholder-gray-400"
            placeholder={getPlaceholder()}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
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
          disabled={!inputValue.trim() || isGenerating}
          className={`w-full py-4 px-6 rounded-xl flex items-center justify-center gap-2 text-white font-medium transition-all ${
            !inputValue.trim() || isGenerating
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-black hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{source === ArticleSource.OUTLINE ? 'Structuring...' : 'Crafting...'}</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>{source === ArticleSource.OUTLINE ? 'Generate Outline' : 'Generate Article'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;