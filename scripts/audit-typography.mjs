import { chromium } from "@playwright/test";
import fs from "node:fs/promises";

const targets = [
  ["body", "body"],
  ["nav brand", "nav .brand"],
  ["nav link", "#primaryNav a"],
  ["hero h1", ".hero h1"],
  ["role line", ".role-line"],
  ["hero paragraph", ".hero-copy"],
  ["button", ".hero-actions .btn"],
  ["metric number", ".metric strong"],
  ["section h2", ".section-head h2"],
  ["eyebrow", ".eyebrow"],
  ["capability card h3", ".stack-card h3"],
  ["pill", ".pill"],
  ["job date", ".job-date"],
  ["job title", ".job-card h3"],
  ["project title", ".project h3"],
  ["project paragraph", ".project p"],
  ["lab title", ".lab h3"],
  ["testimonial quote", ".proof-card blockquote"],
  ["contact heading", ".contact-copy h2"],
  ["form input", ".conversation-form input"],
  ["footer", ".site-footer"],
];

const browser = await chromium.launch({ headless: true });
const result = {};
for (const [kind, url] of [
  [
    "reference",
    "http://127.0.0.1:4173/akshay-engineering-portfolio-final-responsive-fixed.html",
  ],
  ["current", "http://127.0.0.1:3000/"],
]) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  const consoleMessages = [];
  const failedRequests = [];
  page.on("console", (message) =>
    consoleMessages.push({ type: message.type(), text: message.text() }),
  );
  page.on("requestfailed", (request) =>
    failedRequests.push({
      url: request.url(),
      error: request.failure()?.errorText,
    }),
  );
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  result[kind] = {
    styles: await page.evaluate((items) => {
      return Object.fromEntries(
        items.map(([name, selector]) => {
          const element = document.querySelector(selector);
          if (!element) return [name, null];
          const style = getComputedStyle(element);
          return [
            name,
            {
              selector,
              fontFamily: style.fontFamily,
              fontWeight: style.fontWeight,
              fontSize: style.fontSize,
              lineHeight: style.lineHeight,
              letterSpacing: style.letterSpacing,
            },
          ];
        }),
      );
    }, targets),
    fontFaces: await page.evaluate(() =>
      [...document.fonts].map((font) => ({
        family: font.family,
        status: font.status,
        weight: font.weight,
      })),
    ),
    stylesheets: await page.evaluate(() =>
      [...document.styleSheets].map((sheet) => sheet.href ?? "inline"),
    ),
    consoleMessages,
    failedRequests,
  };
  await context.close();
}
await fs.mkdir("artifacts/typography-parity", { recursive: true });
await fs.writeFile(
  "artifacts/typography-parity/typography-computed-styles-before.json",
  JSON.stringify(result, null, 2),
);
await browser.close();
