// Self-hosted Better Auth instance acting as the OAuth 2.1 authorization
// server + protected resource for the Instruction OS MCP server.
//
// Why this exists separately from Neon Managed Better Auth:
//   Neon's managed service curates a fixed plugin set (Admin, JWT, Magic Link,
//   etc.) and does NOT expose the OAuth Provider / MCP plugin. So the MCP
//   authorization server runs here, on Vercel, sharing the same Neon database
//   for identity. Human sign-in still flows through Neon Managed Better Auth;
//   this service only owns the MCP OAuth issuer (discovery, /oauth2/*, consent).
//
// Env required:
//   NEON_DATABASE_URL   - postgres connection string (neondb_owner)
//   MCP_RESOURCE_URL    - canonical https URL of the MCP endpoint, e.g.
//                         https://instruction-hub.vercel.app/api/mcp
//   BETTER_AUTH_SECRET  - signing secret (>= 32 chars)
//   APP_BASE_URL        - app origin hosting the login/consent pages

import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { mcp } from "@better-auth/mcp";
import { cimd } from "@better-auth/cimd";
import { fetchClientMetadataResource } from "@better-auth/cimd/node";
import { Pool } from "pg";

const resource = process.env.MCP_RESOURCE_URL!;
const appBase = process.env.APP_BASE_URL!;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  // Share the Neon Postgres database for identity + OAuth records.
  database: new Pool({ connectionString: process.env.NEON_DATABASE_URL }),
  emailAndPassword: { enabled: true },
  plugins: [
    // JWT provides the stable signing key + /jwks endpoint resource servers verify.
    jwt(),
    mcp({
      loginPage: `${appBase}/login`,
      consentPage: `${appBase}/oauth/consent`,
      resource,
    }),
    cimd({
      fetchClientMetadataResource,
      metadataProfile: "mcp-2026-07-28",
    }),
  ],
});

export default auth;
