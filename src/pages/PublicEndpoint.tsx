import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Clock, Layers, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { instructionSets } from "@/lib/seed-data";
import { toast } from "sonner";

const PublicEndpoint = () => {
  const { slug } = useParams();
  const instruction = instructionSets.find(i => i.slug === slug);

  if (!instruction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-foreground mb-1">Not Found</h1>
          <p className="text-xs text-muted-foreground mb-4">This endpoint doesn't exist.</p>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-7">
              <ArrowLeft className="w-3 h-3 mr-1.5" /> Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const prodVersion = instruction.versions.find(v => v.isProduction);
  if (!prodVersion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-foreground mb-1">No Production Version</h1>
          <p className="text-xs text-muted-foreground">No published version yet.</p>
        </div>
      </div>
    );
  }

  const copyContent = () => {
    navigator.clipboard.writeText(prodVersion.content);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/20">
        <div className="container mx-auto flex items-center justify-between h-12 px-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Layers className="w-2.5 h-2.5 text-primary/60" />
            </div>
            <span className="font-display font-semibold text-xs text-foreground tracking-tight">Instruction OS</span>
          </Link>
          <span className="text-[9px] text-muted-foreground/30 uppercase tracking-widest font-mono">Public Endpoint</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-2xl px-5 py-12">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <h1 className="text-2xl font-bold text-foreground mb-1.5 tracking-tight">{instruction.name}</h1>
          <p className="text-xs text-muted-foreground mb-4">{instruction.description}</p>

          <div className="flex items-center gap-3 mb-6 text-[10px] text-muted-foreground/40 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              v{prodVersion.versionNumber}
            </span>
            <span>{new Date(prodVersion.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="rounded-lg border border-border/20 overflow-hidden glow-sm">
            <div className="bg-card/40 backdrop-blur-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[9px] text-muted-foreground/30 uppercase tracking-widest">Production</span>
                <Button size="sm" variant="ghost" onClick={copyContent} className="text-muted-foreground/30 hover:text-foreground h-6 text-[10px]">
                  <Copy className="w-3 h-3 mr-1" /> Copy
                </Button>
              </div>
              <pre className="font-mono text-xs text-foreground/70 whitespace-pre-wrap leading-relaxed">{prodVersion.content}</pre>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[9px] text-muted-foreground/20">
              Powered by <Link to="/" className="text-primary/30 hover:text-primary/50 transition-colors">Instruction OS</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PublicEndpoint;
