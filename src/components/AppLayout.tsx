import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layers, LayoutDashboard, MessageSquare, Sparkles, LogOut, FolderOpen, Bot, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/groups", icon: FolderOpen, label: "Groups" },
  { to: "/threads", icon: MessageSquare, label: "Threads" },
  { to: "/optimize", icon: Sparkles, label: "Optimize" },
  { to: "/agents", icon: Bot, label: "Agents" },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initial = user?.email?.[0]?.toUpperCase() ?? "U";

  const isActive = (to: string) =>
    location.pathname === to || (to !== "/dashboard" && location.pathname.startsWith(to));

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/75 backdrop-blur-2xl border-b border-border/40">
        <div className="flex items-center justify-between h-16 px-5 sm:px-8 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-10">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:border-primary/40 transition-all duration-300">
                <Layers className="w-4 h-4 text-primary" />
              </div>
              <span className="font-display font-semibold text-sm text-foreground tracking-tight hidden sm:inline">Instruction OS</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`nav-link relative flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-normal tracking-[-0.005em] transition-all duration-300 ${
                      active
                        ? "text-primary nav-link-active"
                        : "text-muted-foreground/80 hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-8 h-8 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-xs font-semibold text-primary cursor-default"
            >
              {initial}
            </motion.div>
            <button
              onClick={handleSignOut}
              className="hidden sm:block text-muted-foreground/50 hover:text-foreground transition-colors p-2 rounded-md hover:bg-secondary"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-2xl overflow-hidden"
            >
              <div className="px-5 py-3 flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-normal transition-all ${
                        active ? "text-primary bg-primary/8" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                      }`}
                    >
                      <item.icon className="w-4 h-4" strokeWidth={1.75} />
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.75} /> Sign out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <main className="pt-16 min-h-screen">{children}</main>
    </div>
  );
};

export default AppLayout;
