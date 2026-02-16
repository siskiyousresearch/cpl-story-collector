# CPL Story Collector

An AI-powered platform that collects Credit for Prior Learning (CPL) success stories from community college students through guided conversational interviews. Students share their CPL experience with an AI interviewer, which then generates a polished success story for review and publication.

## Features

- **AI-Guided Interviews** — Conversational AI interviewer that walks students through their CPL journey with thoughtful, context-aware questions
- **Automatic Story Generation** — AI drafts a ~150-word success story from the interview transcript
- **Story Review & Editing** — Students can review, edit, and approve their generated story before publishing
- **Photo Upload** — Students can attach a photo to accompany their story
- **Multi-Step Flow** — Welcome → Interview → Review → Success, with smooth transitions and progress tracking

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, shadcn/ui (Radix), Framer Motion, Wouter
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **AI:** OpenAI API (GPT-4o for interviews and story generation)
- **File Uploads:** Multer for student photo uploads

## Prerequisites

- Node.js 20+
- PostgreSQL database
- OpenAI API key

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
OPENAI_API_KEY=your-openai-api-key
PORT=5000
```

## Getting Started

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`.

## Build & Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
client/                 # React frontend
  src/
    components/         # UI components (shadcn/ui)
    pages/              # Route pages (welcome, interview, review, success)
    lib/                # Utilities, query client, story context
    hooks/              # Custom React hooks
server/                 # Express backend
  ai.ts                 # OpenAI integration (interview + story generation)
  routes.ts             # API routes (conversations, stories, photo upload)
  storage.ts            # Database access layer
  index.ts              # Server entry point
  static.ts             # Static file serving
shared/
  schema.ts             # Drizzle database schema and types
public/                 # Static assets
```

## Database Schema

- **students** — Student name and email
- **conversations** — Interview message history (stored as JSON), linked to student and generated story
- **stories** — AI-generated story content, photo URL, approval status
- **users** — Admin authentication

## How It Works

1. Student enters their name on the welcome page
2. AI interviewer asks about their CPL experience — what prior learning earned credit, how it impacted their journey, and advice for others
3. After gathering enough information, the AI generates a success story from the transcript
4. Student reviews the draft, can edit it, optionally upload a photo, and approve for publication

## License

MIT
