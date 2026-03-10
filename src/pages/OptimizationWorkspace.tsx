import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle, Loader2, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroups, useVersions, useThreads, useCreateVersion } from "@/hooks/useInstructionGroups";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Suggestion = {
  suggestion: string;
  reasoning: string;
  priority: "high" | "medium" | "low";
};

type GroupInsights = {
  groupId: string;
  suggestions: Suggestion[];
  loading: boolean;
  error?: string;
  applied?: boolean;
};

const priorityColor = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};

const OptimizationWorkspace = () => {
  const { data: groups = [] } = useGroups();
  const [insights, setInsights] = useState<Record<string, GroupInsights>>({});

  const analyzeGroup = async (groupId: string) => {
    setInsights(prev => ({ ...prev, [groupId]: { groupId, suggestions: [], loading: true } }));

    try {
      // Fetch versions and threads for this group
      const [versionsRes, threadsRes] = await Promise.all([
        supabase.from("instruction_versions").select("*").eq("group_id", groupId).order("version_number", { ascending: false }).limit(1),
        supabase.from("threads").select("*").eq("group_id", groupId),
      ]);

      const latestVersion = versionsRes.data?.[0];
      const threads = threadsRes.data || [];

      if (!latestVersion) {
        setInsights(prev => ({ ...prev, [groupId]: { groupId, suggestions: [], loading: false, error: "No versions to analyze" } }));
        return;
      }

      const group = groups.find(g => g.id === groupId);
      const { data, error } = await supabase.functions.invoke("optimize-instructions", {
        body: {
          instructionName: group?.name ?? "Unknown",
          instructionContent: latestVersion.content,
          threadContents: threads.map((t: any) => t.cleaned_content || t.raw_content),
        },
      });

      if (error) throw error;

      setInsights(prev => ({ ...prev, [groupId]: { groupId, suggestions: data.suggestions ?? [], loading: false } }));
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to analyze");
      setInsights(prev => ({ ...prev, [groupId]: { groupId, suggestions: [], loading: false, error: e?.message } }));
    }
  };

  const autoApply = async (groupId: string) => {
    const insight = insights[groupId];
    if (!insight || insight.suggestions.length === 0) return;

    try {
      const versionsRes = await supabase.from("instruction_versions").select("*").eq("group_id", groupId).order("version_number", { ascending: false }).limit(1);
      const latest = versionsRes.data?.[0];
      if (!latest) return;

      // Create an enhanced version incorporating suggestions
      const suggestionsText = insight.suggestions.map(s => `- ${s.suggestion}`).join("\n");
      const enhanced = `${latest.content}\n\n--- Applied Optimizations ---\n${suggestionsText}`;

      await supabase.from("instruction_versions").insert({
        group_id: groupId,
        content: enhanced,
        notes: `Auto-optimized: ${insight.suggestions.length} suggestions applied`,
        version_number: latest.version_number + 1,
        is_production: false,
      });

      setInsights(prev => ({ ...prev, [groupId]: { ...prev[groupId], applied: true } }));
      toast.success("Suggestions applied as new version");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-[1000px] mx-auto px-5 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4.5 h-4.5 text-primary" />
            <h1 className="text-xl font-bold text-foreground tracking-tight">Optimization</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">AI-powered analysis of linked threads to improve your instructions</p>
        </div>

        <div className="space-y-3">
          {groups.map((group, gi) => {
            const insight = insights[group.id];
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.05 }}
                className="card-elevated overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="font-semibold text-sm text-foreground mb-0.5">{group.name}</h2>
                      <p className="text-[11px] text-muted-foreground/50">{group.description || "No description"}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => analyzeGroup(group.id)}
                      disabled={insight?.loading}
                      className="text-xs bg-primary/10 text-primary hover:bg-primary/20 h-8 font-semibold border border-primary/15"
                    >
                      {insight?.loading ? (
                        <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Analyzing...</>
                      ) : (
                        <><Sparkles className="w-3 h-3 mr-1" /> Analyze</>
                      )}
                    </Button>
                  </div>

                  {insight?.error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/8 border border-destructive/15 mb-3">
                      <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                      <p className="text-xs text-destructive/80">{insight.error}</p>
                    </div>
                  )}

                  {insight && insight.suggestions.length > 0 && (
                    <>
                      <div className="space-y-2 mb-4">
                        {insight.suggestions.map((s, i) => (
                          <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-secondary/50 border border-border/30">
                            <CheckCircle className="w-3.5 h-3.5 text-primary/50 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-xs text-foreground/80 font-medium">{s.suggestion}</p>
                                <span className={`text-[9px] uppercase tracking-wider font-bold ${priorityColor[s.priority]}`}>
                                  {s.priority}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground/50 leading-relaxed">{s.reasoning}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {!insight.applied && (
                        <Button
                          size="sm"
                          onClick={() => autoApply(group.id)}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-9"
                        >
                          <Zap className="w-3.5 h-3.5 mr-1.5" /> Auto-Apply All
                        </Button>
                      )}
                      {insight.applied && (
                        <p className="text-xs text-success font-medium flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> Applied as new version
                        </p>
                      )}
                    </>
                  )}

                  {(!insight || (insight.suggestions.length === 0 && !insight.loading && !insight.error)) && (
                    <p className="text-xs text-muted-foreground/40 text-center py-4">Click "Analyze" to generate AI suggestions</p>
                  )}
                </div>
              </motion.div>
            );
          })}

          {groups.length === 0 && (
            <div className="card-elevated p-12 text-center">
              <p className="text-sm text-muted-foreground">Create instruction groups first, then come here to optimize them.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default OptimizationWorkspace;
