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
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-foreground/80">
        <div className="flex items-center justify-between h-[60px] md:h-[68px] px-4 md:px-8 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-10 min-w-0">
            <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
              <span className="w-3 h-3 bg-primary" aria-hidden />
              <span className="label-mono text-foreground">Instruction OS</span>
            </Link>
            <nav aria-label="Primary" className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                    className={`nav-link flex items-center gap-2 py-6 text-[13px] font-normal ${
                      active ? "text-primary nav-link-active" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="hidden sm:flex w-9 h-9 border border-border items-center justify-center font-mono text-[11px] text-muted-foreground"
              title={user?.email ?? undefined}
            >
              {initial}
            </span>
            <button
              onClick={handleSignOut}
              className="hidden sm:flex h-11 items-center gap-2 px-3 text-muted-foreground hover:text-foreground link-underline text-[13px]"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              <span className="sr-only md:not-sr-only">Sign out</span>
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden w-11 h-11 border border-foreground/80 flex items-center justify-center text-foreground"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
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
              className="md:hidden border-t border-border bg-background overflow-hidden"
            >
              <nav aria-label="Mobile" className="flex flex-col">
                {navItems.map((item) => {
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 px-4 min-h-[52px] border-b border-border text-sm ${
                        active ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <item.icon className="w-4 h-4" strokeWidth={1.5} />
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 min-h-[52px] text-sm text-muted-foreground"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.5} /> Sign out
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <main className="pt-[60px] md:pt-[68px] min-h-screen">{children}</main>
    </div>
  );
};

export default AppLayout;

