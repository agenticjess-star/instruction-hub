# Instruction OS

> The operating system for managing, versioning, and optimizing AI custom instructions.

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-00b4d8?style=flat-square)](https://lovable.dev)
[![Powered by Supabase](https://img.shields.io/badge/Backend-Lovable%20Cloud-3ecf8e?style=flat-square)](https://lovable.dev)

---

## Problem Statement

AI power users — strategists, builders, consultants, creatives — maintain custom instructions across multiple AI platforms (ChatGPT, Claude, Gemini, etc.) for different use cases. These instructions evolve over time based on conversation outcomes, but the current workflow is fragmented:

- **No version control** — Updates overwrite previous instructions with no history or rollback
- **No thread linkage** — Conversations that reveal instruction gaps aren't systematically captured
- **No optimization loop** — Learning from good/bad threads requires manual review and editing
- **Copy-paste chaos** — Instructions live in scattered notes, documents, and platform settings

Instruction OS solves this by providing a unified, version-controlled, AI-optimized system for managing custom instructions.

---

## Product Overview

### Core Concept: Instruction Groups

Users organize their AI instructions into **groups** — each representing a distinct use case or persona:

| Group | Purpose |
|-------|---------|
| **General Personal** | Personal preferences and communication style |
| **Tech Lead** | High-level architecture decisions and stack evaluation |
| **Vibe Coder** | Low-code optimized prompts, no code snippets |
| **Career Consultant** | Professional development and career strategy |
| **Art Director** | Image prompt engineering and character consistency |

### The Flywheel

```
Create Group → Write Instructions → Copy to Platform → Use in Conversations
     ↑                                                          ↓
     ↑                                                    Paste Thread Back
     ↑                                                          ↓
     ↑                                                Auto-Clean & Format
     ↑                                                          ↓
Version Updated ← Auto-Apply ← AI Suggests ← Optimizer Analyzes Threads
```

1. **Create** instruction groups for each use case
2. **Version** your instructions with full history and diff tracking
3. **Copy** to any AI platform with one click
4. **Paste** conversation threads back — auto-cleaned from web artifacts
5. **Analyze** threads against instructions using AI optimization
6. **Auto-apply** suggestions as new versioned instructions
7. **Repeat** — the system continuously improves

---

## Features

### Instruction Groups & Version Control
- Create unlimited instruction groups with descriptions
- Full version history with notes and timestamps
- One-click promote any version to "production"
- Copy production instructions instantly
- Restore or fork from any previous version

### Thread Library
- Paste raw conversation threads — the system auto-cleans web artifacts
- Automatic formatting: strips HTML, timestamps, button text, and other copy-paste noise
- Link threads to specific instruction groups
- Add comments/annotations to threads for context
- Search across all threads by title, platform, or model

### AI-Powered Optimization
- Analyze linked threads against current instructions
- AI identifies gaps, inconsistencies, and improvement opportunities
- Priority-ranked suggestions (high/medium/low)
- One-click auto-apply creates a new version with improvements
- Powered by Lovable AI Gateway — no API keys required

### Authentication & Security
- Email + password authentication
- Protected routes for all user content
- Row-Level Security on all database tables
- Users can only access their own data
- Automatic profile creation on signup

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS + custom design system |
| **Components** | shadcn/ui + Radix primitives |
| **Animation** | Framer Motion |
| **State** | TanStack React Query |
| **Routing** | React Router v6 |
| **Backend** | Lovable Cloud (Supabase) |
| **Database** | PostgreSQL with RLS |
| **Auth** | Supabase Auth |
| **AI** | Lovable AI Gateway |
| **Edge Functions** | Deno-based serverless functions |

### Database Schema

```
instruction_groups
├── id (uuid, PK)
├── user_id (uuid, FK → auth.users)
├── name (text)
├── description (text)
├── icon (text)
├── color (text)
├── created_at (timestamptz)
└── updated_at (timestamptz)

instruction_versions
├── id (uuid, PK)
├── group_id (uuid, FK → instruction_groups)
├── version_number (integer)
├── content (text)
├── notes (text)
├── is_production (boolean)
└── created_at (timestamptz)

threads
├── id (uuid, PK)
├── user_id (uuid, FK → auth.users)
├── group_id (uuid, FK → instruction_groups, nullable)
├── title (text)
├── raw_content (text)
├── cleaned_content (text)
├── platform (text)
├── model (text)
└── created_at (timestamptz)

thread_comments
├── id (uuid, PK)
├── thread_id (uuid, FK → threads)
├── user_id (uuid, FK → auth.users)
├── content (text)
└── created_at (timestamptz)
```

### Security Model

All tables use PostgreSQL Row-Level Security (RLS):
- **instruction_groups**: Users can only CRUD their own groups
- **instruction_versions**: Access controlled via group ownership
- **threads**: Users can only CRUD their own threads
- **thread_comments**: Users can CRUD own comments + view comments on own threads

### Edge Functions

**`optimize-instructions`** — Accepts instruction content and linked thread conversations. Uses the Lovable AI Gateway to analyze patterns, identify gaps, and return structured improvement suggestions with priority rankings.

---

## Design System

### Visual Identity
- **Aesthetic**: Premium dark interface with cyan/teal accents
- **Philosophy**: "Elegant enough that you know it's serious"
- **Typography**: Plus Jakarta Sans (body) + Space Grotesk (display) + JetBrains Mono (code)
- **Effects**: Glassmorphism, elevated card shadows, subtle glow effects
- **Interactions**: Framer Motion hover lifts, fade-in animations, logo collapse on auth

### Design Tokens (HSL)
- Background: `228 22% 5%`
- Card: `228 20% 8%`
- Primary (Teal): `175 72% 48%`
- Success: `160 74% 40%`
- Borders: `228 14% 16%`
- Surface hierarchy: 3 elevation levels

---

## Strategic Decision Points

### Why Groups Instead of Tags?
Tags create flat, overlapping taxonomies. Groups create clear hierarchies that mirror how power users actually think about their instructions — by use case, not by keyword.

### Why Auto-Clean Threads?
The paste-in workflow is the lowest-friction way to capture conversations. Users will copy entire browser pages, which includes buttons, timestamps, and UI artifacts. Auto-cleaning removes this friction completely.

### Why Version Control Over Editing?
Editing overwrites history. Version control preserves the evolution of instructions, enables rollback, and creates a clear audit trail of what changed and why.

### Why AI Optimization Over Manual Review?
Manual review doesn't scale. When you have 5+ instruction groups with dozens of linked threads, AI analysis surfaces patterns humans miss — especially cross-group learnings.

---

## Consumer Value Proposition

**For AI power users who maintain custom instructions across multiple platforms**, Instruction OS provides a single, version-controlled system that automatically improves your instructions based on real conversation outcomes.

**Unlike** scattered notes, platform-specific settings, or manual copy-paste workflows, Instruction OS creates a continuous improvement loop: use → capture → analyze → optimize → deploy.

**The result**: Better AI conversations, less manual maintenance, and instructions that evolve with your needs.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or bun

### Local Development

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run dev
```

### Deployment

Deploy via [Lovable](https://lovable.dev) → Share → Publish.

Backend (database, auth, edge functions) deploys automatically.
Frontend requires clicking "Update" in the publish dialog.

---

## Roadmap

- [ ] Cross-group learning recommendations
- [ ] Diff viewer for version comparisons
- [ ] Bulk import from popular AI platforms
- [ ] Team workspaces with shared instruction libraries
- [ ] Webhook triggers on version promotion
- [ ] Public endpoint API for programmatic access
- [ ] Mobile-optimized responsive design
- [ ] Export instructions as structured JSON/YAML

---

*Built with [Lovable](https://lovable.dev) — the AI-powered web development platform.*
