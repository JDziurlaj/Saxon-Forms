#!/usr/bin/env node
import { createServer } from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const host = process.env.DEMOS_HOST || "127.0.0.1";
const port = Number(process.env.DEMOS_PORT || "5174");
const staticRoot = __dirname;
const saxonJsRoot = path.join(repoRoot, "Saxon-JS");
const sefRoot = path.join(repoRoot, "sef");

const MIME_BY_EXTENSION = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8",
  ".xsl": "application/xml; charset=utf-8"
};

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function serveFile(filePath, response) {
  const fileContents = await fs.readFile(filePath);
  const extension = path.extname(filePath).toLowerCase();
  const mimeType = MIME_BY_EXTENSION[extension] || "application/octet-stream";
  response.writeHead(200, { "Content-Type": mimeType });
  response.end(fileContents);
}

function resolveStaticPath(pathname) {
  const normalized = path.posix.normalize(pathname).replace(/^\/+/, "");
  const relativePath = normalized === "" ? "demo-input-select-output.html" : normalized;
  const candidate = path.resolve(staticRoot, relativePath);
  if (candidate === staticRoot || candidate.startsWith(`${staticRoot}${path.sep}`)) {
    return candidate;
  }
  return null;
}


function resolveAliasedPath(pathname, urlPrefix, baseDir) {
  if (!pathname.startsWith(urlPrefix)) {
    return null;
  }
  const relativePath = pathname.slice(urlPrefix.length);
  const candidate = path.resolve(baseDir, relativePath);
  if (candidate === baseDir || candidate.startsWith(`${baseDir}${path.sep}`)) {
    return candidate;
  }
  return null;
}
function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

function renderEchoResponse({ body, requestUrl, request }) {
  const interestingHeaders = Object.entries(request.headers)
    .filter(([key]) => key.startsWith("content-") || key.startsWith("x-") || key === "host")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>Results from echo.js</title>
  </head>
  <body>
    <h1>Form posted data</h1>
    <pre>${escapeXml(body)}</pre>
    <h1>Request details</h1>
    <pre>${escapeXml(`method=${request.method}
path=${requestUrl.pathname}
query=${requestUrl.searchParams.toString()}
${interestingHeaders}`)}</pre>
  </body>
</html>`;
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host || `${host}:${port}`}`);
    const saxonJsPath = resolveAliasedPath(requestUrl.pathname, "/Saxon-JS/", saxonJsRoot);
    if (saxonJsPath) {
      // TEST-TRACE: expose SaxonJS3 runtime to demo pages that load /Saxon-JS/SaxonJS3.rt.js; helps tests/supplemental/demo-samples-render.spec.ts "demos page renders XForms controls".
      await serveFile(saxonJsPath, response);
      return;
    }

    const sefPath = resolveAliasedPath(requestUrl.pathname, "/sef/", sefRoot);
    if (sefPath) {
      // TEST-TRACE: expose shared SEF assets to demo pages that load /sef/saxon-xforms.sef.json; helps tests/supplemental/demo-samples-render.spec.ts "demos page renders XForms controls".
      await serveFile(sefPath, response);
      return;
    }

    if (requestUrl.pathname === "/api/test") {
      response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(JSON.stringify(Object.fromEntries(requestUrl.searchParams.entries()), null, 2));
      return;
    }

    if (requestUrl.pathname === "/api/echo") {
      const body = await readBody(request);
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.end(renderEchoResponse({ body, requestUrl, request }));
      return;
    }

    const filePath = resolveStaticPath(requestUrl.pathname);
    if (!filePath) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    await serveFile(filePath, response);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(error instanceof Error ? error.message : "Server error");
  }
});

server.listen(port, host, () => {
  console.log(`Demos server running at http://${host}:${port}`);
});
