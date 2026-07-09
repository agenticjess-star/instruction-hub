import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, Layers, FolderOpen, Sparkles, Plus, SmilePlus, Meh, Frown, Send, Copy, Check, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroups, useCategories, useThreads } from "@/hooks/useInstructionGroups";
import { useProfile, useGenerateTelegramLinkCode, useUnlinkTelegram } from "@/hooks/useProfile";
import { useState } from "react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";

const RATING_ICONS = { positive: SmilePlus, neutral: Meh, negative: Frown };
const RATING_COLORS = { positive: "text-success", neutral: "text-warning", negative: "text-destructive" };

const Dashboard = () => {
  const { data: categories = [] } = useCategories();
  const { data: groups = [] } = useGroups();
  const { data: allThreads = [], isLoading } = useThreads();
  const { data: profile } = useProfile();
  const generateCode = useGenerateTelegramLinkCode();
  const unlink = useUnlinkTelegram();
  const [copied, setCopied] = useState(false);

  const recentThreads = allThreads.slice(0, 8);
  const recentGroups = groups.slice(0, 6);
  const telegramLinked = !!profile?.telegram_chat_id;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AppLayout>
      <div className="max-w-[1100px] mx-auto px-5 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your instruction workspace</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { label: "Groups", value: categories.length, icon: FolderOpen, to: "/groups" },
            { label: "Instructions", value: groups.length, icon: Layers, to: "/groups" },
            { label: "Threads", value: allThreads.length, icon: MessageSquare, to: "/threads" },
            { label: "Rated", value: allThreads.filter(t => t.rating).length, icon: SmilePlus, to: "/threads" },
          ].map((stat, i) => (
            <Link key={stat.label} to={stat.to}>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-interactive p-4 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-4 h-4 text-primary/60" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">{stat.label}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Recent Threads - Main Column */}
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-foreground tracking-tight">Recent Threads</h2>
              <Link to="/threads" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors font-medium">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentThreads.length === 0 ? (
              <div className="card-elevated p-8 text-center">
                <MessageSquare className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-3">No threads yet</p>
                <Link to="/threads">
                  <Button size="sm" className="bg-primary text-primary-foreground text-xs h-8">
                    <Plus className="w-3 h-3 mr-1" /> Add Thread
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5">
                {recentThreads.map((th, i) => {
                  const g = groups.find(g => g.id === th.group_id);
                  const RatingIcon = th.rating ? RATING_ICONS[th.rating as keyof typeof RATING_ICONS] : null;
                  const ratingColor = th.rating ? RATING_COLORS[th.rating as keyof typeof RATING_COLORS] : "";
                  return (
                    <motion.div key={th.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                      <Link to={`/threads/${th.id}`} className="card-interactive p-3.5 flex items-center gap-3 block">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-xs font-semibold text-foreground truncate">{th.title}</p>
                            {RatingIcon && <RatingIcon className={`w-3.5 h-3.5 flex-shrink-0 ${ratingColor}`} />}
                          </div>
                          <p className="text-[10px] text-muted-foreground/50 font-mono">
                            {th.platform || "Unknown"} · {th.model || "Unknown"} · {new Date(th.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {g && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold border flex-shrink-0 whitespace-nowrap" style={{ backgroundColor: `${g.color}15`, borderColor: `${g.color}30`, color: g.color }}>
                            {g.name}
                          </span>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar - Instructions & Quick Actions */}
          <div className="md:col-span-2 space-y-6">
            {/* Recent Instructions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-foreground tracking-tight">Instructions</h2>
                <Link to="/groups" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors font-medium">
                  All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {recentGroups.length === 0 ? (
                <div className="card-elevated p-6 text-center">
                  <Layers className="w-5 h-5 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No instructions yet</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {recentGroups.map((g, i) => {
                    const threadCount = allThreads.filter(t => t.group_id === g.id).length;
                    return (
                      <motion.div key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                        <Link to={`/groups/${g.id}`} className="card-interactive p-3 flex items-center gap-2.5 block group">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: g.color || "#666" }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">{g.name}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground/40 tabular-nums">{threadCount}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-sm font-bold text-foreground tracking-tight mb-3">Quick Actions</h2>
              <div className="space-y-1.5">
                <Link to="/groups" className="card-interactive p-3 flex items-center gap-2.5 block text-xs font-medium text-muted-foreground hover:text-foreground">
                  <FolderOpen className="w-3.5 h-3.5 text-primary/50" /> Manage Groups
                </Link>
                <Link to="/threads" className="card-interactive p-3 flex items-center gap-2.5 block text-xs font-medium text-muted-foreground hover:text-foreground">
                  <Plus className="w-3.5 h-3.5 text-primary/50" /> Add Thread
                </Link>
                <Link to="/optimize" className="card-interactive p-3 flex items-center gap-2.5 block text-xs font-medium text-muted-foreground hover:text-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-primary/50" /> Optimize Instructions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
