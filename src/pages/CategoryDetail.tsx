import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Plus, X, ChevronRight, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useCategories,
  useGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
} from "@/hooks/useInstructionGroups";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";

const PRESET_COLORS = ["#6366F1", "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4"];

const CategoryDetail = () => {
  const { id } = useParams();
  const { data: categories = [] } = useCategories();
  const { data: groups = [] } = useGroups();
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const category = categories.find((c) => c.id === id);
  const instructions = groups.filter((g) => g.category_id === id);

  const handleCreate = async () => {
    if (!name.trim() || !id) return;
    try {
      await createGroup.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        category_id: id,
        color,
      });
      setName("");
      setDescription("");
      setShowCreate(false);
      toast.success("Instruction created");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleRename = async (gid: string) => {
    if (!editName.trim()) return;
    try {
      await updateGroup.mutateAsync({ id: gid, name: editName.trim() });
      setEditingId(null);
      toast.success("Instruction renamed");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (gid: string) => {
    if (!confirm("Delete this instruction? Versions and thread links will be removed.")) return;
    try {
      await deleteGroup.mutateAsync(gid);
      toast.success("Instruction deleted");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-[1000px] mx-auto px-5 py-10">
        <Link
          to="/groups"
          className="inline-flex items-center gap-1.5 label-mono text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Groups
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-foreground/80">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 flex-shrink-0" style={{ backgroundColor: category?.color || "#6366F1" }} />
            <div>
              <h1 className="text-2xl tracking-tight">{category?.name ?? "Group"}</h1>
              <p className="label-mono text-muted-foreground mt-1">{instructions.length} instructions</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> New instruction
          </Button>
        </div>

        {showCreate && (
          <div className="panel panel-strong p-5 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="label-mono">New instruction</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Instruction name (e.g., Tech Lead, Art Director)"
                className="w-full h-10 px-3 bg-background border rule text-sm focus:outline-none focus:border-primary"
              />
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this persona for?"
                className="w-full h-10 px-3 bg-background border rule text-sm focus:outline-none focus:border-primary"
              />
              <div className="flex items-center gap-2">
                <span className="label-mono text-muted-foreground">Color</span>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    aria-label={`Color ${c}`}
                    className={`w-5 h-5 border-2 transition-all ${color === c ? "border-foreground" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <Button onClick={handleCreate} disabled={createGroup.isPending || !name.trim()} size="sm">
                {createGroup.isPending ? "Creating…" : "Create instruction"}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 border-t rule">
          {instructions.map((g) => (
            <div key={g.id} className="flex items-center gap-3 py-4 border-b rule group">
              {editingId === g.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 h-9 px-3 bg-background border rule text-sm focus:outline-none focus:border-primary"
                  />
                  <Button size="sm" onClick={() => handleRename(g.id)}>Save</Button>
                  <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link to={`/instructions/${g.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-2 h-2 flex-shrink-0" style={{ backgroundColor: g.color || "#6366F1" }} />
                    <span className="text-base text-foreground truncate hover:text-primary-dark transition-colors">
                      {g.name}
                    </span>
                    {g.description && (
                      <span className="hidden sm:block text-sm text-muted-foreground truncate">{g.description}</span>
                    )}
                  </Link>
                  <button
                    onClick={() => {
                      setEditingId(g.id);
                      setEditName(g.name);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-foreground"
                    aria-label="Rename instruction"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive"
                    aria-label="Delete instruction"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <Link to={`/instructions/${g.id}`} aria-label="Open instruction">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </>
              )}
            </div>
          ))}
          {instructions.length === 0 && !showCreate && (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">No instructions in this group yet.</p>
              <Button size="sm" className="mt-4" onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4" /> Create the first one
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default CategoryDetail;
