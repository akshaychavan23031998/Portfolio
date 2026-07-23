import { readFile, writeFile } from "node:fs/promises";

const source = await readFile(
  "akshay-engineering-portfolio-final-responsive-fixed.html",
  "utf8",
);
const match = source.match(/<style>([\s\S]*?)<\/style>/);
if (!match) throw new Error("Reference style block not found");

const compatibility = `

/* Next.js integration: reference effects sit behind the React tree. */
.reference-page-shell { position: relative; z-index: 1; }
.global-atmosphere, .cursor-ring, .cursor-spotlight { display: none !important; }
.next-image-fill { object-fit: cover; }
`;

await writeFile(
  "src/app/reference.css",
  `${match[1].trim()}${compatibility}`,
  "utf8",
);
