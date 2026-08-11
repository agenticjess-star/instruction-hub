import { useParams, Link } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Copy, Edit3, Save, X, Send, MessageSquare, User, Bot, Tag,
  SmilePlus, Meh, Frown, Sparkles, Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useThread, useUpdateThread, useThreadComments, useCreateComment, useGroups,
} from "@/hooks/useInstructionGroups";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";
import { aiCleanThread, parseMessages } from "@/lib/threadMessages";

const RATINGS = [
  { value: "positive", icon: SmilePlus, label: "Good" },
  { value: "neutral", icon: Meh, label: "Okay" },
  { value: "negative", icon: Frown, label: "Bad" },
] as const;

const ThreadDetail = () => {
  const { id } = useParams();
  const { data: thread } = useThread(id);
  const { data: comments = [] } = useThreadComments(id);
  const { data: groups = [] } = useGroups();
  const updateThread = useUpdateThread();
  const createComment = useCreateComment();

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editRaw, setEditRaw] = useState("");
  const [editPlatform, setEditPlatform] = useState("");
  const [editModel, setEditModel] = useState("");
  const [newComment, setNewComment] = useState("");
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [recleaning, setRecleaning] = useState(false);

  // Annotation state
  const [annotating, setAnnotating] = useState<{ index: number; quote: string } | null>(null);
  const [annotationText, setAnnotationText] = useState("");
  const annotationInputRef = useRef<HTMLInputElement>(null);

  const messages = useMemo(
    () => (thread ? parseMessages(thread.cleaned_content || thread.raw_content) : []),
    [thread?.cleaned_content, thread?.raw_content],
  );

  if (!thread) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="label-mono text-muted-foreground">Loading…</p>
        </div>
      </AppLayout>
    );
  }

  const linkedGroup = groups.find((g) => g.id === thread.group_id);
  const generalComments = comments.filter((c) => c.message_index === null || c.message_index === undefined);
  const annotationsFor = (i: number) => comments.filter((c) => c.message_index === i);

  const startEdit = () => {
    setEditTitle(thread.title);
    setEditRaw(thread.raw_content);
    setEditPlatform(thread.platform || "");
    setEditModel(thread.model || "");
    setEditing(true);
  };

  const saveEdit = async () => {
    try {
      const result = await aiCleanThread(editRaw);
      await updateThread.mutateAsync({
        id: thread.id,
        title: editTitle.trim(),
        raw_content: editRaw,
        cleaned_content: result.content,
        platform: editPlatform,
        model: editModel,
      });
      setEditing(false);
      toast.success(result.usedAi ? "Thread updated and re-cleaned by AI" : "Thread updated (basic cleaning)");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const recleanWithAi = async () => {
    setRecleaning(true);
    try {
      const result = await aiCleanThread(thread.raw_content || thread.cleaned_content);
      await updateThread.mutateAsync({ id: thread.id, cleaned_content: result.content });
      toast[result.usedAi ? "success" : "warning"](
        result.usedAi ? `Split into ${result.messages.length} messages` : "AI unavailable — used basic cleaning",
      );
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setRecleaning(false);
    }
  };

  const assignGroup = async (groupId: string | null) => {
    try {
      await updateThread.mutateAsync({ id: thread.id, group_id: groupId });
      setShowTagPicker(false);
      toast.success(groupId ? "Instruction linked" : "Instruction unlinked");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const setRating = async (rating: string | null) => {
    try {
      const newRating = thread.rating === rating ? null : rating;
      await updateThread.mutateAsync({ id: thread.id, rating: newRating });
      toast.success(newRating ? "Rating saved" : "Rating cleared");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await createComment.mutateAsync({ thread_id: thread.id, content: newComment.trim(), message_index: null, quote: null });
      setNewComment("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const beginAnnotation = (index: number) => {
    const selection = window.getSelection()?.toString().trim() ?? "";
    setAnnotating({ index, quote: selection.slice(0, 500) });
    setAnnotationText("");
    requestAnimationFrame(() => annotationInputRef.current?.focus());
  };

  const saveAnnotation = async () => {
    if (!annotating || !annotationText.trim()) return;
    try {
      await createComment.mutateAsync({
        thread_id: thread.id,
        content: annotationText.trim(),
        message_index: annotating.index,
        quote: annotating.quote || null,
      });
      setAnnotating(null);
      setAnnotationText("");
      toast.success("Annotation added");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto px-5 py-8">
        <Link
          to="/threads"
          className="inline-flex items-center gap-1.5 label-mono text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Threads
        </Link>

        <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)] items-start">
          {/* ── Sidebar ── */}
          <aside className="lg:sticky lg:top-24 space-y-6">
            <div>
              <h1 className="text-lg tracking-tight text-foreground">{thread.title}</h1>
              <div className="mt-2 label-mono text-muted-foreground space-y-1">
                <p>{thread.platform || "Unknown platform"}</p>
                <p>{thread.model || "Unknown model"}</p>
                <p>{new Date(thread.created_at).toLocaleDateString()}</p>
                <p>{messages.length} messages</p>
              </div>
            </div>

            <div className="pt-5 border-t rule">
              <p className="label-mono text-muted-foreground mb-2">Instruction</p>
              {linkedGroup ? (
                <Link
                  to={`/instructions/${linkedGroup.id}`}
                  className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary-dark transition-colors"
                >
                  <span className="w-2 h-2" style={{ backgroundColor: linkedGroup.color || "#6366F1" }} />
                  {linkedGroup.name}
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">Not linked</p>
              )}
              <button
                onClick={() => setShowTagPicker(!showTagPicker)}
                className="mt-2 label-mono text-primary-dark hover:underline flex items-center gap-1"
              >
                <Tag className="w-3 h-3" /> {linkedGroup ? "Change" : "Link instruction"}
              </button>
              <AnimatePresence>
                {showTagPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <button
                        onClick={() => assignGroup(null)}
                        className={`label-mono px-2 py-1 border rule transition-colors ${
                          !thread.group_id ? "bg-primary/10 border-primary text-primary-dark" : "hover:border-foreground"
                        }`}
                      >
                        None
                      </button>
                      {groups.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => assignGroup(g.id)}
                          className={`label-mono px-2 py-1 border rule flex items-center gap-1.5 transition-colors ${
                            thread.group_id === g.id ? "border-foreground bg-foreground/[0.04]" : "hover:border-foreground"
                          }`}
                        >
                          <span className="w-1.5 h-1.5" style={{ backgroundColor: g.color || "#6366F1" }} />
                          {g.name}
                        </button>
                      ))}
                      {groups.length === 0 && (
                        <Link to="/groups" className="label-mono text-primary-dark hover:underline">
                          Create an instruction first →
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-5 border-t rule">
              <p className="label-mono text-muted-foreground mb-2">Rating</p>
              <div className="flex flex-wrap gap-1.5">
                {RATINGS.map((r) => {
                  const isActive = thread.rating === r.value;
                  return (
                    <button
                      key={r.value}
                      onClick={() => setRating(r.value)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 border rule label-mono transition-colors ${
                        isActive ? "bg-foreground text-background border-foreground" : "hover:border-foreground"
                      }`}
                    >
                      <r.icon className="w-3.5 h-3.5" /> {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-5 border-t rule flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(thread.cleaned_content || thread.raw_content);
                  toast.success("Copied");
                }}
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </Button>
              <Button size="sm" variant="ghost" onClick={startEdit}>
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={recleanWithAi} disabled={recleaning}>
                <Sparkles className="w-3.5 h-3.5" /> {recleaning ? "Cleaning…" : "AI re-clean"}
              </Button>
            </div>

            {/* Thread-level comments */}
            <div className="pt-5 border-t rule">
              <p className="label-mono text-muted-foreground mb-3 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Notes ({generalComments.length})
              </p>
              <div className="space-y-2 mb-3">
                {generalComments.map((c) => (
                  <div key={c.id} className="panel p-3">
                    <p className="text-xs text-foreground">{c.content}</p>
                    <p className="label-mono text-faint mt-1.5">{new Date(c.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Learning note…"
                  className="flex-1 h-9 px-3 bg-background border rule text-xs focus:outline-none focus:border-primary"
                />
                <Button size="sm" onClick={handleAddComment} disabled={createComment.isPending}>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </aside>

          {/* ── Conversation ── */}
          <div className="min-w-0">
            <AnimatePresence>
              {editing && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="panel panel-strong p-5 mb-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="label-mono">Edit thread</h3>
                    <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Title"
                      className="w-full h-10 px-3 bg-background border rule text-sm focus:outline-none focus:border-primary"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={editPlatform}
                        onChange={(e) => setEditPlatform(e.target.value)}
                        placeholder="Platform"
                        className="h-10 px-3 bg-background border rule text-sm focus:outline-none focus:border-primary"
                      />
                      <input
                        value={editModel}
                        onChange={(e) => setEditModel(e.target.value)}
                        placeholder="Model"
                        className="h-10 px-3 bg-background border rule text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <textarea
                      value={editRaw}
                      onChange={(e) => setEditRaw(e.target.value)}
                      rows={14}
                      className="w-full px-3 py-3 bg-background border rule text-sm font-mono resize-y focus:outline-none focus:border-primary"
                    />
                    <div className="flex gap-2">
                      <Button onClick={saveEdit} disabled={updateThread.isPending} size="sm">
                        <Save className="w-3.5 h-3.5" /> {updateThread.isPending ? "Saving…" : "Save & re-clean"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!editing && (
              <div className="border rule">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-foreground/80 sticky top-16 bg-background z-10">
                  <span className="label-mono">Transcript</span>
                  <span className="label-mono text-muted-foreground">Select text, then annotate</span>
                </div>
                <div className="max-h-[calc(100vh-13rem)] overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, i) => {
                    const notes = annotationsFor(i);
                    return (
                      <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.role === "assistant" && (
                          <div className="w-7 h-7 border rule flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="w-3.5 h-3.5 text-primary-dark" />
                          </div>
                        )}
                        <div className={`max-w-[85%] min-w-0 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                          <div
                            className={`px-4 py-3 text-[13px] leading-relaxed border rule ${
                              msg.role === "user" ? "bg-primary/[0.07] border-primary/40" : "bg-foreground/[0.02]"
                            }`}
                          >
                            <p className="label-mono text-muted-foreground mb-1.5">{msg.role}</p>
                            <pre className="whitespace-pre-wrap font-sans break-words">{msg.content}</pre>
                          </div>
                          <button
                            onClick={() => beginAnnotation(i)}
                            className="mt-1.5 label-mono text-muted-foreground hover:text-primary-dark transition-colors flex items-center gap-1"
                          >
                            <Quote className="w-3 h-3" /> Annotate
                          </button>

                          {annotating?.index === i && (
                            <div className="mt-2 w-full panel p-3">
                              {annotating.quote && (
                                <p className="text-xs text-muted-foreground border-l-2 border-primary pl-2 mb-2 line-clamp-3">
                                  “{annotating.quote}”
                                </p>
                              )}
                              <div className="flex gap-2">
                                <input
                                  ref={annotationInputRef}
                                  value={annotationText}
                                  onChange={(e) => setAnnotationText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveAnnotation();
                                    if (e.key === "Escape") setAnnotating(null);
                                  }}
                                  placeholder="What went right or wrong here?"
                                  className="flex-1 h-9 px-3 bg-background border rule text-xs focus:outline-none focus:border-primary"
                                />
                                <Button size="sm" onClick={saveAnnotation} disabled={createComment.isPending}>
                                  <Send className="w-3.5 h-3.5" />
                                </Button>
                                <button onClick={() => setAnnotating(null)} className="text-muted-foreground hover:text-foreground">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}

                          {notes.length > 0 && (
                            <div className="mt-2 w-full space-y-1.5">
                              {notes.map((n) => (
                                <div key={n.id} className="border-l-2 border-primary pl-3 py-1">
                                  {n.quote && <p className="text-xs text-muted-foreground italic">“{n.quote}”</p>}
                                  <p className="text-xs text-foreground">{n.content}</p>
                                  <p className="label-mono text-faint">{new Date(n.created_at).toLocaleString()}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {msg.role === "user" && (
                          <div className="w-7 h-7 border rule flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {messages.length === 0 && (
                    <p className="text-sm text-muted-foreground py-10 text-center">This thread has no content yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ThreadDetail;
