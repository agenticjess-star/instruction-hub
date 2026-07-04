import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type AuthDetails = {
  client?: { name?: string; client_uri?: string; logo_uri?: string };
  redirect_url?: string;
  redirect_to?: string;
} | null;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthDetails>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        // Preserve the FULL consent URL — including query — so we return here after sign-in.
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login?next=" + encodeURIComponent(next);
        return;
      }
      // beta namespace — cast to any so TypeScript doesn't complain about missing types
      const { data, error } = await (supabase.auth as any).oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const oauth = (supabase.auth as any).oauth;
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative"
      >
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-7 h-7 rounded-lg bg-primary/12 border border-primary/25 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-display font-bold text-sm text-foreground tracking-tight">Instruction OS</span>
        </div>

        {error ? (
          <div className="card-elevated p-6 text-center">
            <AlertCircle className="w-6 h-6 text-destructive mx-auto mb-3" />
            <h1 className="text-lg font-bold text-foreground mb-1">Authorization Failed</h1>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        ) : !details ? (
          <div className="card-elevated p-8 text-center">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground mt-3">Loading…</p>
          </div>
        ) : (
          <div className="card-elevated p-6">
            <h1 className="text-lg font-bold text-foreground text-center mb-1 tracking-tight">
              Connect {details.client?.name ?? "this app"} to Instruction OS
            </h1>
            <p className="text-xs text-muted-foreground text-center mb-6">
              {details.client?.name ?? "The client"} will be able to read and manage your instruction groups,
              instructions, and threads on your behalf.
            </p>

            <div className="rounded-lg bg-secondary/50 border border-border/40 p-4 mb-5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">
                Access will include
              </p>
              <ul className="space-y-1.5 text-xs text-foreground/80">
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-primary/70" /> View your groups & instructions</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-primary/70" /> Fetch production instruction content</li>
                <li className="flex items-center gap-2"><Check className="w-3 h-3 text-primary/70" /> View, save, and comment on threads</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => decide(true)}
                disabled={busy}
                className="flex-1 h-10 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Check className="w-4 h-4 mr-1.5" /> Approve
              </Button>
              <Button
                onClick={() => decide(false)}
                disabled={busy}
                variant="outline"
                className="flex-1 h-10 text-sm font-semibold border-border/50 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1.5" /> Deny
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
