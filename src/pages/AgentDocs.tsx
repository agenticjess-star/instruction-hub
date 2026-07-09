import { useState } from "react";
import { Bot, Terminal, Copy, Check, MessageSquare, Zap, Shield, ExternalLink } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";

const MCP_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "your-project"}.supabase.co/functions/v1/mcp`;

const TOOLS = [
  { name: "list_groups", desc: "Enumerate top-level categories.", type: "read" },
  { name: "list_instructions", desc: "Enumerate instruction sets. Optional filter by category.", type: "read" },
  { name: "get_production_instruction", desc: "Fetch the current production version of an instruction — the string you paste as a system prompt.", type: "read" },
  { name: "list_threads", desc: "Browse conversation threads. Filter by instruction and rating.", type: "read" },
  { name: "create_thread", desc: "Save a new thread. Raw content is auto-cleaned before storage.", type: "write" },
  { name: "add_thread_comment", desc: "Append a comment or learning note to an existing thread.", type: "write" },
];

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <pre className="bg-secondary/50 border border-border/40 rounded-lg p-4 pr-12 text-[12px] font-mono text-foreground/90 overflow-x-auto leading-relaxed">
        {code}
      </pre>
      <button
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
        className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground/50 hover:text-primary hover:bg-background/60 transition-all"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};

const Section = ({ icon: Icon, title, children }: any) => (
  <section className="mb-12">
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
      </div>
      <h2 className="text-base font-semibold text-foreground tracking-tight">{title}</h2>
    </div>
    <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">{children}</div>
  </section>
);

const AgentDocs = () => {
  return (
    <AppLayout>
      <div className="max-w-[820px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary/80">For Agents</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
            How to talk to Instruction OS
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[620px] mb-12">
            This app is designed to be an operating system for your AI instructions — and it exposes itself over the Model Context Protocol so any agent can read, write, and iterate on your instruction library.
          </p>
        </motion.div>

        <Section icon={Zap} title="What this server does">
          <p>
            Instruction OS organizes AI custom instructions into <span className="text-foreground">Groups</span> (categories like <em>Developing</em>, <em>Creative</em>) and <span className="text-foreground">Instructions</span> (personas like <em>Tech Lead</em>, <em>Art Director</em>) with full version history. Threads (real conversations) are attached back to instructions to drive optimization.
          </p>
          <p>
            When you connect as an agent, prefer <code className="text-primary bg-primary/8 px-1.5 py-0.5 rounded text-[11px]">get_production_instruction</code> to pull the current live prompt string for a given instruction, then paste it as your system prompt.
          </p>
        </Section>

        <Section icon={Terminal} title="MCP endpoint">
          <p>Connect any MCP-compatible client (Claude, Cursor, ChatGPT, Codex) to:</p>
          <CodeBlock code={MCP_URL} />
          <p className="text-xs text-muted-foreground/70">
            OAuth 2.1 with dynamic client registration. Sign in with your Instruction OS account when prompted — tokens are scoped to your user via Row-Level Security.
          </p>
        </Section>

        <Section icon={Bot} title="Available tools">
          <div className="grid gap-2">
            {TOOLS.map(t => (
              <div key={t.name} className="flex items-start gap-3 p-3.5 rounded-lg bg-secondary/40 border border-border/30">
                <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5 ${t.type === "write" ? "bg-warning/15 text-warning" : "bg-primary/12 text-primary"}`}>
                  {t.type}
                </span>
                <div>
                  <p className="text-[13px] font-mono text-foreground mb-0.5">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={MessageSquare} title="Telegram inbox">
          <p>
            Send any message to your bound Telegram bot and Instruction OS routes it automatically:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li>Send a <span className="text-foreground">chat URL</span> — Firecrawl extracts the transcript, an agent titles and classifies it, and it lands in the right group.</li>
            <li>Send <span className="text-foreground">raw text</span> — same auto-clean + auto-sort pipeline.</li>
            <li>Send <code className="text-primary bg-primary/8 px-1.5 py-0.5 rounded text-[11px]">/link CODE</code> — bind the chat to your account. Grab the code from your Dashboard.</li>
          </ul>
          <p className="text-xs text-muted-foreground/70">
            Threads created via Telegram are tagged with <code className="text-[11px]">source = 'telegram'</code>.
          </p>
        </Section>

        <Section icon={Shield} title="Agent quick-start recipe">
          <p>A minimal loop to use this server as an agent:</p>
          <CodeBlock code={`1. call list_instructions  → pick the instruction id
2. call get_production_instruction(id) → paste as system prompt
3. do your work, keep the transcript
4. call create_thread({ title, content, instruction_id, rating }) → saves + auto-cleans
5. (optional) add_thread_comment for post-hoc learnings`} />
        </Section>

        <div className="pt-6 border-t border-border/40 flex items-center gap-2 text-xs text-muted-foreground/60">
          <ExternalLink className="w-3 h-3" />
          <span>Spec: modelcontextprotocol.io — Streamable HTTP transport, OAuth 2.1</span>
        </div>
      </div>
    </AppLayout>
  );
};

export default AgentDocs;
