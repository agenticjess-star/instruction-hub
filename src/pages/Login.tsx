import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-10">
          <div className="w-6 h-6 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Layers className="w-3 h-3 text-primary" />
          </div>
          <span className="font-display font-semibold text-sm text-foreground tracking-tight">Instruction OS</span>
        </Link>

        <h1 className="text-xl font-semibold text-foreground text-center mb-1 tracking-tight">Sign in</h1>
        <p className="text-xs text-muted-foreground text-center mb-8">Enter your credentials to continue</p>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full h-9 px-3 rounded-lg bg-secondary border border-border/20 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 transition-colors"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full h-9 px-3 rounded-lg bg-secondary border border-border/20 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 transition-colors"
          />
          <Button type="submit" disabled={loading} className="w-full h-9 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? "Signing in..." : "Sign in"}
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link to="/forgot-password" className="text-[10px] text-muted-foreground/40 hover:text-foreground transition-colors block">
            Forgot password?
          </Link>
          <p className="text-[10px] text-muted-foreground/30">
            No account? <Link to="/signup" className="text-primary/60 hover:text-primary transition-colors">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
