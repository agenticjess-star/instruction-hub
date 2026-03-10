import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LogoAnimation from "@/components/LogoAnimation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoCollapsed, setLogoCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLogoCollapsed(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setLogoCollapsed(false);
      toast.error(error.message);
    } else {
      setTimeout(() => navigate("/dashboard"), 600);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      {/* Ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/3 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative"
      >
        <div className="mb-10">
          <LogoAnimation collapsed={logoCollapsed} />
        </div>

        <h1 className="text-xl font-bold text-foreground text-center mb-1 tracking-tight">Sign in</h1>
        <p className="text-xs text-muted-foreground text-center mb-8">Enter your credentials to continue</p>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full h-10 px-3.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full h-10 px-3.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
          />
          <Button type="submit" disabled={loading} className="w-full h-10 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
            {loading ? "Signing in..." : "Sign in"}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link to="/forgot-password" className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors block">
            Forgot password?
          </Link>
          <p className="text-xs text-muted-foreground/40">
            No account? <Link to="/signup" className="text-primary/70 hover:text-primary transition-colors font-medium">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
