import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Layers, GitBranch, Link2, Globe, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Layers, title: "Instruction Collections", desc: "Structured, versioned collections for every agent." },
  { icon: GitBranch, title: "Version History", desc: "Diff comparisons, notes, and one-click rollback." },
  { icon: Link2, title: "Linked Threads", desc: "Attach conversations as reference material." },
  { icon: Globe, title: "Public Endpoints", desc: "Publish at clean, shareable URLs." },
  { icon: Search, title: "Smart Search", desc: "Filter by tag, platform, status, and recency." },
  { icon: Sparkles, title: "Optimization", desc: "AI-powered insights from linked threads." },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/20">
        <div className="container mx-auto flex items-center justify-between h-12 px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Layers className="w-3 h-3 text-primary" />
            </div>
            <span className="font-display font-semibold text-sm text-foreground tracking-tight">Instruction OS</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-8">Dashboard</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className="text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-5 relative">
        {/* Ambient glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/3 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto text-center max-w-3xl relative">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-border/40 text-[11px] text-muted-foreground mb-10 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              Version control for AI instructions
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-5 leading-[0.95]">
              <span className="text-foreground">Ship better</span>
              <br />
              <span className="gradient-text">AI agents</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
              The operating system for managing, versioning, and publishing AI agent instructions. Deploy with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <Link to="/dashboard">
                <Button size="default" className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-6 text-xs font-medium">
                  Open Dashboard
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
              <Link to="/p/voice-teaching-mode">
                <Button size="default" variant="outline" className="border-border/50 text-foreground hover:bg-secondary h-9 px-6 text-xs font-medium">
                  View Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="pb-16 px-5">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-lg border border-border/30 overflow-hidden glow-sm"
          >
            <div className="bg-card/60 backdrop-blur-xl p-5 md:p-6">
              <div className="flex items-center gap-1.5 mb-4">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                <span className="ml-3 text-[10px] text-muted-foreground/50 font-mono tracking-wider">voice-teaching-mode.js</span>
              </div>
              <div className="font-mono text-xs text-muted-foreground/60 space-y-1 leading-relaxed">
                <p><span className="text-primary/70">const</span> <span className="text-foreground/70">instruction</span> = {'{'}</p>
                <p className="pl-4"><span className="text-primary/60">name</span>: <span className="text-success/70">"Voice Teaching Mode"</span>,</p>
                <p className="pl-4"><span className="text-primary/60">version</span>: <span className="text-warning/70">3</span>,</p>
                <p className="pl-4"><span className="text-primary/60">status</span>: <span className="text-success/70">"production"</span>,</p>
                <p className="pl-4"><span className="text-primary/60">threads</span>: <span className="text-warning/70">2</span>,</p>
                <p className="pl-4"><span className="text-primary/60">endpoint</span>: <span className="text-success/70">"/p/voice-teaching-mode"</span>,</p>
                <p>{'}'}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-5">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight">Everything you need</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">A complete toolkit for the instructions that power your AI agents.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/20 rounded-lg overflow-hidden border border-border/20">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="bg-background p-6 group hover:bg-card/30 transition-colors duration-500"
              >
                <f.icon className="w-4 h-4 text-primary/60 mb-3 group-hover:text-primary transition-colors duration-500" />
                <h3 className="font-medium text-sm text-foreground mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-5">
        <div className="container mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-lg border border-border/30 bg-card/20 backdrop-blur-xl p-10 md:p-14 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/2 to-transparent pointer-events-none" />
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight">Start managing your instructions</h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">Join teams shipping more reliable AI agents with version-controlled, optimized instructions.</p>
              <Link to="/dashboard">
                <Button size="default" className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-8 text-xs font-medium">
                  Open Dashboard
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-6 px-5">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center">
              <Layers className="w-2.5 h-2.5 text-primary/60" />
            </div>
            <span className="text-[11px] text-muted-foreground/50">Instruction OS</span>
          </div>
          <p className="text-[10px] text-muted-foreground/30">© 2026 Instruction OS</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
