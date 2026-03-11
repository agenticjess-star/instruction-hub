import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layers, LayoutDashboard, MessageSquare, Sparkles, LogOut, FolderOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/groups", icon: FolderOpen, label: "Groups" },
  { to: "/threads", icon: MessageSquare, label: "Threads" },
  { to: "/optimize", icon: Sparkles, label: "Optimize" },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initial = user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/50 h-13">
        <div className="flex items-center justify-between h-full px-5 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-primary/12 border border-primary/25 flex items-center justify-center group-hover:bg-primary/18 group-hover:border-primary/35 transition-all duration-300">
                <Layers className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-display font-bold text-sm text-foreground tracking-tight hidden sm:inline">Instruction OS</span>
            </Link>
            <div className="flex items-center gap-0.5">
              {navItems.map((item) => {
                const active = location.pathname === item.to || (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`nav-item flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 ${
                      active
                        ? "text-primary bg-primary/8 border border-primary/15"
                        : "text-muted-foreground hover:text-foreground border border-transparent"
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.08 }}
              className="w-7 h-7 rounded-full bg-primary/12 border border-primary/25 flex items-center justify-center text-[11px] font-bold text-primary cursor-default"
            >
              {initial}
            </motion.div>
            <button
              onClick={handleSignOut}
              className="text-muted-foreground/40 hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-secondary"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>
      <main className="pt-13 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
