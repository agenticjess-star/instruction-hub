import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Clock, Layers, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { instructionSets } from "@/lib/seed-data";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const PublicEndpoint = () => {
  const { slug } = useParams();
  const instruction = instructionSets.find(i => i.slug === slug);

  if (!instruction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Not Found</h1>
          <p className="text-muted-foreground mb-4">This instruction endpoint doesn't exist.</p>
          <Link to="/">
            <Button variant="outline" className="border-border text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Go Home
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
          <h1 className="text-2xl font-bold text-foreground mb-2">No Production Version</h1>
          <p className="text-muted-foreground">This instruction set has no published production version yet.</p>
        </div>
      </div>
    );
  }

  const copyContent = () => {
    navigator.clipboard.writeText(prodVersion.content);
    toast.success("Instructions copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">Instruction OS</span>
          </Link>
          <span className="text-xs text-muted-foreground">Public Endpoint</span>
        </div>
      </nav>

      <div className="container mx-auto max-w-3xl px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{instruction.name}</h1>
              <p className="text-sm text-muted-foreground">{instruction.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Version {prodVersion.versionNumber}
            </span>
            <span>Published {new Date(prodVersion.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="glass rounded-xl p-1 glow">
            <div className="rounded-lg surface-2 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-muted-foreground">Production Instructions</span>
                <Button size="sm" variant="ghost" onClick={copyContent} className="text-muted-foreground hover:text-foreground">
                  <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                </Button>
              </div>
              <pre className="font-mono text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{prodVersion.content}</pre>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Powered by <Link to="/" className="text-primary hover:underline">Instruction OS</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PublicEndpoint;
