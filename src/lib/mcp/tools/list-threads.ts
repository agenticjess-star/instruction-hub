import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_threads",
  title: "List Threads",
  description: "List conversation threads for the signed-in user. Filter by instruction_id or rating (positive/neutral/negative).",
  inputSchema: {
    instruction_id: z.string().uuid().optional().describe("Optional instruction (group) UUID to filter by."),
    rating: z.enum(["positive", "neutral", "negative"]).optional().describe("Optional rating filter."),
    limit: z.number().int().min(1).max(100).default(20).describe("Maximum threads to return (1-100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ instruction_id, rating, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    let query = supabaseForUser(ctx)
      .from("threads")
      .select("id, title, platform, model, rating, group_id, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (instruction_id) query = query.eq("group_id", instruction_id);
    if (rating) query = query.eq("rating", rating);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { threads: data ?? [] },
    };
  },
});
