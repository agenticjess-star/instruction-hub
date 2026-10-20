# Project architecture

- Keep external MCP tools in `src/lib/mcp`, one definition per file, and let the SDK Vite plugin generate the edge function; generated transport is not an authoring surface.
- Use a lazy shared caller-scoped MCP database factory forwarding only verified OAuth tokens; existing row-level permissions remain authoritative.
- Canonicalize authentication return paths through the shared helper at the login/signup boundary; preserve OAuth requests without accepting external redirects.
- Keep public agent documentation and downloadable text derived from the same guide exports; browser and assistant instructions must not drift.
- Track production work in `roadmap.md` and distinguish implementation, verification, and publication; generated manifests do not prove hosted execution.