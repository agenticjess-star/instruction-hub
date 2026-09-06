// Catch-all for the Better Auth authorization server:
//   /.well-known/oauth-authorization-server, /.well-known/oauth-protected-resource,
//   /oauth2/authorize, /oauth2/token, /oauth2/register, /jwks, etc.
// Served by the self-hosted Better Auth instance (api/_lib/auth.ts).
import { toNodeHandler } from "better-auth/node";
import { auth } from "./_lib/auth.js";

export default toNodeHandler(auth);
