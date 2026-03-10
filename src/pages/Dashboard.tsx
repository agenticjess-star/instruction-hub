import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRight, Clock, MessageSquare, Copy, X, Layers, Folder, ChevronRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroups, useCreateGroup, useThreads, useCategories, useCreateCategory } from "@/hooks/useInstructionGroups";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";

const PRESET_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"];

const Dashboard = () => {
  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const { data: groups = [], isLoading: groupsLoading } = useGroups();
  const { data: allThreads = [] } = useThreads();
  const createGroup = useCreateGroup();
  const createCategory = useCreateCategory();

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateCat, setShowCreateCat] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState("#10b981");
  const [newCatId, setNewCatId] = useState("");
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState("#3b82f6");

  const handleCreateGroup = async () => {
    if (!newName.trim()) return;
    try {
      await createGroup.mutateAsync({ name: newName.trim(), description: newDesc.trim(), category_id: newCatId || undefined, color: newColor });
      setNewName(""); setNewDesc(""); setNewColor("#10b981"); setNewCatId("");
      setShowCreateGroup(false);
      toast.success("Instruction created");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleCreateCat = async () => {
    if (!catName.trim()) return;
    try {
      await createCategory.mutateAsync({ name: catName.trim(), color: catColor });
      setCatName(""); setCatColor("#3b82f6");
      setShowCreateCat(false);
      toast.success("Group created");
    } catch (e: any) { toast.error(e.message); }
  };

  const uncategorized = groups.filter(g => !g.category_id);
  const isLoading = catsLoading || groupsLoading;

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Organize your AI instructions by group</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowCreateCat(true)} className="h-9 text-xs font-semibold border-border/50 text-muted-foreground hover:text-foreground">
              <Folder className="w-3.5 h-3.5 mr-1.5" /> New Group
            </Button>
            <Button size="sm" onClick={() => setShowCreateGroup(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-xs font-semibold">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> New Instruction
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Groups", value: categories.length },
            { label: "Instructions", value: groups.length },
            { label: "Threads", value: allThreads.length },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-elevated p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Create Category Modal */}
        <AnimatePresence>
          {showCreateCat && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card-elevated p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-foreground">New Group</h3>
                <button onClick={() => setShowCreateCat(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <input value={catName} onChange={e => setCatName(e.target.value)} placeholder="Group name (e.g., Developing, Creative, Career)" className="w-full h-10 px-3.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all" />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-semibold">Color:</span>
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setCatColor(c)} className={`w-5 h-5 rounded-full border-2 transition-all ${catColor === c ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <Button onClick={handleCreateCat} disabled={createCategory.isPending || !catName.trim()} className="h-9 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                  {createCategory.isPending ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Instruction Modal */}
        <AnimatePresence>
          {showCreateGroup && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card-elevated p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-foreground">New Instruction Set</h3>
                <button onClick={() => setShowCreateGroup(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Instruction name (e.g., Tech Lead, Art Director)" className="w-full h-10 px-3.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all" />
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-none" />
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <select value={newCatId} onChange={e => setNewCatId(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-secondary border border-border/40 text-sm text-foreground focus:outline-none focus:border-primary/40 transition-all">
                      <option value="">No group</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-semibold">Color:</span>
                    {PRESET_COLORS.map(c => (
                      <button key={c} onClick={() => setNewColor(c)} className={`w-5 h-5 rounded-full border-2 transition-all ${newColor === c ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateGroup} disabled={createGroup.isPending || !newName.trim()} className="h-9 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                  {createGroup.isPending ? "Creating..." : "Create Instruction"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories with nested instructions */}
        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <div key={i} className="card-elevated p-5 h-32 animate-pulse" />)}
          </div>
        ) : categories.length === 0 && groups.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-elevated p-12 text-center">
            <Layers className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No instructions yet</p>
            <p className="text-xs text-muted-foreground/50 mb-4">Create a group and add your first instruction set</p>
            <Button onClick={() => setShowCreateCat(true)} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-9">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Group
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6 mb-8">
            {categories.map((cat, ci) => {
              const catGroups = groups.filter(g => g.category_id === cat.id);
              return (
                <motion.div key={cat.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.06 }}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <h2 className="text-sm font-bold text-foreground tracking-tight">{cat.name}</h2>
                    <span className="text-[10px] text-muted-foreground/50 font-mono">{catGroups.length} instructions</span>
                  </div>
                  {catGroups.length === 0 ? (
                    <p className="text-xs text-muted-foreground/40 pl-5 mb-2">No instructions in this group yet.</p>
                  ) : (
                    <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-3 pl-5">
                      {catGroups.map((g, i) => (
                        <InstructionCard key={g.id} group={g} threads={allThreads.filter(t => t.group_id === g.id)} delay={i * 0.03} />
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Uncategorized */}
            {uncategorized.length > 0 && (
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  <h2 className="text-sm font-bold text-foreground tracking-tight">Uncategorized</h2>
                  <span className="text-[10px] text-muted-foreground/50 font-mono">{uncategorized.length}</span>
                </div>
                <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-3 pl-5">
                  {uncategorized.map((g, i) => (
                    <InstructionCard key={g.id} group={g} threads={allThreads.filter(t => t.group_id === g.id)} delay={i * 0.03} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Threads */}
        {allThreads.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground tracking-tight">Recent Threads</h2>
              <Link to="/threads" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors font-medium">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {allThreads.slice(0, 5).map((th, i) => {
                const g = groups.find(g => g.id === th.group_id);
                return (
                  <motion.div key={th.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <Link to={`/threads/${th.id}`} className="card-interactive p-4 flex items-center gap-3 block">
                      <div className="w-8 h-8 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-3.5 h-3.5 text-primary/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{th.title}</p>
                        <p className="text-[11px] text-muted-foreground/60">{th.platform || "Unknown"} · {th.model || "Unknown"}</p>
                      </div>
                      {g && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold border flex-shrink-0" style={{ backgroundColor: `${g.color}15`, borderColor: `${g.color}30`, color: g.color }}>
                          {g.name}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

function InstructionCard({ group, threads, delay }: { group: any; threads: any[]; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Link to={`/groups/${group.id}`} className="card-interactive block p-4 h-full group">
        <div className="flex items-start gap-2.5 mb-2">
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: group.color || "#666" }} />
          <div className="min-w-0">
            <h3 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors duration-300 truncate">{group.name}</h3>
            {group.description && <p className="text-[11px] text-muted-foreground/60 line-clamp-1 mt-0.5">{group.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50 pl-4.5">
          <span className="flex items-center gap-1"><MessageSquare className="w-2.5 h-2.5" />{threads.length}</span>
          <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{new Date(group.updated_at).toLocaleDateString()}</span>
        </div>
      </Link>
    </motion.div>
  );
}

export default Dashboard;
