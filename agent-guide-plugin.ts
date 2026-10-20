import { readFile } from "node:fs/promises";
import type { Plugin } from "vite";
import { fullPageMarkdown, GUIDE_DESCRIPTION, GUIDE_TITLE } from "./src/lib/agentGuide";

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** A real HTML document for non-JavaScript agents, hydrated by the normal app. */
function guideHtml(html: string) {
  return html
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(GUIDE_TITLE)}</title>`)
    .replace(/(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*("\s*\/>)/g, `$1${escapeHtml(GUIDE_DESCRIPTION)}$2`)
    .replace(/(<meta (?:name|property)="(?:og:title|twitter:title)" content=")[^"]*("\s*\/>)/g, `$1${escapeHtml(GUIDE_TITLE)}$2`)
    .replace('<div id="root"></div>', `<div id="root"><main><h1>${escapeHtml(GUIDE_TITLE)}</h1><p><a href="/">InstructionLoop</a> · <a href="/signup">Create account</a> · <a href="/agents.md">Plain-text guide</a></p><pre>${escapeHtml(fullPageMarkdown())}</pre></main></div>`);
}

export function agentGuidePlugin(): Plugin {
  return {
    name: "instructionloop-agent-guide",
    enforce: "post",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split("?")[0];
        if (req.method !== "GET" || !["/agents", "/agents/", "/agents.md"].includes(path ?? "")) return next();
        try {
          if (path === "/agents.md") {
            res.setHeader("Content-Type", "text/markdown; charset=utf-8");
            res.end(fullPageMarkdown());
          } else {
            const template = await readFile(new URL("./index.html", import.meta.url), "utf8");
            const html = await server.transformIndexHtml("/agents", guideHtml(template));
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.end(html);
          }
        } catch (error) {
          next(error);
        }
      });
    },
    generateBundle(_options, bundle) {
      const index = bundle["index.html"];
      if (index?.type !== "asset") this.error("Missing HTML entry for agent guide.");
      this.emitFile({ type: "asset", fileName: "agents/index.html", source: guideHtml(String(index.source)) });
      this.emitFile({ type: "asset", fileName: "agents.md", source: fullPageMarkdown() });
    },
  };
}