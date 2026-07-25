export interface ArticleConfig {
  topic: string;
  source: ArticleSource;
  tone: ToneOption;
  length: LengthOption;
  language: LanguageOption;
}

export enum ArticleSource {
  TOPIC = 'Topic',
  YOUTUBE = 'YouTube',
  OUTLINE = 'Outline'
}

export enum ToneOption {
  PROFESSIONAL = 'Professional',
  CASUAL = 'Casual',
  OPINIONATED = 'Opinionated',
  STORYTELLING = 'Storytelling',
  INSTRUCTIONAL = 'Instructional'
}

export enum LengthOption {
  SHORT = 'Short (500 words)',
  MEDIUM = 'Medium (1000 words)',
  LONG = 'Long (2000 words)'
}

export enum LanguageOption {
  ENGLISH = 'English',
  VIETNAMESE = 'Vietnamese'
}

export interface SavedDraft {
  id: string;
  title: string;
  content: string;
  coverImage: string | null;
  createdAt: number;
  updatedAt: number;
  config?: ArticleConfig;
  wordCount: number;
}
