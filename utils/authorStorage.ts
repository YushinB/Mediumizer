import { AuthorProfile } from '../types';

const AUTHOR_STORAGE_KEY = 'mediumizer_author_profile';

export const DEFAULT_AUTHOR_PROFILE: AuthorProfile = {
  name: 'Alex Rivera',
  username: '@alexrivera',
  tagline: 'Tech & AI Columnist',
  bio: 'Exploring generative AI, human-computer interaction, and modern software craft. Writing weekly deep dives for top publications.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  publicationName: 'Towards AI & Technology',
  isMediumMember: true,
  followersCount: '14.2K',
  publishDate: 'Today',
};

export const AVATAR_PRESETS = [
  {
    name: 'Editorial Woman',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Tech Guy',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Creative Writer',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Thought Leader',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Minimalist Abstract',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  },
];

export const getSavedAuthorProfile = (): AuthorProfile => {
  try {
    const raw = localStorage.getItem(AUTHOR_STORAGE_KEY);
    if (!raw) return DEFAULT_AUTHOR_PROFILE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_AUTHOR_PROFILE, ...parsed };
  } catch (error) {
    console.error('Failed to load author profile:', error);
    return DEFAULT_AUTHOR_PROFILE;
  }
};

export const saveAuthorProfile = (profile: AuthorProfile): AuthorProfile => {
  try {
    localStorage.setItem(AUTHOR_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save author profile:', error);
  }
  return profile;
};
