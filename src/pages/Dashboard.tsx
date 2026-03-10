import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRight, Clock, MessageSquare, Copy, X, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroups, useCreateGroup, useThreads } from "@/hooks/useInstructionGroups";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";

const Dashboard = () => {
  const { data: groups = [], isLoading: groupsLoading } = useGroups();
  const { data: allThreads = [] } = useThreads();
  const createGroup = useCreateGroup();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createGroup.mutateAsync({ name: newName.trim(), description: newDesc.trim() });
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
      toast.success("Group created");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage your AI instruction groups</p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Group
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Groups", value: groups.length },
            { label: "Threads", value: allThreads.length },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-elevated p-4"
            >
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Create Modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="card-elevated p-5 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-foreground">New Instruction Group</h3>
                <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Group name (e.g., Tech Lead, Art Director)"
                  className="w-full h-10 px-3.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                />
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                />
                <Button onClick={handleCreate} disabled={createGroup.isPending || !newName.trim()} className="h-9 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                  {createGroup.isPending ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Groups Grid */}
        {groupsLoading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card-elevated p-5 h-32 animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-elevated p-12 text-center">
            <Layers className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No instruction groups yet</p>
            <p className="text-xs text-muted-foreground/50 mb-4">Create your first group to start managing instructions</p>
            <Button onClick={() => setShowCreate(true)} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-9">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Group
            </Button>
          </motion.div>
        ) : (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-foreground mb-4 tracking-tight">Instruction Groups</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((g, i) => {
                const groupThreads = allThreads.filter(t => t.group_id === g.id);
                return (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      to={`/groups/${g.id}`}
                      className="card-interactive block p-5 h-full group"
                    >
                      <div className="flex items-start justify-between mb-2.5">
                        <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-300">{g.name}</h3>
                      </div>
                      {g.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{g.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {groupThreads.length} threads
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(g.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
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
              {allThreads.slice(0, 3).map((th, i) => (
                <motion.div
                  key={th.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="card-interactive p-4 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-3.5 h-3.5 text-primary/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{th.title}</p>
                    <p className="text-[11px] text-muted-foreground/60">{th.platform || "Unknown"} · {th.model || "Unknown"}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText(th.cleaned_content || th.raw_content);
                      toast.success("Copied");
                    }}
                    className="text-muted-foreground/30 hover:text-foreground transition-colors p-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
