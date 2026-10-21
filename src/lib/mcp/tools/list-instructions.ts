import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_instructions",
  title: "List Instructions",
  description: "List up to 100 signed-in user instruction personas. Filter by category_id from list_groups; instruction ids are used for production retrieval and thread links.",
  inputSchema: {
    category_id: z.string().uuid().optional().describe("Optional UUID of a top-level group to filter by."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category_id }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    let query = supabaseForUser(ctx)
      .from("instruction_groups")
      .select("id, name, description, color, category_id, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(100);
    if (category_id) query = query.eq("category_id", category_id);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { instructions: data ?? [] },
    };
  },
});
