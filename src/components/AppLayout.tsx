import { Link, useLocation } from "react-router-dom";
import { Layers, LayoutDashboard, FileText, MessageSquare, Sparkles } from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/threads", icon: MessageSquare, label: "Threads" },
  { to: "/optimize", icon: Sparkles, label: "Optimize" },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 h-12">
        <div className="flex items-center justify-between h-full px-5 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Layers className="w-3 h-3 text-primary" />
              </div>
              <span className="font-display font-semibold text-sm text-foreground tracking-tight hidden sm:inline">Instruction OS</span>
            </Link>
            <div className="flex items-center gap-0.5">
              {navItems.map((item) => {
                const active = location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all duration-300 ${
                      active
                        ? "text-primary bg-primary/5"
                        : "text-muted-foreground hover:text-foreground"
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
            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-medium text-primary">
              U
            </div>
          </div>
        </div>
      </nav>
      <main className="pt-12 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
