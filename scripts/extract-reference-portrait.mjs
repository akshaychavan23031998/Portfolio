import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = fs.readFileSync(
  path.join(root, "akshay-engineering-portfolio-final-responsive-fixed.html"),
  "utf8",
);
const match = source.match(
  /<div class="portrait">[\s\S]*?<img[^>]+src="data:image\/png;base64,([^"]+)"/i,
);
if (!match) throw new Error("Reference portrait was not found.");
const target = path.join(
  root,
  "public",
  "images",
  "profile",
  "reference-portrait.png",
);
fs.writeFileSync(target, Buffer.from(match[1], "base64"));
console.log(target);
