import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Globe, Clock, MessageSquare, CheckCircle, Copy, RotateCcw, Plus, X, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroup, useVersions, useThreads, useCreateVersion, usePromoteVersion, useCreateThread, useThreadComments, useCreateComment } from "@/hooks/useInstructionGroups";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";
import { cleanThreadContent } from "@/lib/cleanThread";

const GroupDetail = () => {
  const { id } = useParams();
  const { data: group } = useGroup(id);
  const { data: versions = [] } = useVersions(id);
  const { data: groupThreads = [] } = useThreads(id);
  const createVersion = useCreateVersion();
  const promoteVersion = usePromoteVersion();
  const createThread = useCreateThread();

  const [activeTab, setActiveTab] = useState<"editor" | "versions" | "threads">("editor");
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [showAddThread, setShowAddThread] = useState(false);
  const [threadTitle, setThreadTitle] = useState("");
  const [threadRaw, setThreadRaw] = useState("");
  const [threadPlatform, setThreadPlatform] = useState("");
  const [threadModel, setThreadModel] = useState("");
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

  if (!group) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  const prodVersion = versions.find(v => v.is_production);
  const latestVersion = versions[0]; // already sorted desc

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const handleCreateVersion = async () => {
    if (!newContent.trim()) return;
    try {
      await createVersion.mutateAsync({
        group_id: group.id,
        content: newContent.trim(),
        notes: newNotes.trim(),
        version_number: (versions.length > 0 ? versions[0].version_number : 0) + 1,
      });
      setNewContent("");
      setNewNotes("");
      setShowNewVersion(false);
      toast.success("Version created");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handlePromote = async (versionId: string) => {
    try {
      await promoteVersion.mutateAsync({ versionId, groupId: group.id });
      toast.success("Version promoted to production");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleAddThread = async () => {
    if (!threadTitle.trim() || !threadRaw.trim()) return;
    const cleaned = cleanThreadContent(threadRaw);
    try {
      await createThread.mutateAsync({
        title: threadTitle.trim(),
        raw_content: threadRaw,
        cleaned_content: cleaned,
        group_id: group.id,
        platform: threadPlatform,
        model: threadModel,
      });
      setThreadTitle("");
      setThreadRaw("");
      setThreadPlatform("");
      setThreadModel("");
      setShowAddThread(false);
      toast.success("Thread added & cleaned");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-[1000px] mx-auto px-5 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-foreground mb-6 transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-foreground tracking-tight">{group.name}</h1>
              {prodVersion && (
                <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-success/10 text-success border border-success/15">
                  <Globe className="w-3 h-3" /> v{prodVersion.version_number}
                </span>
              )}
            </div>
            {group.description && <p className="text-xs text-muted-foreground mt-1">{group.description}</p>}
          </div>
          {prodVersion && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyContent(prodVersion.content)}
              className="border-border/50 text-xs h-8 font-semibold text-muted-foreground hover:text-foreground hover:border-primary/30"
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Production
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-secondary/50 rounded-lg w-fit border border-border/30">
          {(["editor", "versions", "threads"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 rounded-md ${
                activeTab === tab
                  ? "text-primary bg-primary/8 border border-primary/15 shadow-sm"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              {tab === "editor" ? "Editor" : tab === "versions" ? `Versions (${versions.length})` : `Threads (${groupThreads.length})`}
            </button>
          ))}
        </div>

        {/* Editor Tab */}
        {activeTab === "editor" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {latestVersion ? (
              <div className="card-elevated overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] text-muted-foreground font-mono tracking-wider font-medium">
                      v{latestVersion.version_number} · {latestVersion.is_production ? "production" : "draft"}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => copyContent(latestVersion.content)} className="text-muted-foreground/50 hover:text-foreground h-7 text-xs">
                        <Copy className="w-3 h-3 mr-1" /> Copy
                      </Button>
                      <Button size="sm" onClick={() => { setNewContent(latestVersion.content); setShowNewVersion(true); }} className="bg-primary/10 text-primary hover:bg-primary/20 h-7 text-xs font-semibold border border-primary/15">
                        <Plus className="w-3 h-3 mr-1" /> New Version
                      </Button>
                    </div>
                  </div>
                  <pre className="font-mono text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed">{latestVersion.content}</pre>
                </div>
              </div>
            ) : (
              <div className="card-elevated p-8 text-center">
                <p className="text-sm text-muted-foreground mb-3">No versions yet</p>
                <Button size="sm" onClick={() => setShowNewVersion(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-9">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Create First Version
                </Button>
              </div>
            )}

            {/* New Version Form */}
            <AnimatePresence>
              {showNewVersion && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card-elevated p-5 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm text-foreground">New Version</h3>
                    <button onClick={() => setShowNewVersion(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                  </div>
                  <textarea
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder="Paste your instructions here..."
                    rows={10}
                    className="w-full px-3.5 py-3 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-y font-mono leading-relaxed"
                  />
                  <input
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                    placeholder="Version notes (e.g., 'Added error handling section')"
                    className="w-full h-10 px-3.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all mt-3"
                  />
                  <Button onClick={handleCreateVersion} disabled={createVersion.isPending} className="mt-3 h-9 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                    {createVersion.isPending ? "Saving..." : "Save Version"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Versions Tab */}
        {activeTab === "versions" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-2">
            {versions.map((v) => (
              <div key={v.id} className="card-interactive p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      v.is_production ? "bg-success/10 border border-success/15" : "bg-secondary border border-border/30"
                    }`}>
                      {v.is_production ? (
                        <CheckCircle className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-muted-foreground/50" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground">Version {v.version_number}</span>
                        {v.is_production && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-success/10 text-success border border-success/15 uppercase tracking-wider font-bold">Production</span>
                        )}
                      </div>
                      {v.notes && <p className="text-xs text-muted-foreground mt-0.5">{v.notes}</p>}
                      <p className="text-[10px] text-muted-foreground/40 mt-1 font-mono">{new Date(v.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => copyContent(v.content)} className="text-xs text-muted-foreground/50 hover:text-foreground h-7 px-2">
                      <Copy className="w-3 h-3" />
                    </Button>
                    {!v.is_production && (
                      <Button size="sm" variant="ghost" onClick={() => handlePromote(v.id)} className="text-xs text-muted-foreground/50 hover:text-primary h-7 px-2">
                        <Globe className="w-3 h-3 mr-1" /> Promote
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {versions.length === 0 && (
              <p className="text-muted-foreground/50 text-xs py-12 text-center">No versions yet.</p>
            )}
          </motion.div>
        )}

        {/* Threads Tab */}
        {activeTab === "threads" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="flex justify-end mb-4">
              <Button size="sm" onClick={() => setShowAddThread(true)} className="bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold h-8 border border-primary/15">
                <Plus className="w-3 h-3 mr-1" /> Add Thread
              </Button>
            </div>

            <AnimatePresence>
              {showAddThread && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card-elevated p-5 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm text-foreground">Paste Thread</h3>
                    <button onClick={() => setShowAddThread(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-3">
                    <input
                      value={threadTitle}
                      onChange={e => setThreadTitle(e.target.value)}
                      placeholder="Thread title"
                      className="w-full h-10 px-3.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input value={threadPlatform} onChange={e => setThreadPlatform(e.target.value)} placeholder="Platform (ChatGPT, Claude...)" className="h-10 px-3.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all" />
                      <input value={threadModel} onChange={e => setThreadModel(e.target.value)} placeholder="Model (GPT-4, Claude 3.5...)" className="h-10 px-3.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all" />
                    </div>
                    <textarea
                      value={threadRaw}
                      onChange={e => setThreadRaw(e.target.value)}
                      placeholder="Paste the entire thread here — we'll auto-clean it..."
                      rows={8}
                      className="w-full px-3.5 py-3 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-y font-mono"
                    />
                    <Button onClick={handleAddThread} disabled={createThread.isPending} className="h-9 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                      {createThread.isPending ? "Saving..." : "Add & Clean Thread"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              {groupThreads.map(th => (
                <ThreadCard key={th.id} thread={th} onCopy={copyContent} selectedThread={selectedThread} onSelect={setSelectedThread} />
              ))}
              {groupThreads.length === 0 && !showAddThread && (
                <p className="text-muted-foreground/50 text-xs py-12 text-center">No linked threads. Add one to start tracking conversations.</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

function ThreadCard({ thread, onCopy, selectedThread, onSelect }: {
  thread: any;
  onCopy: (c: string) => void;
  selectedThread: string | null;
  onSelect: (id: string | null) => void;
}) {
  const isExpanded = selectedThread === thread.id;
  const { data: comments = [] } = useThreadComments(isExpanded ? thread.id : undefined);
  const createComment = useCreateComment();
  const [newComment, setNewComment] = useState("");

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await createComment.mutateAsync({ thread_id: thread.id, content: newComment.trim() });
      setNewComment("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="card-interactive overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="cursor-pointer flex-1" onClick={() => onSelect(isExpanded ? null : thread.id)}>
            <h3 className="font-semibold text-xs text-foreground">{thread.title}</h3>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-mono">
              {thread.platform || "Unknown"} · {thread.model || "Unknown"} · {new Date(thread.created_at).toLocaleDateString()}
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => onCopy(thread.cleaned_content || thread.raw_content)} className="text-muted-foreground/40 hover:text-foreground flex-shrink-0 h-7">
            <Copy className="w-3 h-3" />
          </Button>
        </div>
        <pre className="font-mono text-[11px] text-muted-foreground/50 whitespace-pre-wrap line-clamp-3 leading-relaxed">{thread.cleaned_content || thread.raw_content}</pre>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border/30 overflow-hidden">
            <div className="p-4 bg-secondary/30">
              <h4 className="text-[11px] font-semibold text-muted-foreground mb-3">Comments</h4>
              {comments.map(c => (
                <div key={c.id} className="mb-2 p-2.5 rounded-md bg-background border border-border/20">
                  <p className="text-xs text-foreground/80">{c.content}</p>
                  <p className="text-[9px] text-muted-foreground/40 mt-1 font-mono">{new Date(c.created_at).toLocaleString()}</p>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddComment()}
                  placeholder="Add a comment..."
                  className="flex-1 h-8 px-3 rounded-md bg-background border border-border/30 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 transition-all"
                />
                <Button size="sm" onClick={handleAddComment} disabled={createComment.isPending} className="h-8 px-3 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/15">
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GroupDetail;
