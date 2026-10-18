import http from "node:http";
import path from "node:path";
import { readFile, stat } from "node:fs/promises";
const root = path.resolve("dist");
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".wasm": "application/wasm",
  ".json": "application/json",
  ".png": "image/png",
  ".ttf": "font/ttf",
  ".css": "text/css",
};
http
  .createServer(async (request, response) => {
    response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    response.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    response.setHeader("Cache-Control", "no-store");
    const file = path.resolve(
      root,
      "." +
        decodeURIComponent(new URL(request.url, "http://localhost").pathname),
    );
    if (file !== root && !file.startsWith(root + path.sep)) {
      response.writeHead(403).end();
      return;
    }
    try {
      const actual = (await stat(file)).isDirectory()
        ? path.join(file, "index.html")
        : file;
      response.setHeader(
        "Content-Type",
        types[path.extname(actual)] || "application/octet-stream",
      );
      response.end(await readFile(actual));
    } catch {
      response.writeHead(404).end("Not found");
    }
  })
  .listen(Number(process.env.PORT ?? 8090), "127.0.0.1", () =>
    console.log("GMM web verification server ready"),
  );
