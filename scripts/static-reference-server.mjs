import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { resolve } from "node:path";

const referenceName =
  "akshay-engineering-portfolio-final-responsive-fixed.html";
const referencePath = resolve(referenceName);

createServer((request, response) => {
  if (request.url?.startsWith("/_next/static/media/")) {
    const mediaPath = resolve(
      ".next",
      "static",
      "media",
      request.url.split("/").at(-1),
    );
    if (existsSync(mediaPath)) {
      response.writeHead(200, {
        "Content-Type": "font/woff2",
        "Access-Control-Allow-Origin": "*",
      });
      createReadStream(mediaPath).pipe(response);
      return;
    }
  }
  if (
    request.url !== "/" &&
    request.url !== `/${encodeURIComponent(referenceName)}` &&
    request.url !== `/${referenceName}`
  ) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  });
  createReadStream(referencePath).pipe(response);
}).listen(4173, "127.0.0.1");
