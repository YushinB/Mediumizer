import React, { useState, useRef, useEffect } from 'react';
import InputForm from './components/InputForm';
import ArticlePreview from './components/ArticlePreview';
import DraftsDrawer from './components/DraftsDrawer';
import { streamArticleGeneration, generateCoverImage } from './services/geminiService';
import { ArticleConfig, SavedDraft } from './types';
import { getSavedDrafts, saveDraft, deleteDraft, clearAllDrafts } from './utils/draftStorage';
import { Clock, Plus, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [articleContent, setArticleContent] = useState<string>('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // Local Drafts State
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Load drafts on mount
  useEffect(() => {
    const loaded = getSavedDrafts();
    setDrafts(loaded);
  }, []);

  const handleGenerate = async (config: ArticleConfig) => {
    setIsGenerating(true);
    setArticleContent('');
    setCoverImage(null);
    setActiveDraftId(null);

    // Scroll to preview on mobile
    if (window.innerWidth < 768 && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    let accumulatedContent = '';
    let generatedCover: string | null = null;

    try {
      // 1. Start generating image in background
      const imagePromise = generateCoverImage(config.topic);

      // 2. Start streaming text
      await streamArticleGeneration(config, (chunk) => {
        accumulatedContent = chunk;
        setArticleContent(chunk);
      });

      // 3. Wait for image to finish
      generatedCover = await imagePromise;
      if (generatedCover) {
        setCoverImage(generatedCover);
      }

      // 4. Automatically save generated article as a draft
      if (accumulatedContent.trim()) {
        const saved = saveDraft(accumulatedContent, generatedCover, config);
        setActiveDraftId(saved.id);
        setDrafts(getSavedDrafts());
      }
    } catch (error) {
      console.error('Workflow error:', error);
      const errText = accumulatedContent + '\n\n**Error: Something went wrong during generation. Please try again.**';
      setArticleContent(errText);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectDraft = (draft: SavedDraft) => {
    setArticleContent(draft.content);
    setCoverImage(draft.coverImage);
    setActiveDraftId(draft.id);

    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteDraft = (id: string) => {
    const updated = deleteDraft(id);
    setDrafts(updated);
    if (activeDraftId === id) {
      setActiveDraftId(null);
    }
  };

  const handleClearAllDrafts = () => {
    clearAllDrafts();
    setDrafts([]);
    setActiveDraftId(null);
  };

  const handleNewArticle = () => {
    setArticleContent('');
    setCoverImage(null);
    setActiveDraftId(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-serif font-black tracking-tighter text-gray-900">Mediumizer</span>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                AI Article Studio
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Drafts & History Trigger Button */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors relative"
                title="View saved drafts and generation history"
              >
                <Clock size={15} className="text-gray-600" />
                <span>Drafts & History</span>
                {drafts.length > 0 && (
                  <span className="ml-0.5 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {drafts.length}
                  </span>
                )}
              </button>

              <button
                onClick={handleNewArticle}
                className="hidden sm:inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-green-700 transition-colors shadow-xs"
              >
                <Plus size={14} />
                <span>New Blank</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Input */}
          <div className="w-full lg:w-1/3 order-1">
             <div className="lg:sticky lg:top-24">
                <InputForm onSubmit={handleGenerate} isGenerating={isGenerating} />
                
                <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
                    <p className="font-semibold mb-1">Tip:</p>
                    <p>Be specific with your topic. Instead of "Tech", try "The impact of quantum computing on modern cryptography".</p>
                </div>
             </div>
          </div>

          {/* Right Column: Preview */}
          <div ref={scrollRef} className="w-full lg:w-2/3 order-2 min-h-[80vh] border-l border-gray-100 lg:pl-12">
            <ArticlePreview 
              content={articleContent} 
              coverImage={coverImage} 
              isGenerating={isGenerating}
            />
          </div>

        </div>
      </main>

      {/* Local Drafts & History Drawer */}
      <DraftsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        drafts={drafts}
        activeDraftId={activeDraftId}
        onSelectDraft={handleSelectDraft}
        onDeleteDraft={handleDeleteDraft}
        onClearAll={handleClearAllDrafts}
        onNewArticle={handleNewArticle}
      />
    </div>
  );
};

export default App;

