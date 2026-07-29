import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, relative, resolve } from "node:path";

const root = resolve(".");
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webp": "image/webp",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg"
};

function safePath(urlPath) {
  try {
    const decoded = decodeURIComponent(urlPath.split("?")[0]);
    const requested = decoded === "/" ? "index.html" : decoded.replace(/^[/\\]+/, "");
    const fullPath = resolve(root, requested);
    const pathFromRoot = relative(root, fullPath);
    return pathFromRoot && !pathFromRoot.startsWith("..") && !pathFromRoot.includes(":")
      ? fullPath
      : null;
  } catch {
    return null;
  }
}

const server = createServer((req, res) => {
  const path = safePath(req.url || "/");

  if (!path || !existsSync(path) || !statSync(path).isFile()) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, {
    "content-type": contentTypes[extname(path)] || "application/octet-stream",
    "cache-control": "no-store"
  });
  createReadStream(path).pipe(res);
});

server.listen(port, () => {
  console.log(`Noory Demo running at http://localhost:${port}`);
});
