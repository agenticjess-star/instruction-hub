import { motion } from "framer-motion";

const capture = [
  { n: "A", label: "Telegram", detail: "Forward a share link or transcript. Firecrawl extracts the page." },
  { n: "B", label: "MCP client", detail: "Your agent writes the thread back through create_thread." },
  { n: "C", label: "Paste", detail: "Drop a raw copied page into the thread library." },
];

const loop = [
  {
    n: "01",
    stage: "Clean",
    detail: "Raw text is split into labelled user and assistant messages — no summarizing.",
  },
  {
    n: "02",
    stage: "Tag",
    detail: "The thread is filed against the instruction it was actually run with.",
  },
  {
    n: "03",
    stage: "Rate & annotate",
    detail: "Rate the outcome and comment on the exact message that went right or wrong.",
  },
  {
    n: "04",
    stage: "Roll up",
    detail: "Ratings and comments accumulate under one instruction as evidence.",
  },
  {
    n: "05",
    stage: "Optimize",
    detail: "AI reads the evidence against the current version and drafts the next one.",
  },
  {
    n: "06",
    stage: "Promote",
    detail: "One version is marked production. It becomes the new baseline.",
    output: true,
  },
];

const FeedbackLoopDiagram = () => {
  return (
    <section id="loop" className="section-pad border-b border-foreground/80">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h2 className="display-lg max-w-[14ch]">The instruction feedback loop.</h2>
          <p className="text-sm text-muted-foreground max-w-[42ch]">
            Threads are the evidence. Instructions are the artifact. Every promoted version becomes the
            baseline the next thread is measured against.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 grid gap-px bg-[hsl(var(--rule)/0.16)] border rule lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]"
        >
          {/* Intake column */}
          <div className="bg-background">
            <div className="flex items-center justify-between px-5 py-3 border-b border-foreground/80">
              <span className="label-mono">Intake</span>
              <span className="label-mono text-muted-foreground">3 channels</span>
            </div>
            {capture.map((c) => (
              <div key={c.n} className="px-5 py-5 border-b rule">
                <div className="flex items-baseline gap-3">
                  <span className="label-mono text-muted-foreground">{c.n}</span>
                  <span className="text-base text-foreground">{c.label}</span>
                </div>
                <p className="mt-2 pl-7 text-sm text-muted-foreground">{c.detail}</p>
              </div>
            ))}
            <div className="px-5 py-5">
              <p className="label-mono text-muted-foreground">Output</p>
              <p className="mt-2 text-sm text-foreground">
                One thread record, cleaned into messages, waiting to be tagged.
              </p>
              <p className="mt-4 label-mono text-primary-dark" aria-hidden>
                ↓ enters the loop
              </p>
            </div>
          </div>

          {/* Loop column */}
          <div className="bg-background">
            <div className="flex items-center justify-between px-5 py-3 border-b border-foreground/80">
              <span className="label-mono">Loop</span>
              <span className="label-mono text-muted-foreground">Thread → Instruction → Thread</span>
            </div>
            {loop.map((s) => (
              <div
                key={s.n}
                className={`grid grid-cols-[2rem_minmax(0,1fr)] md:grid-cols-[2.5rem_minmax(0,0.55fr)_minmax(0,1.45fr)] gap-x-4 gap-y-1 px-5 py-4 border-b rule ${
                  s.output ? "bg-primary/[0.09]" : ""
                }`}
              >
                <span className="label-mono text-muted-foreground">{s.n}</span>
                <span className="text-sm text-foreground">{s.stage}</span>
                <span className="col-start-2 md:col-start-3 text-sm text-muted-foreground">{s.detail}</span>
              </div>
            ))}
            <div className="px-5 py-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <p className="label-mono text-primary-dark" aria-hidden>
                ↺ promoted version becomes the next baseline
              </p>
              <p className="label-mono text-muted-foreground">Served over MCP · public endpoint</p>
            </div>
          </div>
        </motion.div>

        {/* Flow ribbon */}
        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 label-mono text-muted-foreground">
          {["Capture", "Clean", "Tag", "Rate", "Roll up", "Optimize", "Promote"].map((step, i, arr) => (
            <span key={step} className="flex items-center gap-3">
              <span className={i === arr.length - 1 ? "text-primary-dark" : ""}>{step}</span>
              <span aria-hidden className="text-faint">
                {i === arr.length - 1 ? "↺" : "→"}
              </span>
            </span>
          ))}
          <span className="text-foreground">back to Capture</span>
        </div>
      </div>
    </section>
  );
};

export default FeedbackLoopDiagram;
