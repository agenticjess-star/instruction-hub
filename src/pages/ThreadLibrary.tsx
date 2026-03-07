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
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Thread Library</h1>
            <p className="text-sm text-muted-foreground mt-1">Conversation logs linked to your instruction sets</p>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <MessageSquare className="w-4 h-4 mr-2" /> Add Thread
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search threads by title, platform, or model..."
            className="w-full h-10 pl-10 pr-4 rounded-lg surface-2 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-4">
          {filtered.map((th, i) => {
            const linkedSets = instructionSets.filter(is => th.linkedInstructionIds.includes(is.id));
            return (
              <motion.div
                key={th.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{th.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{th.platform}</span>
                      <span>·</span>
                      <span>{th.model}</span>
                      <span>·</span>
                      <span>{new Date(th.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { navigator.clipboard.writeText(th.content); toast.success("Copied"); }}
                    className="text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4 leading-relaxed mb-3">{th.content}</pre>
                <div className="flex flex-wrap items-center gap-2">
                  {th.tags.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full surface-2 text-muted-foreground">{getTagName(t)}</span>
                  ))}
                  {linkedSets.map(ls => (
                    <span key={ls.id} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                      <ExternalLink className="w-2.5 h-2.5" /> {ls.name}
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
