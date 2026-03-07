import { motion } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { threads } from "@/lib/seed-data";
import AppLayout from "@/components/AppLayout";

const insights = [
  {
    instructionId: "is1",
    title: "Voice Teaching Mode",
    suggestions: [
      "Thread analysis shows advanced learners disengage when scaffolding starts too basic. Consider adding an initial assessment question to calibrate complexity.",
      "The Socratic questioning pattern works well in 85% of cases. Add a fallback for learners who prefer direct explanations.",
      "Consider adding output format flexibility — some learners prefer structured outlines over conversational responses.",
    ],
  },
  {
    instructionId: "is2",
    title: "Sales Qualifier",
    suggestions: [
      "Thread data suggests prospects respond better when the first question focuses on pain points rather than team size.",
      "Add competitive intelligence gathering — 60% of qualified leads mention evaluating alternatives.",
    ],
  },
  {
    instructionId: "is3",
    title: "Research Synthesizer",
    suggestions: [
      "Consider adding a 'methodology quality assessment' section to distinguish empirical from theoretical sources.",
    ],
  },
];

const OptimizationWorkspace = () => {
  return (
    <AppLayout>
      <div className="max-w-[1000px] mx-auto px-5 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary/60" />
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Optimization</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">AI-generated insights from linked threads</p>
        </div>

        <div className="space-y-4">
          {insights.map((group, gi) => (
            <motion.div
              key={group.instructionId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: gi * 0.08 }}
              className="rounded-lg border border-border/20 overflow-hidden"
            >
              <div className="bg-card/20 p-5">
                <h2 className="font-medium text-sm text-foreground mb-0.5">{group.title}</h2>
                <p className="text-[10px] text-muted-foreground/40 mb-4 font-mono">
                  {threads.filter(t => t.linkedInstructionIds.includes(group.instructionId)).length} linked thread(s)
                </p>
                <div className="space-y-2">
                  {group.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded bg-background border border-border/10">
                      <CheckCircle className="w-3 h-3 text-primary/40 mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-foreground/60 leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button size="sm" variant="ghost" className="text-[10px] text-muted-foreground/40 hover:text-foreground h-7">
                    Apply Suggestions <ArrowRight className="w-2.5 h-2.5 ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default OptimizationWorkspace;
