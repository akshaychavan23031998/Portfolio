import { chromium } from "@playwright/test";
import fs from "node:fs/promises";

const output = "artifacts/typography-parity";
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const nextUrl = "http://127.0.0.1:3000/";
const referenceUrl =
  "http://127.0.0.1:4173/akshay-engineering-portfolio-final-responsive-fixed.html";

const discovery = await browser.newPage();
await discovery.goto(nextUrl, { waitUntil: "networkidle" });
const fontCssUrl = await discovery.evaluate(() =>
  [...document.styleSheets]
    .map((sheet) => sheet.href)
    .find((href) => href && [...document.fonts].length > 0),
);
const cssResponse = await discovery.request.get(fontCssUrl);
const localFontCss = (
  (await cssResponse.text()).match(/@font-face\{[^}]+\}/g) ?? []
)
  .join("\n")
  .replaceAll("../media/", "http://127.0.0.1:4173/_next/static/media/");
await discovery.close();

const sections = [
  ["hero-type", ".hero"],
  ["profile-type", "#about"],
  ["capability-type", "#stack"],
  ["experience-type", "#experience .job:first-of-type"],
  ["project-type", "#projects"],
  ["labs-type", "#labs"],
  ["signals-type", ".signal-grid"],
  ["testimonial-type", "#social-proof"],
  ["contact-type", "#contact"],
];

async function prepare(page, isReference) {
  await page.waitForTimeout(1900);
  if (isReference) await page.addStyleTag({ content: localFontCss });
  await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('400 16px "Geist"'),
      document.fonts.load('800 64px "Manrope"'),
      document.fonts.load('500 12px "JetBrains Mono"'),
    ]);
    await document.fonts.ready;
  });
  await page.evaluate(async () => {
    for (
      let y = 0;
      y < document.documentElement.scrollHeight;
      y += innerHeight
    ) {
      scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(200);
}

for (const [width, height] of [
  [1440, 900],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [320, 568],
]) {
  const context = await browser.newContext({ viewport: { width, height } });
  if (width === 1440) {
    for (const [kind, url] of [
      ["reference", referenceUrl],
      ["nextjs", nextUrl],
    ]) {
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "networkidle" });
      await prepare(page, kind === "reference");
      for (const [name, selector] of sections) {
        await page
          .locator(selector)
          .first()
          .screenshot({
            path: `${output}/${kind}-${name}-1440.png`,
          });
      }
      await page.close();
    }
  } else {
    const page = await context.newPage();
    await page.goto(nextUrl, { waitUntil: "networkidle" });
    await prepare(page, false);
    await page.locator(".hero").screenshot({
      path: `${output}/nextjs-mobile-type-${width}.png`,
    });
    await page.close();
  }
  await context.close();
}
await browser.close();
