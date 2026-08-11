import { supabase } from "@/integrations/supabase/client";
import { cleanThreadContent } from "./cleanThread";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MARKER = /^\[\[(user|assistant)\]\]\s*$/i;

/** Canonical storage format for a cleaned thread. */
export function serializeMessages(messages: ChatMessage[]): string {
  return messages
    .filter((m) => m.content.trim())
    .map((m) => `[[${m.role}]]\n${m.content.trim()}`)
    .join("\n\n");
}

/** Parse stored cleaned content back into messages, with legacy fallbacks. */
export function parseMessages(cleaned: string): ChatMessage[] {
  if (!cleaned?.trim()) return [];

  const lines = cleaned.split("\n");
  const hasMarkers = lines.some((l) => MARKER.test(l.trim()));

  if (hasMarkers) {
    const messages: ChatMessage[] = [];
    let role: "user" | "assistant" = "user";
    let buf: string[] = [];
    const flush = () => {
      const content = buf.join("\n").trim();
      if (content) messages.push({ role, content });
      buf = [];
    };
    for (const line of lines) {
      const m = line.trim().match(MARKER);
      if (m) {
        flush();
        role = m[1].toLowerCase() as "user" | "assistant";
      } else {
        buf.push(line);
      }
    }
    flush();
    return messages;
  }

  // Legacy: "User:" / "Assistant:" prefixed lines
  const messages: ChatMessage[] = [];
  let role: "user" | "assistant" = "user";
  let buf: string[] = [];
  const flush = () => {
    const content = buf.join("\n").trim();
    if (content) messages.push({ role, content });
    buf = [];
  };
  for (const line of lines) {
    if (/^(user|human|you):\s*/i.test(line)) {
      flush();
      role = "user";
      buf.push(line.replace(/^(user|human|you):\s*/i, ""));
    } else if (/^(assistant|ai|chatgpt|claude|gemini|gpt-?\d*):\s*/i.test(line)) {
      flush();
      role = "assistant";
      buf.push(line.replace(/^(assistant|ai|chatgpt|claude|gemini|gpt-?\d*):\s*/i, ""));
    } else {
      buf.push(line);
    }
  }
  flush();

  if (messages.length === 0) return [{ role: "user", content: cleaned.trim() }];
  return messages;
}

export interface AiCleanResult {
  title: string;
  content: string;
  messages: ChatMessage[];
  usedAi: boolean;
}

/**
 * Clean a raw pasted thread with AI (splits into labelled messages).
 * Falls back to the local regex cleaner if the AI call fails.
 */
export async function aiCleanThread(raw: string): Promise<AiCleanResult> {
  try {
    const { data, error } = await supabase.functions.invoke("clean-thread", { body: { raw } });
    if (error) throw error;
    const messages: ChatMessage[] = Array.isArray(data?.messages)
      ? data.messages.filter((m: ChatMessage) => m?.content?.trim())
      : [];
    if (messages.length === 0) throw new Error("No messages returned");
    return {
      title: typeof data?.title === "string" ? data.title : "",
      content: serializeMessages(messages),
      messages,
      usedAi: true,
    };
  } catch (e) {
    console.error("aiCleanThread fallback:", e);
    const fallback = cleanThreadContent(raw);
    return { title: "", content: fallback, messages: parseMessages(fallback), usedAi: false };
  }
}
