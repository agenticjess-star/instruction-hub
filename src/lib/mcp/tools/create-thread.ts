import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_thread",
  title: "Save Thread",
  description: "Save a verbatim transcript or clearly labeled context as MCP evidence. Use chronological ## User / ## Assistant turns; optionally link an owned instruction and include known model/platform.",
  inputSchema: {
    title: z.string().trim().min(1).max(200).describe("Short descriptive title."),
    content: z.string().min(1).refine(value => value.trim().length > 0, "Content cannot be blank").describe("Verbatim transcript; use ## User and ## Assistant headings. Preserve code blocks and exact turns."),
    instruction_id: z.string().uuid().optional().describe("Optional instruction (group) UUID to link this thread to."),
    platform: z.string().max(50).optional().describe("Platform name (e.g. ChatGPT, Claude, Cursor)."),
    model: z.string().max(50).optional().describe("Model name (e.g. gpt-5, claude-sonnet-4)."),
    rating: z.enum(["positive", "neutral", "negative"]).optional().describe("Optional initial rating."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ title, content, instruction_id, platform, model, rating }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const client = supabaseForUser(ctx);
    if (instruction_id) {
      const { data: instruction, error: lookupError } = await client.from("instruction_groups").select("id").eq("id", instruction_id).eq("user_id", ctx.getUserId()).maybeSingle();
      if (lookupError) return { content: [{ type: "text", text: lookupError.message }], isError: true };
      if (!instruction) return { content: [{ type: "text", text: "Instruction not found or not accessible. Omit instruction_id to save unassigned." }], isError: true };
    }
    const insert = {
      user_id: ctx.getUserId(),
      title,
      raw_content: content,
      cleaned_content: content,
      platform: platform ?? "",
      model: model ?? "",
      group_id: instruction_id ?? null,
      rating: rating ?? null,
      source: "mcp",
    };
    const { data, error } = await client.from("threads").insert(insert).select("id, title, group_id, source, platform, model, rating, created_at").single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Saved thread "${data.title}" (id: ${data.id}).` }],
      structuredContent: { thread: data },
    };
  },
});
