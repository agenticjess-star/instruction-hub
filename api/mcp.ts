// Instruction OS MCP endpoint — Streamable HTTP, JSON-RPC.
// Auth: OAuth 2.1 via the self-hosted Better Auth service (api/_lib/auth.ts).
// The @better-auth/mcp plugin serves the protected-resource metadata and OAuth
// endpoints; this route validates the bearer token and dispatches tool calls.
import { requestToResourceInput, verifyAccessTokenRequest } from "better-auth/oauth2";
import * as tools from "./_lib/tools.js";

const RESOURCE = process.env.MCP_RESOURCE_URL!;

const TOOL_DEFS = [
  { name: "list_groups", description: "List top-level instruction groups (categories) for the signed-in user.", inputSchema: { type: "object", properties: {} } },
  { name: "list_instructions", description: "List instruction sets. Optionally filter by category_id.", inputSchema: { type: "object", properties: { category_id: { type: "string", format: "uuid" } } } },
  { name: "get_production_instruction", description: "Fetch the production version of an instruction set, ready to paste into a system prompt.", inputSchema: { type: "object", properties: { instruction_id: { type: "string", format: "uuid" } }, required: ["instruction_id"] } },
  { name: "list_threads", description: "List conversation threads. Filter by instruction_id or rating.", inputSchema: { type: "object", properties: { instruction_id: { type: "string" }, rating: { type: "string", enum: ["positive", "neutral", "negative"] }, limit: { type: "number" } } } },
  { name: "create_thread", description: "Save a conversation thread (auto-cleaned).", inputSchema: { type: "object", properties: { title: { type: "string" }, content: { type: "string" }, instruction_id: { type: "string" }, platform: { type: "string" }, model: { type: "string" }, rating: { type: "string" } }, required: ["title", "content"] } },
  { name: "add_thread_comment", description: "Add a comment / learning note to a thread.", inputSchema: { type: "object", properties: { thread_id: { type: "string", format: "uuid" }, content: { type: "string" } }, required: ["thread_id", "content"] } },
];

function ok(id: any, result: any) { return Response.json({ jsonrpc: "2.0", id, result }); }
function err(id: any, code: number, message: string) { return Response.json({ jsonrpc: "2.0", id, error: { code, message } }); }
const text = (s: string) => ({ content: [{ type: "text", text: s }] });

async function callTool(name: string, args: any, token: string, userId: string) {
  switch (name) {
    case "list_groups": return { ...text(JSON.stringify(await tools.listGroups(token), null, 2)), structuredContent: { groups: await tools.listGroups(token) } };
    case "list_instructions": return { ...text(JSON.stringify(await tools.listInstructions(token, args?.category_id), null, 2)) };
    case "get_production_instruction": {
      const r = await tools.getProductionInstruction(token, args.instruction_id);
      return { ...text(`# ${r.instruction.name} (v${r.production.version_number})\n\n${r.production.content}`), structuredContent: r };
    }
    case "list_threads": return { ...text(JSON.stringify(await tools.listThreads(token, { instructionId: args?.instruction_id, rating: args?.rating, limit: args?.limit }), null, 2)) };
    case "create_thread": {
      const t = await tools.createThread(token, userId, args);
      return { ...text(`Saved thread "${t.title}" (id: ${t.id}).`), structuredContent: { thread: t } };
    }
    case "add_thread_comment": {
      const c = await tools.addThreadComment(token, userId, args.thread_id, args.content);
      return { ...text(`Comment added to thread ${args.thread_id}.`), structuredContent: { comment: c } };
    }
    default: throw Object.assign(new Error(`Unknown tool: ${name}`), { code: -32601 });
  }
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Verify the bearer token against our Better Auth issuer (signature, iss,
  // audience=resource, expiry). 401 + WWW-Authenticate kicks off the OAuth flow.
  const verification = await verifyAccessTokenRequest(requestToResourceInput(req), {
    verifyOptions: {
      issuer: process.env.BETTER_AUTH_URL!,
      audience: RESOURCE,
    },
    jwksUrl: `${process.env.BETTER_AUTH_URL!}/jwks`,
  }).catch(() => null);
  if (!verification) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": `Bearer resource_metadata="${new URL("/.well-known/oauth-protected-resource", RESOURCE).toString()}"` },
    });
  }
  const token = req.headers.get("authorization")!.replace(/^Bearer\s+/i, "");
  const userId = verification.sub ?? verification.userId ?? verification.user?.id;
  if (!userId) return err(null, -32000, "Token missing subject");

  let body: any;
  try { body = await req.json(); } catch { return err(null, -32700, "Parse error"); }
  const { id, method, params } = body;

  try {
    switch (method) {
      case "initialize":
        return ok(id, {
          protocolVersion: params?.protocolVersion ?? "2025-06-18",
          capabilities: { tools: {} },
          serverInfo: { name: "instruction-os-mcp", title: "Instruction OS", version: "0.1.0" },
          instructions: "Instruction OS manages versioned AI custom instructions. Use list_groups / list_instructions to explore, get_production_instruction to fetch the live prompt, and list_threads / create_thread / add_thread_comment to capture feedback.",
        });
      case "notifications/initialized":
      case "initialized":
        return new Response(null, { status: 202 });
      case "tools/list":
        return ok(id, { tools: TOOL_DEFS });
      case "tools/call": {
        const result = await callTool(params?.name, params?.arguments ?? {}, token, String(userId));
        return ok(id, result);
      }
      case "ping":
        return ok(id, {});
      default:
        return err(id, -32601, `Method not found: ${method}`);
    }
  } catch (e: any) {
    return err(id, e?.code ?? -32603, e?.message ?? "Internal error");
  }
}
