import React, { useState, useRef } from 'react';
import InputForm from './components/InputForm';
import ArticlePreview from './components/ArticlePreview';
import { streamArticleGeneration, generateCoverImage } from './services/geminiService';
import { ArticleConfig } from './types';

const App: React.FC = () => {
  const [articleContent, setArticleContent] = useState<string>('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (config: ArticleConfig) => {
    setIsGenerating(true);
    setArticleContent('');
    setCoverImage(null);

    // Scroll to preview on mobile
    if (window.innerWidth < 768 && scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    try {
      // 1. Start generating image in background
      const imagePromise = generateCoverImage(config.topic);
      
      // 2. Start streaming text
      await streamArticleGeneration(config, (chunk) => {
        setArticleContent(chunk);
      });

      // 3. Wait for image to finish (if text finished first)
      const imageUrl = await imagePromise;
      if (imageUrl) {
        setCoverImage(imageUrl);
      }
      
    } catch (error) {
      console.error("Workflow error:", error);
      setArticleContent(prev => prev + "\n\n**Error: Something went wrong during generation. Please try again.**");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-serif font-black tracking-tighter text-gray-900">Mediumizer</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900">Sign In</a>
              <button className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition-colors">
                Get Started
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
    </div>
  );
};

export default App;
