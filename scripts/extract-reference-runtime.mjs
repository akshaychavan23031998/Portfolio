import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = fs.readFileSync(
  path.join(root, "akshay-engineering-portfolio-final-responsive-fixed.html"),
  "utf8",
);
const scripts = [...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
if (!scripts.length) throw new Error("Reference runtime was not found.");
const runtime = scripts.at(-1)[1];
fs.writeFileSync(
  path.join(root, "public", "reference-runtime.js"),
  `/* Generated from the immutable reference HTML. */\n${runtime}\n` +
    `if(document.readyState==="complete"&&!document.body.classList.contains("ready"))setTimeout(()=>document.body.classList.add("ready"),1750);\n`,
);
console.log("public/reference-runtime.js");
