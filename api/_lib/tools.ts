// Instruction OS MCP tools, ported from the Supabase edge-function handlers to
// run against the Neon Data API. Each receives the caller's access token so the
// Data API enforces Row-Level Security per user.
import { db } from "./dataApi";

type Token = string | undefined;

function cleanThread(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s*(Copy|Share|Edit|Regenerate|Continue|Send)\s*$/gim, "")
    .replace(/^\s*\d+\s*\/\s*\d+\s*$/gm, "")
    .trim();
}

export async function listGroups(token: Token) {
  const { data, error } = await db(token).select(
    "categories", "id, name, description, color, created_at, updated_at",
    [], { col: "created_at", asc: true }
  );
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listInstructions(token: Token, categoryId?: string) {
  const filters = categoryId ? [{ col: "category_id", val: categoryId }] : [];
  const { data, error } = await db(token).select(
    "instruction_groups", "id, name, description, color, category_id, created_at, updated_at",
    filters, { col: "updated_at", asc: false }
  );
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProductionInstruction(token: Token, instructionId: string) {
  const { data: group, error: gErr } = await db(token).selectSingle(
    "instruction_groups", "id, name, description", [{ col: "id", val: instructionId }]
  );
  if (gErr || !group) throw new Error(gErr?.message ?? "Instruction not found");
  const { data: version, error: vErr } = await db(token).selectSingle(
    "instruction_versions", "id, version_number, content, notes, created_at",
    [{ col: "group_id", val: instructionId }, { col: "is_production", val: true }]
  );
  if (vErr) throw new Error(vErr.message);
  if (!version) throw new Error(`No production version set for "${group.name}".`);
  return { instruction: group, production: version };
}

export async function listThreads(token: Token, opts: { instructionId?: string; rating?: string; limit?: number }) {
  const filters: { col: string; val: string }[] = [];
  if (opts.instructionId) filters.push({ col: "group_id", val: opts.instructionId });
  if (opts.rating) filters.push({ col: "rating", val: opts.rating });
  const { data, error } = await db(token).select(
    "threads", "id, title, platform, model, rating, group_id, created_at",
    filters, { col: "created_at", asc: false }, opts.limit ?? 20
  );
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createThread(token: Token, userId: string, input: {
  title: string; content: string; instruction_id?: string; platform?: string; model?: string; rating?: string;
}) {
  const cleaned = cleanThread(input.content);
  const row = {
    user_id: userId,
    title: input.title,
    raw_content: input.content,
    cleaned_content: cleaned,
    platform: input.platform ?? "",
    model: input.model ?? "",
    group_id: input.instruction_id ?? null,
    rating: input.rating ?? null,
  };
  const { data, error } = await db(token).insert("threads", row);
  if (error) throw new Error(error.message);
  return Array.isArray(data) ? data[0] : data;
}

export async function addThreadComment(token: Token, userId: string, threadId: string, content: string) {
  const { data, error } = await db(token).insert("thread_comments", {
    thread_id: threadId, content, user_id: userId,
  });
  if (error) throw new Error(error.message);
  return Array.isArray(data) ? data[0] : data;
}
