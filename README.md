# Mediumizer

Mediumizer is a full-stack AI article studio for creating Medium-style long-form content.
It combines a React front end with an Express server and Google Gemini APIs to:

- generate complete articles (streamed in real time),
- build structured outlines,
- adapt YouTube topics into blog posts,
- generate cover images,
- refine full articles or selected text with inline AI editing,
- export in multiple publishing formats.

## Features

- Real-time article streaming via Server-Sent Events (SSE).
- Multiple content modes:
  - Topic to full article
  - Topic to outline
  - YouTube URL/topic to article (with search tool support)
- Language support: English and Vietnamese.
- Tone and length controls.
- AI cover image generation with automatic fallback image.
- Mermaid diagram rendering inside generated markdown.
- Convert Mermaid diagrams into AI/editorial illustrations.
- Inline AI refinement toolbar (rewrite, expand, shorten, grammar, tone, custom prompts).
- Selected-text refinement for targeted edits.
- Draft auto-save and history in browser localStorage.
- Author profile customization (name, bio, avatar, publication metadata).
- Export options:
  - Markdown
  - Jekyll/Hugo markdown (with front matter)
  - Dev.to/Hashnode markdown
  - HTML
  - TXT
  - JSON bundle
  - PDF

## Tech Stack

- Frontend: React 19 + TypeScript
- Backend: Express 5 + TypeScript
- Build/Dev: Vite, tsx, esbuild
- AI: @google/genai (Gemini)
- Markdown rendering: react-markdown, remark-math, rehype-katex
- Diagrams: mermaid
- PDF/Image helpers: jspdf, html2canvas

## Project Structure

```text
.
|-- App.tsx
|-- server.ts
|-- index.tsx
|-- index.css
|-- types.ts
|-- components/
|-- services/
|-- utils/
|-- vite.config.ts
|-- package.json
`-- .env.example
```

## Prerequisites

- Node.js 18+ (Node.js 20+ recommended)
- npm (or bun/pnpm/yarn if preferred)
- A valid Gemini API key

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, if `cp` is unavailable:

```powershell
Copy-Item .env.example .env
```

3. Add your Gemini API key to `.env`:

```env
GEMINI_API_KEY=your_api_key_here
```

4. Start development server:

```bash
npm run dev
```

5. Open:

- http://localhost:3000

## Environment Variables

- `GEMINI_API_KEY` (required): Gemini API key used on the server.

Notes:

- The server reads `GEMINI_API_KEY` (and also checks `API_KEY` as fallback).
- Vite config maps `GEMINI_API_KEY` into `process.env.*` defines, but article and image generation routes are server-side.

## Available Scripts

- `npm run dev`
  - Runs the Express + Vite middleware dev server via `tsx server.ts`.
- `npm run build`
  - Builds frontend with Vite and bundles server with esbuild to `dist/server.cjs`.
- `npm run start`
  - Runs production server from `dist/server.cjs`.

## How It Works

1. User configures topic/source/tone/length/language in the UI.
2. Frontend calls `POST /api/generate-article`.
3. Server sends streamed AI text chunks (SSE) back to the UI.
4. Frontend renders markdown progressively while generating cover image in parallel.
5. Completed result is auto-saved as a draft in localStorage.
6. User can refine full text or selected snippets via `POST /api/refine-article`.
7. User can export in chosen format from export modal.

## API Endpoints

### `POST /api/generate-article`

Request body (example):

```json
{
  "topic": "The future of sustainable architecture",
  "source": "Topic",
  "tone": "Professional",
  "length": "Medium (1000 words)",
  "language": "English"
}
```

Response:

- `text/event-stream` with incremental `data: {"text":"..."}` frames
- final frame includes `{"done":true}`

### `POST /api/generate-cover`

Request body:

```json
{
  "topic": "Your topic"
}
```

Response:

```json
{
  "imageUrl": "data:image/... or https://picsum.photos/...",
  "fallback": true
}
```

### `POST /api/refine-article`

Request body (example):

```json
{
  "content": "markdown text to refine",
  "action": "expand",
  "customInstruction": "optional",
  "targetTone": "Thought Leader",
  "fullArticle": "optional full context"
}
```

Response:

- `text/event-stream` with incremental refined text chunks

## Local Data Storage

Browser localStorage keys:

- `mediumizer_article_drafts`
- `mediumizer_author_profile`

Drafts include article content, title, timestamps, optional config, cover image, and word count.

## Production Build

```bash
npm run build
npm run start
```

This serves the static frontend from `dist` and runs API routes from the bundled server.

## Troubleshooting

- Error: `GEMINI_API_KEY environment variable is not set.`
  - Ensure `.env` exists and contains a valid key.
- Empty/failed image generation:
  - App falls back to a deterministic Picsum image URL.
- Stream stops unexpectedly:
  - Check terminal logs for server-side Gemini/API errors.

## Notes

- This project uses markdown-first article generation and can include Mermaid and LaTeX in output.
- Print styles are configured in `index.css` for cleaner PDF/print exports.
