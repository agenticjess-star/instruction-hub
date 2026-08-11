import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  GitBranch,
  Globe,
  Search,
  Sparkles,
  MessageSquare,
  Layers,
  Plug,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FeedbackLoopDiagram from "@/components/FeedbackLoopDiagram";


const systemMap = [
  {
    n: "01",
    stage: "Capture",
    detail: "Send a thread link or raw transcript from Telegram, or paste it in the library.",
    surface: "Telegram connector · Thread library",
  },
  {
    n: "02",
    stage: "Sort",
    detail: "The agent extracts, cleans, and files the thread against the right instruction group.",
    surface: "Auto-sort agent",
  },
  {
    n: "03",
    stage: "Evaluate",
    detail: "Threads are rated as evidence for what the current instruction version got right or wrong.",
    surface: "Optimization workspace",
  },
  {
    n: "04",
    stage: "Revise",
    detail: "A new instruction version is drafted with a diff and a written rationale.",
    surface: "Version history",
  },
  {
    n: "05",
    stage: "Promote",
    detail: "One version is marked production and becomes the answer every client reads.",
    surface: "Production pointer",
    output: true,
  },
];

const surfaces = [
  {
    n: "01",
    icon: Layers,
    title: "Instruction library",
    detail: "Groups, instructions, and versions with a single production pointer per instruction.",
  },
  {
    n: "02",
    icon: Plug,
    title: "MCP server",
    detail: "Six tools over OAuth 2.1 so ChatGPT, Claude, and Cursor read and write as you.",
  },
  {
    n: "03",
    icon: MessageSquare,
    title: "Telegram intake",
    detail: "Forward a link or transcript; Firecrawl extracts it and the agent files it for you.",
  },
];

const useCases = [
  {
    n: "01",
    persona: "Tech lead",
    before: "Prompt lives in a note file, drifts across five tools.",
    after: "One production version, retrieved over MCP in every editor.",
  },
  {
    n: "02",
    persona: "Art director",
    before: "No record of why a direction stopped working.",
    after: "Rated threads attached to the version that produced them.",
  },
  {
    n: "03",
    persona: "Solo operator",
    before: "Good chats are lost the moment the tab closes.",
    after: "Forward to Telegram; the agent sorts it into the right group.",
  },
];

const features = [
  { icon: GitBranch, title: "Version history", desc: "Diffs, notes, and one-click promotion to production." },
  { icon: Search, title: "Search", desc: "Find any thread or group by title, platform, or model." },
  { icon: Sparkles, title: "Optimizer", desc: "Analyze rated threads and draft the next version." },
  { icon: Globe, title: "Public endpoints", desc: "Expose a promoted instruction at a clean, readable URL." },
];

const faqs = [
  {
    q: "How does an AI client read my instructions?",
    a: "Add the MCP endpoint in ChatGPT, Claude, or Cursor. You approve an OAuth consent screen once, and the client reads the production version of any instruction through the get_production_instruction tool.",
  },
  {
    q: "What happens when I send a link to Telegram?",
    a: "If there is no text in the message, Firecrawl extracts the shared thread from the link. The agent then cleans the transcript, classifies it against your existing groups, and files it as a thread.",
  },
  {
    q: "Can I edit what the agent decided?",
    a: "Yes. Auto-sorting creates a normal thread record. You can move it to a different group, re-rate it, or delete it from the thread library.",
  },
  {
    q: "Which version do clients get?",
    a: "Only the version marked production. Drafts stay private until you promote them, so nothing reaches a client mid-edit.",
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-foreground/80">
        <div className="flex items-center justify-between h-[60px] md:h-[68px] px-4 md:px-8 max-w-[1600px] mx-auto">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-3 h-3 bg-primary" aria-hidden />
            <span className="label-mono text-foreground">Instruction OS</span>
          </Link>
          <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
            <a href="#how" className="nav-link py-6 text-[13px] text-muted-foreground hover:text-foreground">How it works</a>
            <a href="#surfaces" className="nav-link py-6 text-[13px] text-muted-foreground hover:text-foreground">Surfaces</a>
            <a href="#pricing" className="nav-link py-6 text-[13px] text-muted-foreground hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="hidden sm:flex items-center h-11 text-[13px] text-muted-foreground hover:text-foreground link-underline"
            >
              Sign in
            </Link>
            <Link to="/signup">
              <Button size="sm">
                Get started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="section-pad border-b border-foreground/80">
          <div className="max-w-[1600px] mx-auto grid gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] items-end">
            <div>
              <p className="label-mono text-muted-foreground mb-8 rise-in">Instruction system of record</p>
              <h1 className="display-xl max-w-[11ch] rise-in" style={{ animationDelay: "80ms" }}>
                One production instruction per job.
              </h1>
              <p
                className="mt-8 text-base text-muted-foreground max-w-[46ch] leading-relaxed rise-in"
                style={{ animationDelay: "160ms" }}
              >
                Instruction OS keeps every custom instruction versioned, evidenced by real threads,
                and served to your AI clients over MCP.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-3 rise-in" style={{ animationDelay: "240ms" }}>
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">
                    Create your library
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/agents" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Read the agent docs
                  </Button>
                </Link>
              </div>
            </div>

            {/* System map */}
            <div id="how" className="panel panel-strong rise-in" style={{ animationDelay: "320ms" }}>
              <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-foreground/80">
                <span className="label-mono">System map</span>
                <span className="label-mono text-muted-foreground">Capture → Promote</span>
              </div>
              {systemMap.map((row) => (
                <div
                  key={row.n}
                  className={`grid grid-cols-[1.75rem_minmax(0,1fr)] md:grid-cols-[2.5rem_minmax(0,0.7fr)_minmax(0,1.3fr)] gap-x-4 gap-y-1 px-4 md:px-6 py-4 border-b rule ${
                    row.output ? "bg-primary/[0.09]" : ""
                  }`}
                >
                  <span className="label-mono text-muted-foreground">{row.n}</span>
                  <span className="text-sm text-foreground">{row.stage}</span>
                  <span className="col-start-2 md:col-start-3 text-sm text-muted-foreground">{row.detail}</span>
                  <span className="col-start-2 md:col-start-3 label-mono text-muted-foreground">{row.surface}</span>
                </div>
              ))}
              <p className="px-4 md:px-6 py-3 text-sm text-muted-foreground">
                Every promoted version becomes the baseline the next thread is measured against.
              </p>
            </div>
          </div>
        </section>

        <FeedbackLoopDiagram />



        {/* Surfaces */}
        <section id="surfaces" className="border-b border-foreground/80">
          <div className="max-w-[1600px] mx-auto grid md:grid-cols-3">
            {surfaces.map((s) => (
              <article
                key={s.n}
                className="p-8 md:p-10 border-b md:border-b-0 md:border-r last:border-r-0 rule flex flex-col min-h-[300px]"
              >
                <div className="flex items-center justify-between">
                  <span className="label-mono text-muted-foreground">{s.n}</span>
                  <s.icon className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                </div>
                <h2 className="mt-auto text-2xl">{s.title}</h2>
                <p className="mt-4 pt-4 border-t rule text-sm text-muted-foreground">{s.detail}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Use cases */}
        <section className="section-pad border-b border-foreground/80">
          <div className="max-w-[1600px] mx-auto">
            <h2 className="display-lg max-w-[12ch]">Before and after.</h2>
            <div className="mt-12 border-t border-foreground/80">
              <div className="hidden md:grid grid-cols-[3rem_minmax(10rem,0.7fr)_minmax(12rem,1fr)_minmax(12rem,1fr)] gap-6 py-3 border-b rule">
                <span className="label-mono text-muted-foreground">#</span>
                <span className="label-mono text-muted-foreground">Who</span>
                <span className="label-mono text-muted-foreground">Before</span>
                <span className="label-mono text-primary-dark">With Instruction OS</span>
              </div>
              {useCases.map((u) => (
                <div
                  key={u.n}
                  className="grid grid-cols-[3rem_minmax(0,1fr)] md:grid-cols-[3rem_minmax(10rem,0.7fr)_minmax(12rem,1fr)_minmax(12rem,1fr)] gap-x-6 gap-y-2 py-6 border-b rule"
                >
                  <span className="label-mono text-muted-foreground">{u.n}</span>
                  <span className="text-base">{u.persona}</span>
                  <span className="col-start-2 md:col-start-3 text-sm text-muted-foreground">{u.before}</span>
                  <span className="col-start-2 md:col-start-4 text-sm text-foreground">{u.after}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Proof */}
        <section className="section-pad border-b border-foreground/80">
          <div className="max-w-[1600px] mx-auto section-grid gap-12">
            <div>
              <h2 className="display-lg max-w-[10ch]">Evidence, not vibes.</h2>
              <p className="mt-6 text-base text-muted-foreground max-w-[44ch]">
                Each version carries the threads that justified it, so a promotion is a decision you can
                explain later.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-px bg-[hsl(var(--rule)/0.16)] border rule">
                {features.map((f) => (
                  <div key={f.title} className="bg-background p-5">
                    <f.icon className="w-4 h-4 text-foreground mb-3" strokeWidth={1.5} />
                    <h3 className="text-sm text-foreground">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="panel panel-strong panel-proof"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-foreground/80">
                <span className="label-mono">Tech Lead · Review voice</span>
                <span className="chip">Production</span>
              </div>
              <div className="px-5 py-4 border-b rule flex flex-wrap gap-x-8 gap-y-2">
                <span className="label-mono text-muted-foreground">Version v7</span>
                <span className="label-mono text-muted-foreground">Threads 14</span>
                <span className="label-mono text-muted-foreground">Rated 4.6 / 5</span>
              </div>
              <div className="px-5 py-5 text-technical text-muted-foreground space-y-1">
                <p className="text-foreground">- Ask for the failing test before proposing a fix.</p>
                <p className="text-primary-dark">+ Ask for the failing test and the last passing commit.</p>
                <p>+ Name the tradeoff you rejected in one sentence.</p>
              </div>
              <div className="px-5 py-4 border-t rule">
                <p className="label-mono text-muted-foreground mb-2">Rationale</p>
                <p className="text-sm text-muted-foreground">
                  Threads 09–14 stalled on missing context. Requiring the last passing commit cut the
                  clarification round trip.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="section-pad border-b border-foreground/80">
          <div className="max-w-[1600px] mx-auto">
            <h2 className="display-lg max-w-[9ch]">Pricing.</h2>
            <div className="mt-12 grid md:grid-cols-3 border rule">
              {[
                { name: "Solo", price: "$0", note: "Personal library", feats: ["3 groups", "Unlimited versions", "Public endpoints"], cta: "Start free" },
                { name: "Operator", price: "$18", note: "per month", feats: ["Unlimited groups", "MCP server access", "Telegram auto-sort"], cta: "Get Operator", featured: true },
                { name: "Team", price: "$49", note: "per month", feats: ["Shared groups", "Role-based access", "Priority optimization"], cta: "Get Team" },
              ].map((p) => (
                <div
                  key={p.name}
                  className={`p-8 flex flex-col border-b md:border-b-0 md:border-r last:border-r-0 rule ${
                    p.featured ? "bg-primary/[0.055]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="label-mono text-muted-foreground">{p.name}</span>
                    {p.featured && <span className="chip">Recommended</span>}
                  </div>
                  <p className="mt-8 text-5xl tracking-tight" style={{ fontWeight: 300 }}>{p.price}</p>
                  <p className="mt-2 label-mono text-muted-foreground">{p.note}</p>
                  <ul className="mt-8 space-y-2 mb-10">
                    {p.feats.map((f) => (
                      <li key={f} className="text-sm text-muted-foreground flex gap-3">
                        <span className="text-primary" aria-hidden>—</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" className="mt-auto">
                    <Button variant={p.featured ? "default" : "outline"} className="w-full">
                      {p.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-pad border-b border-foreground/80">
          <div className="max-w-[1600px] mx-auto section-grid gap-12">
            <h2 className="display-lg max-w-[8ch]">Questions.</h2>
            <div className="border-t rule">
              {faqs.map((f) => (
                <details key={f.q} className="group border-b rule">
                  <summary className="flex items-start justify-between gap-6 min-h-[68px] py-5 cursor-pointer list-none text-base">
                    <span>{f.q}</span>
                    <span className="font-mono text-muted-foreground shrink-0" aria-hidden>
                      <Plus className="w-4 h-4 group-open:hidden" />
                      <Minus className="w-4 h-4 hidden group-open:block" />
                    </span>
                  </summary>
                  <p className="pb-6 max-w-[60ch] text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section-pad border-b border-foreground/80">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
            <h2 className="display-lg max-w-[13ch]">Promote one version. Serve it everywhere.</h2>
            <Link to="/signup" className="shrink-0">
              <Button size="lg">
                Create your library
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="px-4 md:px-8 py-8 max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 bg-primary" aria-hidden />
          <span className="label-mono text-muted-foreground">Instruction OS — instruction system of record</span>
        </div>
        <p className="label-mono text-faint">© 2026</p>
      </footer>
    </div>
  );
};

export default LandingPage;
