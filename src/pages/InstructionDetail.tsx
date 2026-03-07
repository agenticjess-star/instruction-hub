import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, Clock, MessageSquare, Tag as TagIcon, CheckCircle, Copy, RotateCcw } from "lucide-react";
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
          <p className="text-muted-foreground">Instruction set not found.</p>
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
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Header */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{instruction.name}</h1>
              {prodVersion && (
                <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
                  <Globe className="w-3 h-3" /> Production v{prodVersion.versionNumber}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{instruction.description}</p>
          </div>
          {prodVersion && (
            <Link to={`/p/${instruction.slug}`}>
              <Button size="sm" variant="outline" className="border-border text-foreground">
                <Globe className="w-4 h-4 mr-2" /> View Public Endpoint
              </Button>
            </Link>
          )}
        </div>

        {/* Tags & Meta */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {instruction.tags.map(t => (
            <span key={t} className="text-xs px-2.5 py-1 rounded-full surface-2 text-muted-foreground">{getTagName(t)}</span>
          ))}
          <span className="text-xs text-muted-foreground ml-2">Updated {new Date(instruction.updatedAt).toLocaleDateString()}</span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-border">
          {(["editor", "versions", "threads"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "editor" ? "Editor" : tab === "versions" ? `Versions (${instruction.versions.length})` : `Threads (${linkedThreads.length})`}
            </button>
          ))}
        </div>

        {/* Editor Tab */}
        {activeTab === "editor" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="glass rounded-xl p-1">
              <div className="rounded-lg surface-2 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-muted-foreground font-mono">
                    v{latestVersion.versionNumber} · {latestVersion.isProduction ? "Production" : "Draft"}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => copyContent(latestVersion.content)} className="text-muted-foreground hover:text-foreground">
                    <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                  </Button>
                </div>
                <pre className="font-mono text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{latestVersion.content}</pre>
              </div>
            </div>
          </motion.div>
        )}

        {/* Versions Tab */}
        {activeTab === "versions" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {[...instruction.versions].reverse().map((v, i) => (
              <div key={v.id} className="glass rounded-xl p-5 relative">
                {i < instruction.versions.length - 1 && (
                  <div className="absolute left-8 top-full w-px h-4 bg-border" />
                )}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      v.isProduction ? "bg-success/10" : "surface-2"
                    }`}>
                      {v.isProduction ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">Version {v.versionNumber}</span>
                        {v.isProduction && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">Production</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{v.notes}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(v.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!v.isProduction && (
                      <Button size="sm" variant="outline" className="text-xs border-border text-foreground">
                        <Globe className="w-3 h-3 mr-1" /> Promote
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-xs text-muted-foreground">
                      <RotateCcw className="w-3 h-3 mr-1" /> Restore
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Threads Tab */}
        {activeTab === "threads" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {linkedThreads.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">No linked threads yet.</p>
            ) : (
              linkedThreads.map(th => (
                <div key={th.id} className="glass rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-medium text-foreground">{th.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{th.platform} · {th.model} · {new Date(th.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => copyContent(th.content)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap line-clamp-6 leading-relaxed">{th.content}</pre>
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default InstructionDetail;
