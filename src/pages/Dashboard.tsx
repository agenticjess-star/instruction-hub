import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Globe, ArrowRight, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { instructionSets, threads, tags } from "@/lib/seed-data";
import AppLayout from "@/components/AppLayout";

const getTagName = (id: string) => tags.find(t => t.id === id)?.name ?? id;

const Dashboard = () => {
  const publishedCount = instructionSets.filter(i => i.versions.some(v => v.isProduction)).length;

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage your AI agent instructions</p>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Instruction
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border/20 rounded-lg overflow-hidden border border-border/20 mb-8">
          {[
            { label: "Instruction Sets", value: instructionSets.length },
            { label: "Published", value: publishedCount },
            { label: "Linked Threads", value: threads.length },
            { label: "Total Versions", value: instructionSets.reduce((a, i) => a + i.versions.length, 0) },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-background p-4"
            >
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-xl font-semibold text-foreground tabular-nums">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Instruction Sets */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-foreground mb-4 tracking-tight">Instruction Sets</h2>
          <div className="grid gap-px md:grid-cols-2 lg:grid-cols-3 bg-border/20 rounded-lg overflow-hidden border border-border/20">
            {instructionSets.map((is, i) => {
              const prodVersion = is.versions.find(v => v.isProduction);
              return (
                <motion.div
                  key={is.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    to={`/instructions/${is.id}`}
                    className="block bg-background p-5 hover:bg-card/40 transition-colors duration-500 group h-full"
                  >
                    <div className="flex items-start justify-between mb-2.5">
                      <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors duration-300">{is.name}</h3>
                      {prodVersion && (
                        <span className="flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-success/8 text-success border border-success/10">
                          <Globe className="w-2.5 h-2.5" /> Live
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{is.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        v{is.versions.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-2.5 h-2.5" />
                        {is.linkedThreadIds.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {is.tags.map(t => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground/60">
                          {getTagName(t)}
                        </span>
                      ))}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Threads */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-foreground tracking-tight">Recent Threads</h2>
            <Link to="/threads" className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>
          <div className="space-y-px rounded-lg overflow-hidden border border-border/20">
            {threads.slice(0, 3).map((th, i) => (
              <motion.div
                key={th.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.06 }}
                className="bg-background hover:bg-card/30 transition-colors duration-500 p-4 flex items-center gap-3"
              >
                <div className="w-7 h-7 rounded bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-3 h-3 text-primary/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{th.title}</p>
                  <p className="text-[10px] text-muted-foreground/50">{th.platform} · {th.model}</p>
                </div>
                <span className="text-[9px] text-muted-foreground/30 flex-shrink-0 font-mono">
                  {new Date(th.createdAt).toLocaleDateString()}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
