import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Copy, Edit3, Save, X, Send, MessageSquare, User, Bot, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThread, useUpdateThread, useThreadComments, useCreateComment, useGroups } from "@/hooks/useInstructionGroups";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";
import { cleanThreadContent } from "@/lib/cleanThread";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function parseThreadToMessages(cleaned: string): ChatMessage[] {
  const lines = cleaned.split("\n");
  const messages: ChatMessage[] = [];
  let currentRole: "user" | "assistant" = "user";
  let currentContent = "";

  for (const line of lines) {
    if (/^User:\s*/i.test(line)) {
      if (currentContent.trim()) messages.push({ role: currentRole, content: currentContent.trim() });
      currentRole = "user";
      currentContent = line.replace(/^User:\s*/i, "");
    } else if (/^Assistant:\s*/i.test(line)) {
      if (currentContent.trim()) messages.push({ role: currentRole, content: currentContent.trim() });
      currentRole = "assistant";
      currentContent = line.replace(/^Assistant:\s*/i, "");
    } else {
      currentContent += "\n" + line;
    }
  }
  if (currentContent.trim()) messages.push({ role: currentRole, content: currentContent.trim() });

  if (messages.length === 0 && cleaned.trim()) {
    messages.push({ role: "user", content: cleaned.trim() });
  }

  return messages;
}

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

  if (!thread) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  const messages = parseThreadToMessages(thread.cleaned_content || thread.raw_content);
  const linkedGroup = groups.find(g => g.id === thread.group_id);

  const startEdit = () => {
    setEditTitle(thread.title);
    setEditRaw(thread.raw_content);
    setEditPlatform(thread.platform || "");
    setEditModel(thread.model || "");
    setEditing(true);
  };

  const saveEdit = async () => {
    try {
      await updateThread.mutateAsync({
        id: thread.id,
        title: editTitle.trim(),
        raw_content: editRaw,
        cleaned_content: cleanThreadContent(editRaw),
        platform: editPlatform,
        model: editModel,
      });
      setEditing(false);
      toast.success("Thread updated");
    } catch (e: any) {
      toast.error(e.message);
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
    <AppLayout>
      <div className="max-w-[800px] mx-auto px-5 py-8">
        <Link to="/threads" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-foreground mb-6 transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Threads
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-foreground tracking-tight">{thread.title}</h1>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground/60 font-mono flex-wrap">
              <span>{thread.platform || "Unknown"}</span>
              <span className="text-border">·</span>
              <span>{thread.model || "Unknown"}</span>
              <span className="text-border">·</span>
              <span>{new Date(thread.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {linkedGroup && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-md font-semibold border"
                  style={{
                    backgroundColor: `${linkedGroup.color}15`,
                    borderColor: `${linkedGroup.color}30`,
                    color: linkedGroup.color,
                  }}
                >
                  {linkedGroup.name}
                </span>
              )}
              <button
                onClick={() => setShowTagPicker(!showTagPicker)}
                className="text-[10px] px-2 py-0.5 rounded-md bg-secondary border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all flex items-center gap-1"
              >
                <Tag className="w-2.5 h-2.5" />
                {linkedGroup ? "Change" : "Link instruction"}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(thread.cleaned_content || thread.raw_content); toast.success("Copied"); }} className="h-8 text-xs text-muted-foreground/50 hover:text-foreground">
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={startEdit} className="h-8 text-xs text-muted-foreground/50 hover:text-foreground">
              <Edit3 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Tag Picker */}
        <AnimatePresence>
          {showTagPicker && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
              <div className="card-elevated p-3">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Link to instruction</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => assignGroup(null)}
                    className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${!thread.group_id ? "bg-primary/10 border-primary/30 text-primary" : "bg-secondary border-border/40 text-muted-foreground hover:border-primary/20"}`}
                  >
                    None
                  </button>
                  {groups.map(g => (
                    <button
                      key={g.id}
                      onClick={() => assignGroup(g.id)}
                      className="text-[11px] px-2.5 py-1 rounded-md border transition-all hover:scale-105"
                      style={{
                        backgroundColor: thread.group_id === g.id ? `${g.color}20` : undefined,
                        borderColor: thread.group_id === g.id ? `${g.color}50` : undefined,
                        color: g.color || undefined,
                      }}
                    >
                      <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: g.color || "#666" }} />
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Mode */}
        <AnimatePresence>
          {editing && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card-elevated p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-foreground">Edit Thread</h3>
                <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Title" className="w-full h-10 px-3.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={editPlatform} onChange={e => setEditPlatform(e.target.value)} placeholder="Platform" className="h-10 px-3.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all" />
                  <input value={editModel} onChange={e => setEditModel(e.target.value)} placeholder="Model" className="h-10 px-3.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all" />
                </div>
                <textarea value={editRaw} onChange={e => setEditRaw(e.target.value)} rows={10} className="w-full px-3.5 py-3 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-y font-mono" />
                <div className="flex gap-2">
                  <Button onClick={saveEdit} disabled={updateThread.isPending} className="h-9 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                    <Save className="w-3.5 h-3.5 mr-1.5" /> {updateThread.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button variant="ghost" onClick={() => setEditing(false)} className="h-9 text-xs">Cancel</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Bubble View */}
        {!editing && (
          <div className="space-y-3 mb-8">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-primary/70" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 text-[13px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary/12 border border-primary/20 text-foreground"
                      : "bg-secondary border border-border/40 text-foreground/85"
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-secondary border border-border/40 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3.5 h-3.5 text-muted-foreground/60" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Comments Section */}
        <div className="border-t border-border/30 pt-6">
          <h3 className="text-xs font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-primary/60" />
            Comments ({comments.length})
          </h3>
          <div className="space-y-2 mb-4">
            {comments.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="p-3 rounded-lg bg-secondary/50 border border-border/30"
              >
                <p className="text-xs text-foreground/80">{c.content}</p>
                <p className="text-[9px] text-muted-foreground/40 mt-1.5 font-mono">{new Date(c.created_at).toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddComment()}
              placeholder="Add a comment or learning note..."
              className="flex-1 h-9 px-3.5 rounded-lg bg-secondary border border-border/40 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 transition-all"
            />
            <Button size="sm" onClick={handleAddComment} disabled={createComment.isPending} className="h-9 px-3 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/15">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ThreadDetail;
