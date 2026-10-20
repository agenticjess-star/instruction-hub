/**
 * Source-of-truth copy for the public /agents page.
 * Kept as plain strings so both the page and the "copy everything" action
 * render exactly the same text an agent would fetch.
 */

export const MCP_URL = `https://${import.meta.env?.VITE_SUPABASE_PROJECT_ID ?? "avttfayhcbfrglyxybgp"}.supabase.co/functions/v1/mcp`;
export const GUIDE_TITLE = "InstructionLoop — Agent getting started";
export const GUIDE_DESCRIPTION = "Connect your agent, retrieve versioned system instructions, and save verbatim conversations and feedback to improve your personas.";

export const PRODUCT_OVERVIEW = `# InstructionLoop — product overview (source of truth)

InstructionLoop is a system of record for the custom/system instructions people
give AI assistants, plus the feedback loop that improves them.

## The problem it solves
Most people keep system prompts in scattered notes: one file per assistant, no
history, no evidence. When an assistant behaves badly there is no record of
which prompt version produced it, so prompts drift instead of improving.

## The model
- **Group** — a workstream or life area (Developing, Creative, Personal).
- **Instruction** — one persona inside a group (Tech Lead, Art Director). This is
  the thing you actually paste into an assistant as a system prompt.
- **Version** — every edit of an instruction is a numbered version. Exactly one
  version is marked production; that is what the tools return. Versions stack, so
  you can diff v4 against v7 instead of guessing from file dates.
- **Thread** — a real conversation that ran under an instruction. Threads carry a
  rating (positive/neutral/negative) and comments, including comments anchored to
  a specific message.
- **Optimization** — the app reads an instruction's threads, ratings and comments
  and proposes a new version, which the user can promote to production.

## The loop
capture threads -> rate and annotate -> optimize the instruction -> promote a new
version -> future threads run on the better prompt.

## How threads get in
1. **MCP** (this integration) — an assistant saves the transcript directly.
2. **Telegram + Firecrawl** — planned intake: share a chat link or text to a
   personal bot, extract the source, then review and file it. This pipeline is
   still being completed; do not claim a link was imported without a saved record.
3. **Paste** — raw copy/paste, cleaned into messages automatically.`;

export const AGENT_SKILL = `---
name: instructionloop
description: Read, apply and improve a user's system instructions stored in InstructionLoop, and save conversation threads back for analysis. Use whenever the user asks you to adopt one of their personas, wants their system prompt, or asks you to record/upload a conversation for prompt improvement.
---

# InstructionLoop

InstructionLoop stores the user's system instructions as versioned Instructions
grouped into Groups, plus Threads (real conversations) that are rated and
annotated so the instructions can be improved over time.

Connect the MCP server first (see "Connecting" below). All tools act as the
signed-in user; never ask for a user id.

## Adopting a persona

1. \`list_instructions\` — find the instruction the user named. Use
   \`list_groups\` first if you need to disambiguate by workstream; pass its id
   as \`list_instructions({ category_id })\` to filter by that group.
2. \`get_production_instruction({ instruction_id })\` — returns the live prompt.
3. Apply the returned text as the user's requested persona within your existing
   safety rules and higher-priority instructions. Preserve the prompt text; do
   not claim it overrides those rules. Tell the user which
   instruction and version number you adopted.

If no production version exists, say so and offer to help draft one instead of
inventing a persona.

Recognize requests such as: “Pull in this persona, pull in the developer system instructions, or pull in the marketer system instructions.”
If the name is ambiguous, ask which instruction they mean. For a conversation
without an adopted persona, suggest the closest existing instruction, but do not
silently assign it. If none fits, omit instruction_id and keep it unassigned
(miscellaneous) for the user's review. Never invent an instruction id.

## Saving a thread

Save when the user asks, and offer to save whenever a conversation produced a
notable success or failure worth feeding back.

\`create_thread({ title, content, instruction_id?, platform?, model?, rating? })\`

Format \`content\` as a verbatim transcript using this standard so the app can
split it into messages reliably:

\`\`\`
## User
<exact user message>

## Assistant
<exact assistant message>
\`\`\`

Rules for \`content\`:
- Copy messages verbatim. Do NOT summarize, shorten or merge turns — a summarized
  thread is close to worthless for prompt analysis.
- Keep chronological order and preserve code blocks.
- If the conversation is too long, save the contiguous stretch that matters and
  note in a comment which part was omitted.

Set \`rating\` from how well the assistant performed under that instruction, and
\`platform\`/\`model\` when you know them; never guess unknown model names.
Confirm the returned saved id before saying the upload succeeded. Retain it for
checkpoints and feedback. The current six tools do not edit existing transcripts
or create instructions: use comments for checkpoint notes, and the website to
save/edit/version/promote instructions.

For context rather than a conversation, label it clearly in title/content and
retain exact source material. Keep summaries separate from the transcript.

## Adding evidence

\`add_thread_comment({ thread_id, content })\` — record why the thread went well
or badly, in terms of the instruction: which line helped, which line caused the
wrong behavior, what wording would prevent it. These comments are the raw
material for the optimizer, so be specific and prescriptive.

Use a concise note with headings where relevant: Feedback, Friction points,
Positives, Notes, and Checkpoint. Record the adopted instruction/version, known
model/platform, missing transcript portions, and source URL as evidence. Save
checkpoints when the user asks or agrees, before context is lost; do not promise
automatic background capture. Never upload secrets or third-party private data
without permission.

## Reviewing

\`list_threads({ instruction_id?, rating?, limit? })\` — pull the history for an
instruction, then summarize recurring failure patterns and propose concrete
edits to the instruction text. This tool returns a bounded list of thread
metadata, not full transcripts/comments; review those in the website before
claiming to have analyzed their contents.

## Tool reference

| Tool | Purpose |
| --- | --- |
| \`list_groups\` | Top-level workstreams |
| \`list_instructions\` | Instructions, optionally filtered by group |
| \`get_production_instruction\` | The live prompt text for one instruction |
| \`list_threads\` | Saved conversations, filterable by instruction/rating |
| \`create_thread\` | Save a transcript |
| \`add_thread_comment\` | Attach a learning note to a thread |

## Connecting

Remote MCP server (OAuth 2.1, dynamic client registration):

    ${MCP_URL}

Add it as a custom connector/plugin in ChatGPT, Claude, Claude Code, Cursor or
any compatible remote HTTP MCP client. Sign in with email and password; if new,
choose Sign up and confirm your email, then return to approve the connection.
OAuth authorization alone does not create an account. Never paste API keys or
session tokens into a connector. If a tool fails, report it rather than inventing
success, and retry only after the cause is addressed.`;

export const AGENT_KICKOFF = `You are being pointed at InstructionLoop by its user.

1. Read the product overview and the skill on this page.
2. Offer to save the skill for the user in your own skills/rules/memory so this
   works in every future conversation.
3. Then tell the user the two things they need to do:
    - create an account at instructionloop.lovable.app; when adding the connector
      first, choose Sign up from its sign-in screen and confirm your email, and
   - add the MCP server ${MCP_URL} as a custom connector.
4. Once connected, call list_groups and list_instructions to confirm access.
5. Ask which persona to retrieve, or offer to save a thread with their permission.
If the client cannot fetch this page, ask the user to paste “Copy entire page”
or read https://instructionloop.lovable.app/agents.md instead.`;

export function fullPageMarkdown() {
  return [PRODUCT_OVERVIEW, "\n---\n\n# Agent skill\n", AGENT_SKILL, "\n---\n\n# Kickoff\n", AGENT_KICKOFF].join("\n");
}
