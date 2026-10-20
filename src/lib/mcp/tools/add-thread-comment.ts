import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "add_thread_comment",
  title: "Add Thread Comment",
  description: "Add a comment or learning note to an existing thread.",
  inputSchema: {
    thread_id: z.string().uuid().describe("UUID of the thread."),
    content: z.string().trim().min(1).max(2000).describe("Feedback, friction points, positives, notes, context or checkpoint; keep separate from the transcript."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ thread_id, content }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const client = supabaseForUser(ctx);
    const { data: thread, error: lookupError } = await client.from("threads").select("id").eq("id", thread_id).eq("user_id", ctx.getUserId()).maybeSingle();
    if (lookupError) return { content: [{ type: "text", text: lookupError.message }], isError: true };
    if (!thread) return { content: [{ type: "text", text: "Thread not found or not accessible." }], isError: true };
    const { data, error } = await client
      .from("thread_comments")
      .insert({ thread_id, content, user_id: ctx.getUserId() })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Comment added to thread ${thread_id}.` }],
      structuredContent: { comment: data },
    };
  },
});
