import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { instructionSets, threads } from "@/lib/seed-data";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Suggestion = {
  suggestion: string;
  reasoning: string;
  priority: "high" | "medium" | "low";
};

type InstructionInsights = {
  instructionId: string;
  title: string;
  suggestions: Suggestion[];
  loading: boolean;
  error?: string;
};

const priorityColor = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};

const OptimizationWorkspace = () => {
  const [insights, setInsights] = useState<InstructionInsights[]>(
    instructionSets.map(is => ({
      instructionId: is.id,
      title: is.name,
      suggestions: [],
      loading: false,
    }))
  );

  const analyzeInstruction = async (instructionId: string) => {
    const is = instructionSets.find(i => i.id === instructionId);
    if (!is) return;

    const linkedThreads = threads.filter(t => is.linkedThreadIds.includes(t.id));
    const latestVersion = is.versions[is.versions.length - 1];

    setInsights(prev => prev.map(i =>
      i.instructionId === instructionId ? { ...i, loading: true, error: undefined } : i
    ));

    try {
      const { data, error } = await supabase.functions.invoke("optimize-instructions", {
        body: {
          instructionName: is.name,
          instructionContent: latestVersion.content,
          threadContents: linkedThreads.map(t => t.content),
        },
      });

      if (error) throw error;

      setInsights(prev => prev.map(i =>
        i.instructionId === instructionId
          ? { ...i, loading: false, suggestions: data.suggestions ?? [] }
          : i
      ));
    } catch (e: any) {
      const msg = e?.message ?? "Failed to analyze";
      toast.error(msg);
      setInsights(prev => prev.map(i =>
        i.instructionId === instructionId ? { ...i, loading: false, error: msg } : i
      ));
    }
  };

  return (
    <AppLayout>
      <div className="max-w-[1000px] mx-auto px-5 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary/60" />
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Optimization</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">AI-powered analysis of linked threads to improve your instructions</p>
        </div>

        <div className="space-y-4">
          {insights.map((group, gi) => {
            const linkedCount = threads.filter(t => t.linkedInstructionIds.includes(group.instructionId)).length;
            return (
              <motion.div
                key={group.instructionId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: gi * 0.08 }}
                className="rounded-lg border border-border/20 overflow-hidden"
              >
                <div className="bg-card/20 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="font-medium text-sm text-foreground mb-0.5">{group.title}</h2>
                      <p className="text-[10px] text-muted-foreground/40 font-mono">{linkedCount} linked thread(s)</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => analyzeInstruction(group.instructionId)}
                      disabled={group.loading || linkedCount === 0}
                      className="text-[10px] text-muted-foreground/40 hover:text-foreground h-7"
                    >
                      {group.loading ? (
                        <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Analyzing...</>
                      ) : (
                        <><Sparkles className="w-3 h-3 mr-1" /> Analyze</>
                      )}
                    </Button>
                  </div>

                  {group.error && (
                    <div className="flex items-center gap-2 p-3 rounded bg-destructive/5 border border-destructive/10 mb-3">
                      <AlertCircle className="w-3 h-3 text-destructive flex-shrink-0" />
                      <p className="text-[11px] text-destructive/70">{group.error}</p>
                    </div>
                  )}

                  {group.suggestions.length > 0 && (
                    <div className="space-y-2">
                      {group.suggestions.map((s, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 rounded bg-background border border-border/10">
                          <CheckCircle className="w-3 h-3 text-primary/40 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-[11px] text-foreground/70 font-medium">{s.suggestion}</p>
                              <span className={`text-[8px] uppercase tracking-wider font-medium ${priorityColor[s.priority]}`}>
                                {s.priority}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/40 leading-relaxed">{s.reasoning}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {group.suggestions.length === 0 && !group.loading && !group.error && (
                    <p className="text-[10px] text-muted-foreground/30 text-center py-4">Click "Analyze" to generate AI suggestions</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default OptimizationWorkspace;
