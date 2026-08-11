import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Folder, ChevronRight, Layers, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategories, useGroups, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useInstructionGroups";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";

const PRESET_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"];

const GroupsPage = () => {
  const { data: categories = [], isLoading } = useCategories();
  const { data: groups = [] } = useGroups();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createCategory.mutateAsync({ name: name.trim(), color });
      setName(""); setColor("#3b82f6"); setShowCreate(false);
      toast.success("Group created");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateCategory.mutateAsync({ id, name: editName.trim(), color: editColor });
      setEditingId(null);
      toast.success("Group updated");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this group? Instructions inside will become uncategorized.")) return;
    try {
      await deleteCategory.mutateAsync(id);
      toast.success("Group deleted");
    } catch (e: any) { toast.error(e.message); }
  };

  const uncategorized = groups.filter(g => !g.category_id);

  return (
    <AppLayout>
      <div className="max-w-[900px] mx-auto px-5 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Groups</h1>
            <p className="text-xs text-muted-foreground mt-1">High-level categories for your instructions</p>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-xs font-semibold">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> New Group
          </Button>
        </div>

        {/* Create */}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card-elevated p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-foreground">New Group</h3>
                <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Group name (e.g., Developing, Creative, Career)" className="w-full h-10 px-3.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all" />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-semibold">Color:</span>
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setColor(c)} className={`w-5 h-5 rounded-full border-2 transition-all ${color === c ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <Button onClick={handleCreate} disabled={createCategory.isPending || !name.trim()} className="h-9 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                  {createCategory.isPending ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Groups List */}
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="card-elevated p-6 h-24 animate-pulse" />)}</div>
        ) : categories.length === 0 && uncategorized.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <Folder className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No groups yet</p>
            <p className="text-xs text-muted-foreground/50 mb-4">Create groups to organize your instructions</p>
            <Button onClick={() => setShowCreate(true)} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-9">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Group
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((cat, ci) => {
              const catGroups = groups.filter(g => g.category_id === cat.id);
              const isEditing = editingId === cat.id;
              return (
                <motion.div key={cat.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.05 }} className="card-elevated overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1 mr-3">
                          <input value={editName} onChange={e => setEditName(e.target.value)} className="h-8 px-3 rounded-md bg-secondary border border-border/40 text-sm text-foreground flex-1 focus:outline-none focus:border-primary/40" />
                          <div className="flex items-center gap-1">
                            {PRESET_COLORS.map(c => (
                              <button key={c} onClick={() => setEditColor(c)} className={`w-4 h-4 rounded-full border-2 transition-all ${editColor === c ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          <Button size="sm" onClick={() => handleUpdate(cat.id)} className="h-8 text-xs bg-primary text-primary-foreground">Save</Button>
                          <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <>
                          <Link to={`/categories/${cat.id}`} className="flex items-center gap-3 min-w-0 group/head">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || "#3b82f6" }} />
                            <h2 className="text-sm font-bold text-foreground truncate group-hover/head:text-primary transition-colors">{cat.name}</h2>
                            <span className="text-[10px] text-muted-foreground/50 bg-secondary px-2 py-0.5 rounded-md">{catGroups.length} instructions</span>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover/head:text-primary transition-colors" />
                          </Link>
                          <div className="flex items-center gap-1">
                            <Link to={`/categories/${cat.id}`} className="text-[10px] font-semibold px-2 py-1 text-primary hover:underline">
                              Open
                            </Link>
                            <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); setEditColor(cat.color || "#3b82f6"); }} className="p-1.5 rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-secondary transition-all" aria-label="Rename group">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all" aria-label="Delete group">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    {catGroups.length === 0 ? (
                      <Link to={`/categories/${cat.id}`} className="text-xs text-primary hover:underline pl-6 inline-flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add the first instruction
                      </Link>
                    ) : (
                      <div className="space-y-1 pl-6">
                        {catGroups.map(g => (
                          <Link key={g.id} to={`/instructions/${g.id}`} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-secondary/80 transition-all group">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: g.color || "#666" }} />
                            <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors flex-1">{g.name}</span>
                            <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                          </Link>
                        ))}
                      </div>
                    )}

                  </div>
                </motion.div>
              );
            })}

            {uncategorized.length > 0 && (
              <div className="card-elevated p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/30 flex-shrink-0" />
                  <h2 className="text-sm font-bold text-foreground">Uncategorized</h2>
                  <span className="text-[10px] text-muted-foreground/50 bg-secondary px-2 py-0.5 rounded-md">{uncategorized.length}</span>
                </div>
                <div className="space-y-1 pl-6">
                  {uncategorized.map(g => (
                    <Link key={g.id} to={`/groups/${g.id}`} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-secondary/80 transition-all group">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: g.color || "#666" }} />
                      <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors flex-1">{g.name}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default GroupsPage;
