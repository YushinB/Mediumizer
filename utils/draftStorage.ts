import { SavedDraft, ArticleConfig } from '../types';

const STORAGE_KEY = 'mediumizer_article_drafts';

export const getSavedDrafts = (): SavedDraft[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load drafts from localStorage:', error);
    return [];
  }
};

export const saveDraft = (
  content: string,
  coverImage: string | null,
  config?: ArticleConfig,
  existingId?: string
): SavedDraft => {
  const drafts = getSavedDrafts();
  const now = Date.now();

  // Extract title from markdown H1 or first line
  const lines = content.trim().split('\n');
  let extractedTitle = 'Untitled Article';
  for (const line of lines) {
    const cleanLine = line.trim();
    if (cleanLine.startsWith('# ')) {
      extractedTitle = cleanLine.replace(/^#\s+/, '').trim();
      break;
    } else if (cleanLine.length > 0 && !cleanLine.startsWith('![')) {
      extractedTitle = cleanLine.slice(0, 60);
      break;
    }
  }

  const words = content.trim().split(/\s+/).filter(Boolean).length;

  if (existingId) {
    const index = drafts.findIndex((d) => d.id === existingId);
    if (index !== -1) {
      const updated: SavedDraft = {
        ...drafts[index],
        title: extractedTitle,
        content,
        coverImage: coverImage ?? drafts[index].coverImage,
        updatedAt: now,
        config: config ?? drafts[index].config,
        wordCount: words,
      };
      drafts[index] = updated;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
      } catch (e) {
        console.error('Failed to update draft in localStorage:', e);
      }
      return updated;
    }
  }

  // Create new draft
  const newDraft: SavedDraft = {
    id: `draft_${now}_${Math.random().toString(36).substr(2, 6)}`,
    title: extractedTitle || 'New Draft',
    content,
    coverImage,
    createdAt: now,
    updatedAt: now,
    config,
    wordCount: words,
  };

  const updatedDrafts = [newDraft, ...drafts];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDrafts));
  } catch (e) {
    console.error('Failed to save draft to localStorage:', e);
  }

  return newDraft;
};

export const deleteDraft = (id: string): SavedDraft[] => {
  const drafts = getSavedDrafts();
  const filtered = drafts.filter((d) => d.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete draft from localStorage:', e);
  }
  return filtered;
};

export const clearAllDrafts = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear drafts from localStorage:', e);
  }
};
