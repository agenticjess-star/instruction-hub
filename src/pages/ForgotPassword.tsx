import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { client } from "@/integrations/neon/client";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await client.auth.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
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

        {sent ? (
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground mb-2 tracking-tight">Check your email</h1>
            <p className="text-xs text-muted-foreground mb-6">We sent a password reset link to {email}</p>
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-3 h-3 mr-1.5" /> Back to sign in
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-foreground text-center mb-1 tracking-tight">Reset password</h1>
            <p className="text-xs text-muted-foreground text-center mb-8">Enter your email to receive a reset link</p>
            <form onSubmit={handleReset} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full h-9 px-3 rounded-lg bg-secondary border border-border/20 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 transition-colors"
              />
              <Button type="submit" disabled={loading} className="w-full h-9 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
            <p className="mt-6 text-center text-[10px] text-muted-foreground/30">
              <Link to="/login" className="text-primary/60 hover:text-primary transition-colors">Back to sign in</Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
