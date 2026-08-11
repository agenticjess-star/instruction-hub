import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Copy, Search, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThreads, useGroups, useCreateThread } from "@/hooks/useInstructionGroups";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";
import { aiCleanThread, parseMessages } from "@/lib/threadMessages";

const ThreadLibrary = () => {
  const [search, setSearch] = useState("");
  const [filterGroupId, setFilterGroupId] = useState<string>("");
  const { data: threads = [], isLoading } = useThreads();
  const { data: groups = [] } = useGroups();
  const createThread = useCreateThread();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [raw, setRaw] = useState("");
  const [platform, setPlatform] = useState("");
  const [model, setModel] = useState("");
  const [groupId, setGroupId] = useState("");

  const filtered = threads.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.platform || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.model || "").toLowerCase().includes(search.toLowerCase());
    const matchGroup = !filterGroupId || t.group_id === filterGroupId;
    return matchSearch && matchGroup;
  });

  const [cleaning, setCleaning] = useState(false);

  const handleAdd = async () => {
    if (!raw.trim()) return;
    setCleaning(true);
    try {
      const result = await aiCleanThread(raw);
      await createThread.mutateAsync({
        title: title.trim() || result.title || "Untitled thread",
        raw_content: raw,
        cleaned_content: result.content,
        group_id: groupId || undefined,
        platform, model,
      });
      setTitle(""); setRaw(""); setPlatform(""); setModel(""); setGroupId("");
      setShowAdd(false);
      toast.success(
        result.usedAi
          ? `Thread cleaned into ${result.messages.length} messages`
          : "Thread added (AI unavailable — basic cleaning)"
      );
    } catch (e: any) { toast.error(e.message); }
    finally { setCleaning(false); }
  };


  return (
    <AppLayout>
      <div className="max-w-[1000px] mx-auto px-5 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Thread Library</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Conversation logs linked to instructions</p>
          </div>
          <Button size="sm" onClick={() => setShowAdd(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-xs font-semibold">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Thread
          </Button>
        </div>

        {/* Search + filter */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search threads..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all" />
          </div>
          <select value={filterGroupId} onChange={e => setFilterGroupId(e.target.value)} className="h-10 px-3 rounded-lg bg-secondary border border-border/40 text-sm text-foreground focus:outline-none focus:border-primary/40 transition-all min-w-[150px]">
            <option value="">All instructions</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>

        {/* Add Form */}
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-foreground">Paste Thread</h3>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Thread title" className="w-full h-10 px-3.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all" />
              <div className="grid grid-cols-3 gap-3">
                <input value={platform} onChange={e => setPlatform(e.target.value)} placeholder="Platform" className="h-10 px-3.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all" />
                <input value={model} onChange={e => setModel(e.target.value)} placeholder="Model" className="h-10 px-3.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all" />
                <select value={groupId} onChange={e => setGroupId(e.target.value)} className="h-10 px-3 rounded-lg bg-secondary border border-border/40 text-sm text-foreground focus:outline-none focus:border-primary/40 transition-all">
                  <option value="">No instruction</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <textarea value={raw} onChange={e => setRaw(e.target.value)} placeholder="Paste the entire thread here..." rows={6} className="w-full px-3.5 py-3 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-y font-mono" />
              <Button onClick={handleAdd} disabled={createThread.isPending} className="h-9 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                {createThread.isPending ? "Saving..." : "Add & Clean Thread"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Thread List */}
        <div className="space-y-2">
          {filtered.map((th, i) => {
            const g = groups.find(g => g.id === th.group_id);
            return (
              <motion.div key={th.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                <Link to={`/threads/${th.id}`} className="card-interactive p-4 block">
                  <div className="flex items-start justify-between gap-4 mb-1.5">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-xs text-foreground truncate">{th.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground/50 font-mono">
                        <span>{th.platform || "Unknown"}</span>
                        <span className="text-border">·</span>
                        <span>{th.model || "Unknown"}</span>
                        <span className="text-border">·</span>
                        <span>{new Date(th.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(th.cleaned_content || th.raw_content); toast.success("Copied"); }} className="text-muted-foreground/40 hover:text-foreground flex-shrink-0 h-7">
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <pre className="font-mono text-[11px] text-muted-foreground/50 whitespace-pre-wrap line-clamp-2 leading-relaxed mb-2">{th.cleaned_content || th.raw_content}</pre>
                  {g && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold border" style={{ backgroundColor: `${g.color}15`, borderColor: `${g.color}30`, color: g.color }}>
                      {g.name}
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
          {!isLoading && filtered.length === 0 && (
            <p className="text-muted-foreground/50 text-xs py-12 text-center">
              {search || filterGroupId ? "No threads match your filter." : "No threads yet. Add one to get started."}
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ThreadLibrary;
