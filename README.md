# Instruction OS

> The operating system for AI custom instructions — version-controlled, agent-callable, and Telegram-native.

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-2DD4BF?style=flat-square)](https://lovable.dev)
[![MCP](https://img.shields.io/badge/Model%20Context%20Protocol-2.1-06B6D4?style=flat-square)](https://modelcontextprotocol.io)
[![Backend](https://img.shields.io/badge/Backend-Lovable%20Cloud-3ecf8e?style=flat-square)](https://lovable.dev)

---

## What it does

AI power users maintain custom instructions across ChatGPT, Claude, Cursor, Gemini — for different personas (Tech Lead, Art Director, Career Consultant). These instructions evolve based on real conversations, but the workflow today is broken: no versioning, no linkage back to threads, no optimization loop, copy-paste chaos.

**Instruction OS** is a single source of truth for your instructions with three ways to interact with it:

1. **The App** — organize, version, promote, and iterate visually.
2. **MCP Server** — expose your entire library to any agent (Claude, ChatGPT, Cursor, Codex) over OAuth.
3. **Telegram Inbox** — send any chat URL or pasted thread to a bot; it auto-scrapes (Firecrawl), auto-classifies (Lovable AI), and auto-sorts into the right group.

---

## The flywheel

```
Groups → Instructions → Versions ────► System prompt in your AI
   ▲                                              │
   │                                              ▼
Optimizer ◄─ Rated Threads ◄─ Telegram auto-sort ◄─ Real conversations
```

---

## Core features

### Hierarchy
- **Groups** — top-level categories (Developing, Creative, Career) with color tokens
- **Instructions** — specific personas belonging to a group
- **Versions** — full history with notes, one-click promote-to-production
- **Threads** — real conversations linked back to instructions, with 😊 / 😐 / 😞 ratings

### Telegram auto-ingest
- Bind a chat with `/link CODE` from your Dashboard
- Send a URL → Firecrawl extracts the transcript
- Send raw text → auto-cleaned
- Either way → Lovable AI titles + classifies into the right group + rates it
- Threads are tagged with `source = 'telegram'` for audit

### MCP server (OAuth 2.1)
Endpoint: `https://<project>.supabase.co/functions/v1/mcp`

Tools:
| Tool | Kind | Purpose |
|------|------|---------|
| `list_groups` | read | Enumerate categories |
| `list_instructions` | read | Enumerate instruction sets |
| `get_production_instruction` | read | Return the live prompt string |
| `list_threads` | read | Filter by instruction / rating |
| `create_thread` | write | Save + auto-clean a thread |
| `add_thread_comment` | write | Append learning notes |

Any MCP-compatible client (Claude Desktop, Cursor, ChatGPT Custom Connectors, Codex) can sign in with your Instruction OS account. Row-Level Security enforces per-user scoping.

### AI Optimizer
Analyze rated threads against the current instruction to surface gaps, and one-click apply improvements as a new version.

---

## Architecture

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind + semantic HSL tokens |
| UI | shadcn/ui + Framer Motion |
| State | TanStack Query |
| Backend | Lovable Cloud (Postgres + Auth + Edge Functions) |
| AI | Lovable AI Gateway (`google/gemini-2.5-flash` for classification) |
| Web extraction | Firecrawl v2 |
| Messaging | Telegram Bot API via Lovable connector gateway |
| Agent protocol | Model Context Protocol 2.1 (`@lovable.dev/mcp-js`) |

### Edge functions
- **`mcp`** — auto-generated MCP server (OAuth 2.1, dynamic client registration)
- **`telegram-webhook`** — receives Telegram updates, runs the auto-sort pipeline
- **`optimize-instructions`** — AI-driven instruction improvement suggestions

### Security
- Row-Level Security on every user-scoped table
- User roles isolated in `user_roles` (not on profiles)
- MCP tokens are Supabase-issued and audience-scoped
- Telegram bindings verified via one-time link code

---

## Setup

### Prerequisites
- A Lovable Cloud project (comes free with any Lovable app)
- Firecrawl connection linked (`FIRECRAWL_API_KEY`)
- Telegram Bot API connection linked (`TELEGRAM_API_KEY`) — grant your account access under Workspace → Connectors

### Telegram bot registration
After deploying `telegram-webhook`, register the webhook via the connector gateway:

```bash
curl -sS 'https://connector-gateway.lovable.dev/telegram/setWebhook' \
  -H "Authorization: Bearer $LOVABLE_API_KEY" \
  -H "X-Connection-Api-Key: $TELEGRAM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://<project>.supabase.co/functions/v1/telegram-webhook",
    "allowed_updates": ["message", "edited_message"]
  }'
```

### Local dev
```bash
npm install
npm run dev
```

---

## Design system

- **Aesthetic**: deep-black surfaces (`228 22% 5%`), cyan/teal accent (`175 72% 48%`)
- **Type**: Plus Jakarta Sans (body), Space Grotesk (display), JetBrains Mono (code)
- **Motion**: framer-motion — subtle lifts on hover, staggered fade-ins on load
- **Nav**: glow-on-active (no border outline), thin weights, generous vertical padding

---

## Roadmap

- [ ] Diff viewer between versions
- [ ] Slack ingest parity with Telegram
- [ ] Public read-only endpoints for shared instructions
- [ ] Bulk import from ChatGPT / Claude exports
- [ ] Team workspaces with role-based sharing

---

*Built with [Lovable](https://lovable.dev).*
