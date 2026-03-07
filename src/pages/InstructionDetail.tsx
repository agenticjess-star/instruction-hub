import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, Clock, MessageSquare, CheckCircle, Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { instructionSets, threads, tags } from "@/lib/seed-data";
import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { toast } from "sonner";

const getTagName = (id: string) => tags.find(t => t.id === id)?.name ?? id;

const InstructionDetail = () => {
  const { id } = useParams();
  const instruction = instructionSets.find(i => i.id === id);
  const [activeTab, setActiveTab] = useState<"editor" | "versions" | "threads">("editor");

  if (!instruction) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-xs text-muted-foreground">Instruction set not found.</p>
        </div>
      </AppLayout>
    );
  }

  const prodVersion = instruction.versions.find(v => v.isProduction);
  const latestVersion = instruction.versions[instruction.versions.length - 1];
  const linkedThreads = threads.filter(t => instruction.linkedThreadIds.includes(t.id));

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  return (
    <AppLayout>
      <div className="max-w-[1000px] mx-auto px-5 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back
        </Link>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-foreground tracking-tight">{instruction.name}</h1>
              {prodVersion && (
                <span className="flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-success/8 text-success border border-success/10">
                  <Globe className="w-2.5 h-2.5" /> v{prodVersion.versionNumber}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{instruction.description}</p>
          </div>
          {prodVersion && (
            <Link to={`/p/${instruction.slug}`}>
              <Button size="sm" variant="outline" className="border-border/40 text-xs h-7 text-muted-foreground hover:text-foreground">
                <Globe className="w-3 h-3 mr-1.5" /> Endpoint
              </Button>
            </Link>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-6">
          {instruction.tags.map(t => (
            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground/60">{getTagName(t)}</span>
          ))}
          <span className="text-[10px] text-muted-foreground/30 ml-1 font-mono">{new Date(instruction.updatedAt).toLocaleDateString()}</span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 mb-6">
          {(["editor", "versions", "threads"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-[11px] font-medium transition-all duration-300 rounded ${
                activeTab === tab
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground/50 hover:text-foreground"
              }`}
            >
              {tab === "editor" ? "Editor" : tab === "versions" ? `Versions (${instruction.versions.length})` : `Threads (${linkedThreads.length})`}
            </button>
          ))}
        </div>

        {/* Editor Tab */}
        {activeTab === "editor" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="rounded-lg border border-border/20 overflow-hidden">
              <div className="bg-card/40 backdrop-blur-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-muted-foreground/40 font-mono tracking-wider">
                    v{latestVersion.versionNumber} · {latestVersion.isProduction ? "production" : "draft"}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => copyContent(latestVersion.content)} className="text-muted-foreground/40 hover:text-foreground h-6 text-[10px]">
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                </div>
                <pre className="font-mono text-xs text-foreground/70 whitespace-pre-wrap leading-relaxed">{latestVersion.content}</pre>
              </div>
            </div>
          </motion.div>
        )}

        {/* Versions Tab */}
        {activeTab === "versions" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-px rounded-lg overflow-hidden border border-border/20">
            {[...instruction.versions].reverse().map((v) => (
              <div key={v.id} className="bg-background hover:bg-card/20 transition-colors duration-500 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      v.isProduction ? "bg-success/8 border border-success/10" : "bg-secondary"
                    }`}>
                      {v.isProduction ? (
                        <CheckCircle className="w-3 h-3 text-success" />
                      ) : (
                        <Clock className="w-3 h-3 text-muted-foreground/40" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs text-foreground">Version {v.versionNumber}</span>
                        {v.isProduction && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-success/8 text-success border border-success/10 uppercase tracking-wider">Production</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{v.notes}</p>
                      <p className="text-[9px] text-muted-foreground/30 mt-1 font-mono">{new Date(v.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!v.isProduction && (
                      <Button size="sm" variant="ghost" className="text-[10px] text-muted-foreground/40 hover:text-foreground h-6 px-2">
                        <Globe className="w-2.5 h-2.5 mr-1" /> Promote
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-[10px] text-muted-foreground/30 hover:text-foreground h-6 px-2">
                      <RotateCcw className="w-2.5 h-2.5 mr-1" /> Restore
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Threads Tab */}
        {activeTab === "threads" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {linkedThreads.length === 0 ? (
              <p className="text-muted-foreground/40 text-xs py-12 text-center">No linked threads.</p>
            ) : (
              <div className="space-y-px rounded-lg overflow-hidden border border-border/20">
                {linkedThreads.map(th => (
                  <div key={th.id} className="bg-background hover:bg-card/20 transition-colors duration-500 p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-medium text-xs text-foreground">{th.title}</h3>
                        <p className="text-[10px] text-muted-foreground/40 mt-0.5 font-mono">{th.platform} · {th.model} · {new Date(th.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => copyContent(th.content)} className="text-muted-foreground/30 hover:text-foreground flex-shrink-0 h-6">
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <pre className="font-mono text-[10px] text-muted-foreground/40 whitespace-pre-wrap line-clamp-4 leading-relaxed">{th.content}</pre>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default InstructionDetail;
