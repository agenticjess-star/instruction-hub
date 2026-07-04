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
  name: "get_production_instruction",
  title: "Get Production Instruction",
  description: "Fetch the current production version of an instruction set. Returns the full instruction content ready to paste into an AI system prompt.",
  inputSchema: {
    instruction_id: z.string().uuid().describe("UUID of the instruction set."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ instruction_id }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const client = supabaseForUser(ctx);
    const { data: group, error: gErr } = await client
      .from("instruction_groups")
      .select("id, name, description")
      .eq("id", instruction_id)
      .single();
    if (gErr || !group) {
      return { content: [{ type: "text", text: gErr?.message ?? "Instruction not found" }], isError: true };
    }
    const { data: version, error: vErr } = await client
      .from("instruction_versions")
      .select("id, version_number, content, notes, created_at")
      .eq("group_id", instruction_id)
      .eq("is_production", true)
      .maybeSingle();
    if (vErr) return { content: [{ type: "text", text: vErr.message }], isError: true };
    if (!version) {
      return { content: [{ type: "text", text: `No production version set for "${group.name}".` }], isError: true };
    }
    const payload = { instruction: group, production: version };
    return {
      content: [
        { type: "text", text: `# ${group.name} (v${version.version_number})\n\n${version.content}` },
      ],
      structuredContent: payload,
    };
  },
});
