# CPL Story Collector

An AI-powered platform that collects Credit for Prior Learning (CPL) success stories from community college students through guided conversational interviews. Students share their CPL experience with an AI interviewer, which then generates a polished success story for review and publication.

## Features

- **AI-Guided Interviews** — Conversational AI interviewer that walks students through their CPL journey with thoughtful, context-aware questions
- **Automatic Story Generation** — AI drafts a ~150-word success story from the interview transcript
- **Story Review & Editing** — Students can review, edit, and approve their generated story before publishing
- **Photo Upload** — Students can attach a photo to accompany their story (stored in Supabase Storage)
- **Multi-Step Flow** — Welcome → Interview → Review → Success, with smooth transitions and progress tracking

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, shadcn/ui (Radix), Framer Motion, Wouter
- **API:** Vercel Serverless Functions (TypeScript)
- **Database:** PostgreSQL (Supabase) with Drizzle ORM
- **File Storage:** Supabase Storage for photo uploads
- **AI:** OpenAI API (GPT-4o for interviews and story generation)

## Prerequisites

- Node.js 20+
- Supabase project (database + storage)
- OpenAI API key
- Vercel account (for deployment)

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
OPENAI_API_KEY=your-openai-api-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Getting Started

```bash
# Install dependencies
npm install

# Push database schema to Supabase
npm run db:push

# Start local dev server (uses Vercel CLI)
npm run dev
```

## Deployment

This project is configured for Vercel:

1. Connect your GitHub repo to Vercel
2. Set environment variables in the Vercel dashboard
3. Deploy — Vercel will build the frontend and deploy the API routes automatically

### Supabase Setup

1. Create a Supabase project
2. Copy the database connection string (use the connection pooler URL)
3. Create a storage bucket named `cpl-photos` with public access
4. Copy the project URL and service role key for env vars

## Project Structure

```
client/                 # React frontend (Vite SPA)
  src/
    components/         # UI components (shadcn/ui)
    pages/              # Route pages (welcome, interview, review, success)
    lib/                # Utilities, query client, story context
    hooks/              # Custom React hooks
api/                    # Vercel serverless API routes
  _lib/                 # Shared server utilities (db, storage, ai)
  conversations/        # Conversation endpoints (start, message)
  stories/              # Story endpoints (generate, update, publish, photo)
shared/
  schema.ts             # Drizzle database schema and types
```

## Database Schema

- **cpl_students** — Student name and email
- **cpl_conversations** — Interview message history (stored as JSON), linked to student and generated story
- **cpl_stories** — AI-generated story content, photo URL, approval status
- **cpl_users** — Admin authentication

## How It Works

1. Student enters their name on the welcome page
2. AI interviewer asks about their CPL experience — what prior learning earned credit, how it impacted their journey, and advice for others
3. After gathering enough information, the AI generates a success story from the transcript
4. Student reviews the draft, can edit it, optionally upload a photo, and approve for publication

## License

MIT
