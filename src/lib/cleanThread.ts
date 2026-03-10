/**
 * Cleans raw pasted thread content by removing web artifacts,
 * normalizing whitespace, and formatting into a clean conversation.
 */
export function cleanThreadContent(raw: string): string {
  let cleaned = raw;

  // Remove common web artifacts
  cleaned = cleaned.replace(/Copy code/gi, "");
  cleaned = cleaned.replace(/\[.*?\]\(javascript:void\(0\)\)/g, "");
  cleaned = cleaned.replace(/<[^>]*>/g, ""); // strip HTML tags
  cleaned = cleaned.replace(/&nbsp;/g, " ");
  cleaned = cleaned.replace(/&amp;/g, "&");
  cleaned = cleaned.replace(/&lt;/g, "<");
  cleaned = cleaned.replace(/&gt;/g, ">");
  cleaned = cleaned.replace(/&quot;/g, '"');

  // Remove timestamps like "2:34 PM", "Today at 3:15 PM", etc.
  cleaned = cleaned.replace(/\b\d{1,2}:\d{2}\s*(AM|PM)\b/gi, "");
  cleaned = cleaned.replace(/\bToday at\b/gi, "");

  // Remove avatar/icon artifacts
  cleaned = cleaned.replace(/^[A-Z]{1,2}\s*$/gm, "");

  // Remove "Edit", "Regenerate", "Share" button text artifacts
  cleaned = cleaned.replace(/^\s*(Edit|Regenerate|Share|Copy|Like|Dislike|Flag)\s*$/gim, "");

  // Normalize line breaks
  cleaned = cleaned.replace(/\r\n/g, "\n");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Trim each line
  cleaned = cleaned
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join("\n");

  // Try to detect and format conversation turns
  cleaned = cleaned.replace(/^(You|User|Human)[\s:]+/gim, "\nUser: ");
  cleaned = cleaned.replace(/^(Assistant|AI|ChatGPT|Claude|GPT-4|Gemini)[\s:]+/gim, "\nAssistant: ");

  return cleaned.trim();
}
