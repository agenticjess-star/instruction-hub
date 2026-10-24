import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useCategories,
  useCreateCategory,
  useCreateGroup,
  useCreateVersion,
} from "@/hooks/useInstructionGroups";
import AppLayout from "@/components/AppLayout";
import ImproveWithAI from "@/components/ImproveWithAI";
import { toast } from "sonner";

const NewInstruction = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetCategory = searchParams.get("category") ?? "";

  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const createGroup = useCreateGroup();
  const createVersion = useCreateVersion();

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(presetCategory || "none");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [saving, setSaving] = useState(false);

  const canSave =
    name.trim().length > 0 &&
    content.trim().length > 0 &&
    (categoryId !== "new" || newCategoryName.trim().length > 0);

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      let finalCategoryId: string | undefined;
      if (categoryId === "new") {
        const cat = await createCategory.mutateAsync({ name: newCategoryName.trim() });
        finalCategoryId = cat.id;
      } else if (categoryId !== "none") {
        finalCategoryId = categoryId;
      }
      const group = await createGroup.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        ...(finalCategoryId ? { category_id: finalCategoryId } : {}),
      });
      await createVersion.mutateAsync({
        group_id: group.id,
        content: content.trim(),
        notes: "Initial version",
        version_number: 1,
        is_production: true,
      });
      toast.success("Instruction created");
      navigate(`/instructions/${group.id}`);
    } catch (e: any) {
      toast.error(e.message);
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-[1200px] mx-auto px-5 py-10">
        <Link
          to="/groups"
          className="inline-flex items-center gap-1.5 label-mono text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Groups
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-foreground/80">
          <div>
            <h1 className="text-2xl tracking-tight">New instruction</h1>
            <p className="label-mono text-muted-foreground mt-1">Name it, place it, write it</p>
          </div>
          <Button size="sm" variant={showAI ? "outline" : "default"} onClick={() => setShowAI((v) => !v)}>
            {showAI ? <X className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
            {showAI ? "Close AI editor" : "Improve with AI"}
          </Button>
        </div>

        <div className={`mt-6 grid gap-6 ${showAI ? "lg:grid-cols-[1fr_420px]" : ""}`}>
          {/* Form */}
          <div className="space-y-5 min-w-0">
            <div>
              <label htmlFor="instr-name" className="label-mono text-muted-foreground block mb-2">
                Name
              </label>
              <input
                id="instr-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Tech Lead, Art Director, Mentor"
                className="w-full h-11 px-3 bg-background border rule text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="instr-category" className="label-mono text-muted-foreground block mb-2">
                  Category
                </label>
                <select
                  id="instr-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-11 px-3 bg-background border rule text-sm focus:outline-none focus:border-primary"
                >
                  <option value="none">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  <option value="new">+ New category…</option>
                </select>
              </div>
              {categoryId === "new" && (
                <div>
                  <label htmlFor="instr-new-category" className="label-mono text-muted-foreground block mb-2">
                    New category name
                  </label>
                  <input
                    id="instr-new-category"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Developing, Creative"
                    className="w-full h-11 px-3 bg-background border rule text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="instr-description" className="label-mono text-muted-foreground block mb-2">
                Description <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <input
                id="instr-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this persona for?"
                className="w-full h-11 px-3 bg-background border rule text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="instr-content" className="label-mono text-muted-foreground block mb-2">
                Instructions
              </label>
              <textarea
                id="instr-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the system instructions here — the role, how it should behave, what it should never do…"
                rows={16}
                className="w-full px-3 py-3 bg-background border rule text-sm font-mono leading-relaxed focus:outline-none focus:border-primary resize-y min-h-[320px]"
              />
              <p className="label-mono text-muted-foreground/60 mt-2">
                Saved as version 1 and promoted to production.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button onClick={handleSave} disabled={!canSave || saving}>
                {saving ? "Saving…" : "Create instruction"}
              </Button>
              <Link to="/groups" className="label-mono text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </Link>
            </div>
          </div>

          {/* AI panel */}
          {showAI && (
            <div className="panel panel-strong h-[70vh] min-h-[420px] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b rule">
                <span className="label-mono text-muted-foreground">Improve with AI</span>
                <button
                  onClick={() => setShowAI(false)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Close AI editor"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <ImproveWithAI
                  instructionName={name}
                  instructionContent={content}
                  onUseDraft={(text) => setContent(text)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default NewInstruction;
