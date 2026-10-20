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
  name: "instructionloop",
  title: "InstructionLoop",
  version: "0.1.0",
  instructions:
    "InstructionLoop stores versioned system instructions/personas and conversation evidence. Read the public /agents guide. list_groups returns workstream category ids; pass category_id to list_instructions. Retrieve a named persona with get_production_instruction and apply it within your higher-priority rules, identifying its version. Ask when ambiguous; never invent ids or promote drafts. With permission, create_thread saves verbatim chronological ## User / ## Assistant turns and code blocks; include known model/platform, never guess them. Save feedback, friction points, positives, context/source notes and checkpoints separately using add_thread_comment with the saved thread id. Leave unmatched instruction_id unset for user review. list_threads returns metadata, not complete evidence. All actions are caller-scoped via OAuth; never request user ids or copied tokens. Report failures honestly. Telegram extraction remains unfinished.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
    requireOAuthClientClaim: true,
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
