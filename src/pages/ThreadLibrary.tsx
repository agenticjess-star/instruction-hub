import { motion } from "framer-motion";
import { MessageSquare, Copy, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { threads, tags, instructionSets } from "@/lib/seed-data";
import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { toast } from "sonner";

const getTagName = (id: string) => tags.find(t => t.id === id)?.name ?? id;

const ThreadLibrary = () => {
  const [search, setSearch] = useState("");

  const filtered = threads.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.platform.toLowerCase().includes(search.toLowerCase()) ||
    t.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-[1000px] mx-auto px-5 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Thread Library</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Conversation logs linked to instruction sets</p>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs">
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Add Thread
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, platform, or model..."
            className="w-full h-8 pl-9 pr-4 rounded-lg bg-secondary border border-border/20 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 transition-colors"
          />
        </div>

        <div className="space-y-px rounded-lg overflow-hidden border border-border/20">
          {filtered.map((th, i) => {
            const linkedSets = instructionSets.filter(is => th.linkedInstructionIds.includes(is.id));
            return (
              <motion.div
                key={th.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="bg-background hover:bg-card/20 transition-colors duration-500 p-4"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="font-medium text-xs text-foreground">{th.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground/40 font-mono">
                      <span>{th.platform}</span>
                      <span className="text-muted-foreground/15">·</span>
                      <span>{th.model}</span>
                      <span className="text-muted-foreground/15">·</span>
                      <span>{new Date(th.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { navigator.clipboard.writeText(th.content); toast.success("Copied"); }}
                    className="text-muted-foreground/30 hover:text-foreground flex-shrink-0 h-6"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <pre className="font-mono text-[10px] text-muted-foreground/40 whitespace-pre-wrap line-clamp-3 leading-relaxed mb-2">{th.content}</pre>
                <div className="flex flex-wrap items-center gap-1.5">
                  {th.tags.map(t => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground/50">{getTagName(t)}</span>
                  ))}
                  {linkedSets.map(ls => (
                    <span key={ls.id} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/5 text-primary/60 border border-primary/10 flex items-center gap-0.5">
                      <ExternalLink className="w-2 h-2" /> {ls.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default ThreadLibrary;
