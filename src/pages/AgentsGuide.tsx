import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MCP_URL,
  PRODUCT_OVERVIEW,
  AGENT_SKILL,
  AGENT_KICKOFF,
  fullPageMarkdown,
} from "@/lib/agentGuide";

const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className="inline-flex items-center gap-2 h-10 px-4 border border-foreground/80 text-[13px] font-mono uppercase tracking-wide text-foreground hover:bg-foreground hover:text-background transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
};

const Block = ({ text }: { text: string }) => (
  <div className="relative border border-border bg-muted/40">
    <pre className="p-5 pr-14 text-[12px] leading-relaxed font-mono text-foreground whitespace-pre-wrap overflow-x-auto">
      {text}
    </pre>
    <div className="absolute top-3 right-3">
      <CopyButton text={text} label="Copy" />
    </div>
  </div>
);

const Rule = ({ n, title }: { n: string; title: string }) => (
  <div className="flex items-baseline gap-4 border-b border-foreground/80 pb-3 mb-6">
    <span className="font-mono text-[11px] text-muted-foreground">{n}</span>
    <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
  </div>
);

const AgentsGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-foreground/80">
        <div className="max-w-[900px] mx-auto px-5 sm:px-8 h-[64px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-3 h-3 bg-primary" aria-hidden />
            <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-foreground">
              InstructionLoop
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-[13px] text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link to="/signup">
              <Button className="h-9 px-4 text-[13px] rounded-none bg-foreground text-background hover:bg-foreground/90">
                Create account
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary mb-4">
          For agents &amp; their humans
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.05] mb-5">
          Agent onboarding
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-[640px] mb-8">
          This page is the source of truth for what InstructionLoop is and how an AI agent should
          use it. Paste the link into a new chat and ask your agent to fetch it — or copy the whole
          page below and paste it in.
        </p>

        <div className="flex flex-wrap gap-3 mb-6">
          <CopyButton text={fullPageMarkdown()} label="Copy entire page" />
          <CopyButton text={MCP_URL} label="Copy MCP URL" />
        </div>

        <div className="border border-foreground/80 p-5 mb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-2">
            Fastest start
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            Send your agent this exact message:{" "}
            <span className="font-mono text-[12px] bg-muted px-1.5 py-0.5">
              Fetch instructionloop.lovable.app/agents and follow it.
            </span>
          </p>
        </div>

        <section className="mb-16">
          <Rule n="01" title="What this product is" />
          <Block text={PRODUCT_OVERVIEW} />
        </section>

        <section className="mb-16">
          <Rule n="02" title="Agent skill" />
          <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-[640px]">
            A complete skill for using every exposed tool, including the standard transcript format
            for uploading threads. Agents: offer to save this skill for the user so it works in
            every future conversation.
          </p>
          <Block text={AGENT_SKILL} />
        </section>

        <section className="mb-16">
          <Rule n="03" title="Kickoff instructions" />
          <Block text={AGENT_KICKOFF} />
        </section>

        <section className="mb-16">
          <Rule n="04" title="Connect the plugin" />
          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed max-w-[680px]">
            <div>
              <p className="text-foreground font-semibold mb-1">ChatGPT</p>
              <p>
                Settings → Connectors → Advanced → enable developer mode, then add a new connector
                and paste the URL above. Approve the sign-in prompt, then enable it from the
                composer.
              </p>
            </div>
            <div>
              <p className="text-foreground font-semibold mb-1">Claude</p>
              <p>
                Settings → Connectors → Add custom connector → paste the URL above → Add. Enable it
                from the composer.
              </p>
            </div>
            <div>
              <p className="text-foreground font-semibold mb-1">Claude Code</p>
              <Block text={`claude mcp add --scope user --transport http instructionloop '${MCP_URL}'`} />
            </div>
            <div>
              <p className="text-foreground font-semibold mb-1">Anything else</p>
              <p>
                Any client that supports remote MCP servers over HTTP works. Signing in during
                authorization creates your account if you do not have one yet.
              </p>
            </div>
            <p className="text-xs text-muted-foreground/70">
              After the app ships new tools, refresh the connector in your client to pick them up.
            </p>
          </div>
        </section>

        <div className="border-t border-foreground/80 pt-8 flex flex-wrap items-center gap-4">
          <Link to="/signup">
            <Button className="h-11 px-5 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-[13px]">
              Create your account <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/" className="text-[13px] text-muted-foreground hover:text-foreground">
            What is InstructionLoop?
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AgentsGuide;
