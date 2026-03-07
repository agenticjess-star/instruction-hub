import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Globe, ArrowRight, Clock, Tag as TagIcon, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { instructionSets, threads, tags } from "@/lib/seed-data";
import AppLayout from "@/components/AppLayout";

const getTagName = (id: string) => tags.find(t => t.id === id)?.name ?? id;

const Dashboard = () => {
  const activeInstructions = instructionSets.filter(i => i.status === "active");
  const publishedCount = instructionSets.filter(i => i.versions.some(v => v.isProduction)).length;

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your AI agent instructions</p>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Instruction Set
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Instruction Sets", value: instructionSets.length },
            { label: "Published", value: publishedCount },
            { label: "Linked Threads", value: threads.length },
            { label: "Total Versions", value: instructionSets.reduce((a, i) => a + i.versions.length, 0) },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-4"
            >
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Instruction Sets */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Instruction Sets</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {instructionSets.map((is, i) => {
              const prodVersion = is.versions.find(v => v.isProduction);
              return (
                <motion.div
                  key={is.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    to={`/instructions/${is.id}`}
                    className="block glass glass-hover rounded-xl p-5 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{is.name}</h3>
                      {prodVersion && (
                        <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
                          <Globe className="w-3 h-3" /> Live
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{is.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        v{is.versions.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {is.linkedThreadIds.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {is.tags.map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full surface-2 text-muted-foreground">
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
            <h2 className="text-lg font-semibold text-foreground">Recent Threads</h2>
            <Link to="/threads" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {threads.slice(0, 3).map((th, i) => (
              <motion.div
                key={th.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass glass-hover rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-9 h-9 rounded-lg surface-2 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{th.title}</p>
                  <p className="text-xs text-muted-foreground">{th.platform} · {th.model}</p>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">
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
