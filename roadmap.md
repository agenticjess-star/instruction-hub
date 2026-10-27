# Production work tracker

Status: [x] verified, [~] implemented awaiting verification, [!] blocked, [ ] later batch.

## Batch 1 — Public onboarding and reliable MCP
- [ ] Public `/agents`: product overview, persona workflow, skill, transcript format, connection guidance, copy actions, navigation, fetchable content, metadata.
- [ ] MCP: runtime credentials, OAuth return paths, six tools, transcript fidelity, model/platform/source capture, caller ownership, meaningful failures.
- [ ] Verify signed-out guide at desktop/mobile sizes, copy/navigation, and authenticated create/read/comment flow with real data.
- [ ] Extract final MCP manifest; verify hosted OAuth and tool execution. Publishing requires explicit user action.

## Instruction creation workspace (user request, Oct 24)
- [~] Dedicated `/instructions/new` page: name, category (existing or new), description, large instruction editor, save as v1 + production.
- [~] "Improve with AI" panel built with assistant-ui components, streaming through the `improve-instruction` edge function (Lovable AI), with "Use this draft" insertion.
- [ ] Verify: create flow end-to-end, AI panel streams and inserts drafts, entry points from Groups and Category pages.

## Later batches
- [ ] Batch 2 (Prompt 3): instruction/version/diff column workspace.
- [ ] Batch 3 (Prompt 4): real selection annotations and thread feedback.
- [ ] Batch 4 (Prompt 5): real per-user Telegram connection.
- [ ] Batch 5 (Prompt 6): Firecrawl ingestion and classification.
- [ ] Batch 6 (Prompt 7): unified incoming activity and read/unread states.
- [ ] Batch 7 (Prompt 8): optimization loop, cleanup, branding, full production-readiness checks.
- [ ] Promotional immersive storytelling only after the core product is delivered.