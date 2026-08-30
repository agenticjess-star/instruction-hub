import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { client } from "@/integrations/neon/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Better Auth emails a reset link carrying ?token=<token>
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    const { error } = await client.auth.resetPassword({
      newPassword: password,
      token,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Couldn't reset password");
    } else {
      toast.success("Password updated successfully");
      navigate("/login");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-4">Invalid or expired reset link.</p>
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Back to sign in</Button>
          </Link>
        </div>
      </div>
    );
  }

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

        <h1 className="text-xl font-semibold text-foreground text-center mb-1 tracking-tight">Set new password</h1>
        <p className="text-xs text-muted-foreground text-center mb-8">Enter your new password below</p>

        <form onSubmit={handleUpdate} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="New password (min 6 characters)"
            required
            minLength={6}
            className="w-full h-9 px-3 rounded-lg bg-secondary border border-border/20 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 transition-colors"
          />
          <Button type="submit" disabled={loading} className="w-full h-9 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
