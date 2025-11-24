export interface ArticleConfig {
  topic: string;
  tone: ToneOption;
  length: LengthOption;
  language: LanguageOption;
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

export interface GeneratedArticle {
  title: string;
  content: string; // Markdown
  coverImageBase64?: string;
}