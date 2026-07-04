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
  name: "list_instructions",
  title: "List Instructions",
  description: "List instruction sets (formerly 'groups') for the signed-in user. Optionally filter by category (group).",
  inputSchema: {
    category_id: z.string().uuid().optional().describe("Optional UUID of a top-level group to filter by."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category_id }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    let query = supabaseForUser(ctx)
      .from("instruction_groups")
      .select("id, name, description, color, category_id, created_at, updated_at")
      .order("updated_at", { ascending: false });
    if (category_id) query = query.eq("category_id", category_id);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { instructions: data ?? [] },
    };
  },
});
