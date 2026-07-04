import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listGroups from "./tools/list-groups";
import listInstructions from "./tools/list-instructions";
import getProductionInstruction from "./tools/get-production-instruction";
import listThreads from "./tools/list-threads";
import createThread from "./tools/create-thread";
import addThreadComment from "./tools/add-thread-comment";

// The OAuth issuer MUST be the direct Supabase host, built from the project ref.
// Never derive from SUPABASE_URL (may be a proxy host in production).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "instruction-os-mcp",
  title: "Instruction OS",
  version: "0.1.0",
  instructions:
    "Instruction OS lets you manage versioned AI custom instructions organized into Groups (top-level categories like Developing, Creative) and Instructions (specific personas like Tech Lead, Art Director). Use `list_groups` and `list_instructions` to explore the user's setup, `get_production_instruction` to fetch the current instruction content ready to paste into an AI system prompt, and `list_threads` / `create_thread` / `add_thread_comment` to save and review conversation threads that inform instruction improvements.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listGroups,
    listInstructions,
    getProductionInstruction,
    listThreads,
    createThread,
    addThreadComment,
  ],
});
