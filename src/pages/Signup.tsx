import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email to confirm your account");
      navigate("/login");
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

        <h1 className="text-xl font-semibold text-foreground text-center mb-1 tracking-tight">Create account</h1>
        <p className="text-xs text-muted-foreground text-center mb-8">Start managing your AI instructions</p>

        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Display name"
            className="w-full h-9 px-3 rounded-lg bg-secondary border border-border/20 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 transition-colors"
          />
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
            placeholder="Password (min 6 characters)"
            required
            minLength={6}
            className="w-full h-9 px-3 rounded-lg bg-secondary border border-border/20 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 transition-colors"
          />
          <Button type="submit" disabled={loading} className="w-full h-9 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? "Creating account..." : "Create account"}
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </form>

        <p className="mt-6 text-center text-[10px] text-muted-foreground/30">
          Already have an account? <Link to="/login" className="text-primary/60 hover:text-primary transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
