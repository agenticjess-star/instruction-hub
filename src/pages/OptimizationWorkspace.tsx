import { motion } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { instructionSets, threads } from "@/lib/seed-data";
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
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Optimization Workspace</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">AI-generated insights from your linked threads to improve instructions</p>
        </div>

        <div className="space-y-6">
          {insights.map((group, gi) => (
            <motion.div
              key={group.instructionId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.1 }}
              className="glass rounded-xl p-6"
            >
              <h2 className="font-semibold text-foreground mb-1">{group.title}</h2>
              <p className="text-xs text-muted-foreground mb-4">
                Based on {threads.filter(t => t.linkedInstructionIds.includes(group.instructionId)).length} linked thread(s)
              </p>
              <div className="space-y-3">
                {group.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg surface-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground/80 leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button size="sm" variant="outline" className="text-xs border-border text-foreground">
                  Apply Suggestions <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default OptimizationWorkspace;
