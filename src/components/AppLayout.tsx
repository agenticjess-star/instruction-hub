import { Link, useLocation } from "react-router-dom";
import { Layers, LayoutDashboard, FileText, MessageSquare, Sparkles, Globe } from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/threads", icon: MessageSquare, label: "Threads" },
  { to: "/optimize", icon: Sparkles, label: "Optimize" },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass h-14">
        <div className="flex items-center justify-between h-full px-4 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Layers className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground hidden sm:inline">Instruction OS</span>
            </Link>
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const active = location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xs font-semibold text-foreground">
              U
            </div>
          </div>
        </div>
      </nav>
      <main className="pt-14 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
