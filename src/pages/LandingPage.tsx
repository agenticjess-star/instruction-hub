import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Layers, GitBranch, Link2, Globe, Search, Sparkles, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Layers, title: "Instruction Groups", desc: "Organized collections for every use case — Tech Lead, Art Director, you name it." },
  { icon: GitBranch, title: "Version History", desc: "Full version tracking with diffs, notes, and one-click promotion." },
  { icon: MessageSquare, title: "Thread Library", desc: "Paste threads, auto-clean formatting, link to instruction groups." },
  { icon: Globe, title: "Copy & Deploy", desc: "One-click copy to paste into any platform or app." },
  { icon: Search, title: "Smart Search", desc: "Find any thread or group instantly by title, platform, or model." },
  { icon: Sparkles, title: "AI Optimizer", desc: "Analyze threads to auto-suggest instruction improvements." },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/30">
        <div className="container mx-auto flex items-center justify-between h-13 px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/12 border border-primary/25 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-display font-bold text-sm text-foreground tracking-tight">Instruction OS</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-9 font-medium">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-5 relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/4 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto text-center max-w-3xl relative">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/50 text-[11px] text-muted-foreground mb-10 tracking-wide uppercase font-semibold bg-secondary/30">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              Version control for AI instructions
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-6 leading-[0.95]">
              <span className="text-foreground">Ship better</span>
              <br />
              <span className="gradient-text">AI agents</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
              The operating system for managing, versioning, and optimizing your AI custom instructions. Always accessible, always evolving.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/signup">
                <Button size="default" className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 text-sm font-semibold shadow-lg shadow-primary/15">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="default" variant="outline" className="border-border/50 text-foreground hover:bg-secondary h-10 px-6 text-sm font-medium">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="pb-20 px-5">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="card-elevated overflow-hidden glow-sm"
          >
            <div className="p-5 md:p-6">
              <div className="flex items-center gap-1.5 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-warning/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-success/50" />
                <span className="ml-3 text-[11px] text-muted-foreground/50 font-mono tracking-wider font-medium">instruction-os.config</span>
              </div>
              <div className="font-mono text-xs text-muted-foreground/70 space-y-1 leading-relaxed">
                <p><span className="text-primary/80">const</span> <span className="text-foreground/80">groups</span> = {'['}</p>
                <p className="pl-4"><span className="text-success/70">"General Personal"</span>,</p>
                <p className="pl-4"><span className="text-success/70">"Tech Lead"</span>,</p>
                <p className="pl-4"><span className="text-success/70">"Vibe Coder"</span>,</p>
                <p className="pl-4"><span className="text-success/70">"Art Director"</span>,</p>
                <p className="pl-4"><span className="text-success/70">"Career Consultant"</span>,</p>
                <p>{']'}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-5">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight">Everything you need</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">A complete toolkit for managing the instructions that power your AI workflows.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="card-interactive p-6 group"
              >
                <f.icon className="w-5 h-5 text-primary/60 mb-3 group-hover:text-primary transition-colors duration-300" />
                <h3 className="font-semibold text-sm text-foreground mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-5">
        <div className="container mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-elevated p-10 md:p-14 relative overflow-hidden glow"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary/3 to-transparent pointer-events-none" />
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight">Start managing your instructions</h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">Join the elite workflow for AI power users.</p>
              <Link to="/signup">
                <Button size="default" className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 text-sm font-semibold shadow-lg shadow-primary/15">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 px-5">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary/12 flex items-center justify-center">
              <Layers className="w-3 h-3 text-primary/70" />
            </div>
            <span className="text-xs text-muted-foreground/60 font-medium">Instruction OS</span>
          </div>
          <p className="text-[11px] text-muted-foreground/40">© 2026 Instruction OS</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
