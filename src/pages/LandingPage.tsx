import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Layers, GitBranch, Link2, Globe, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Layers, title: "Instruction Collections", desc: "Organize AI agent instructions into structured, versioned collections." },
  { icon: GitBranch, title: "Version History", desc: "Track every change with diff comparisons, notes, and one-click rollback." },
  { icon: Link2, title: "Linked Threads", desc: "Attach conversation logs as reference material for continuous improvement." },
  { icon: Globe, title: "Public Endpoints", desc: "Publish production instructions at clean, shareable URLs." },
  { icon: Search, title: "Smart Search", desc: "Filter by tag, platform, status, and recency across your entire library." },
  { icon: Sparkles, title: "Optimization", desc: "AI-powered insights from linked threads to refine your instructions." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Layers className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">Instruction OS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Dashboard</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 surface-2 text-sm text-muted-foreground mb-8">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Version control for AI instructions</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-foreground">Ship better </span>
              <span className="gradient-text">AI agents</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              The operating system for managing, versioning, and publishing AI agent instructions. 
              Track changes, link conversations, and deploy with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 glow">
                  Open Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/p/voice-teaching-mode">
                <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary px-8">
                  View Demo Endpoint
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass rounded-2xl p-1 glow"
          >
            <div className="rounded-xl surface-2 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
                <span className="ml-3 text-xs text-muted-foreground font-mono">instruction-os / voice-teaching-mode</span>
              </div>
              <div className="font-mono text-sm text-muted-foreground space-y-2">
                <p><span className="text-primary">const</span> <span className="text-foreground">instruction</span> = {'{'}</p>
                <p className="pl-4"><span className="text-primary">name</span>: <span className="text-success">"Voice Teaching Mode"</span>,</p>
                <p className="pl-4"><span className="text-primary">version</span>: <span className="text-warning">3</span>,</p>
                <p className="pl-4"><span className="text-primary">status</span>: <span className="text-success">"production"</span>,</p>
                <p className="pl-4"><span className="text-primary">threads</span>: <span className="text-warning">2</span>,</p>
                <p className="pl-4"><span className="text-primary">endpoint</span>: <span className="text-success">"/p/voice-teaching-mode"</span>,</p>
                <p>{'}'}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything you need</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">A complete toolkit for managing the instructions that power your AI agents.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass glass-hover rounded-xl p-6 group cursor-default"
              >
                <div className="w-10 h-10 rounded-lg surface-2 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-10 md:p-16 glow"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Start managing your instructions</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Join teams shipping more reliable AI agents with version-controlled, optimized instructions.</p>
            <Link to="/dashboard">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 glow">
                Open Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Layers className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">Instruction OS</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Instruction OS. Built for AI builders.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
