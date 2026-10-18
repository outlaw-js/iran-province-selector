// Bundles the demo with esbuild and serves the example folder on http://localhost:5178
import { build } from "esbuild";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));

// Rebuild the demo, but don't let a stuck esbuild process keep the server from starting.
const built = build({
  entryPoints: [join(dir, "demo.tsx")],
  bundle: true,
  outfile: join(dir, "demo.js"),
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"development"' },
}).then(
  () => "built",
  (e) => `build failed: ${e.message}`,
);
const timeout = new Promise((r) => setTimeout(() => r("build timed out, serving the existing demo.js"), 15000));
console.log(await Promise.race([built, timeout]));

const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript" };
createServer(async (req, res) => {
  const path = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  try {
    const body = await readFile(join(dir, path));
    res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
}).listen(5178, () => console.log("demo on http://localhost:5178"));
