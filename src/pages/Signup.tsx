import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { client } from "@/integrations/neon/client";
import { toast } from "sonner";
import LogoAnimation from "@/components/LogoAnimation";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoCollapsed, setLogoCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLogoCollapsed(true);
    const { error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setLoading(false);
      setLogoCollapsed(false);
      toast.error(error.message);
    } else {
      toast.success("Check your email to confirm your account");
      setTimeout(() => navigate("/login"), 800);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
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

        <h1 className="text-xl font-bold text-foreground text-center mb-1 tracking-tight">Create account</h1>
        <p className="text-xs text-muted-foreground text-center mb-8">Start managing your AI instructions</p>

        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Display name"
            className="w-full h-10 px-3.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
          />
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
            placeholder="Password (min 6 characters)"
            required
            minLength={6}
            className="w-full h-10 px-3.5 rounded-lg bg-secondary border border-border/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
          />
          <Button type="submit" disabled={loading} className="w-full h-10 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
            {loading ? "Creating account..." : "Create account"}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground/40">
          Already have an account? <Link to="/login" className="text-primary/70 hover:text-primary transition-colors font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
