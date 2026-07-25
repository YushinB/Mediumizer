import React, { useState, useEffect } from 'react';
import { List, ChevronDown, ChevronRight, Bookmark } from 'lucide-react';

export interface TOCItem {
  id: string;
  text: string;
  level: number; // 1 for H1, 2 for H2, 3 for H3
}

export const slugifyHeading = (text: string): string => {
  const clean = text.replace(/[*_~`]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
  return (
    'heading-' +
    clean
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  );
};

export const parseMarkdownHeadings = (markdown: string): TOCItem[] => {
  if (!markdown) return [];

  const items: TOCItem[] = [];
  const lines = markdown.split('\n');

  lines.forEach((line) => {
    const match = line.trim().match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].trim();
      // Clean markdown tags inside heading text
      const cleanText = rawText
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1');

      if (cleanText) {
        items.push({
          id: slugifyHeading(cleanText),
          text: cleanText,
          level,
        });
      }
    }
  });

  return items;
};

interface TableOfContentsProps {
  content: string;
  className?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content, className = '' }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeId, setActiveId] = useState<string>('');
  const headings = parseMarkdownHeadings(content);

  // Set up intersection observer for tracking active heading
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [content, headings]);

  if (headings.length === 0) return null;

  const handleScrollToHeading = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setActiveId(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // Offset for sticky navbar / header padding
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`my-8 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-5 transition-all shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-100/70 text-emerald-800 rounded-lg">
            <List size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Table of Contents
            </h4>
            <span className="text-[11px] text-slate-500">
              {headings.length} section{headings.length > 1 ? 's' : ''} in this story
            </span>
          </div>
        </div>

        <button
          type="button"
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          aria-label={isOpen ? 'Collapse Table of Contents' : 'Expand Table of Contents'}
        >
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {isOpen && (
        <nav className="mt-4 pt-3 border-t border-slate-200/60 space-y-1 max-h-[380px] overflow-y-auto font-sans">
          {headings.map((item, index) => {
            const isActive = activeId === item.id;
            const indentClass =
              item.level === 1
                ? 'pl-2 font-semibold text-slate-900'
                : item.level === 2
                ? 'pl-6 text-slate-700'
                : 'pl-10 text-slate-600 text-[12px]';

            return (
              <a
                key={`${item.id}-${index}`}
                href={`#${item.id}`}
                onClick={(e) => handleScrollToHeading(e, item.id)}
                className={`block py-1.5 pr-3 text-xs rounded-lg transition-all line-clamp-1 ${indentClass} ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-bold border-l-2 border-emerald-600'
                    : 'hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                {item.text}
              </a>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default TableOfContents;
