import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// The MCP OAuth consent flow is now served by the self-hosted Better Auth
// authorization server (see api/auth.ts + api/_lib/auth.ts), which renders its
// own consent page during the authorization-code flow. This legacy Lovable/Supabase
// consent route is retired.
const OAuthConsent = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="text-center max-w-sm">
        <h1 className="text-lg font-semibold text-foreground mb-2 tracking-tight">Authorization moved</h1>
        <p className="text-xs text-muted-foreground mb-6">
          MCP sign-in and consent are now handled by the Instruction OS authorization server.
          Restart the connection from your MCP client to continue.
        </p>
        <Link to="/">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Back to home</Button>
        </Link>
      </div>
    </div>
  );
};

export default OAuthConsent;
