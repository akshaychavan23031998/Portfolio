import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const output = path.resolve("artifacts/reference-migration");
await fs.mkdir(output, { recursive: true });

const viewports = [
  ["1920", 1920, 1080],
  ["1440", 1440, 900],
  ["1280", 1280, 720],
  ["1024", 1024, 768],
  ["768", 768, 1024],
  ["430", 430, 932],
  ["390", 390, 844],
  ["375", 375, 812],
  ["320", 320, 568],
];
const referenceUrl =
  "http://127.0.0.1:4173/akshay-engineering-portfolio-final-responsive-fixed.html";
const nextUrl = "http://127.0.0.1:3000/";
const browser = await chromium.launch({ headless: true });
const report = [];

async function prepare(page) {
  await page.waitForTimeout(2100);
  await page.evaluate(async () => {
    for (
      let y = 0;
      y < document.documentElement.scrollHeight;
      y += innerHeight
    ) {
      scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 45));
    }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(250);
}

for (const [name, width, height] of viewports) {
  const context = await browser.newContext({
    viewport: { width, height },
    colorScheme: "dark",
  });
  const images = {};
  for (const [kind, url] of [
    ["reference", referenceUrl],
    ["nextjs", nextUrl],
  ]) {
    const page = await context.newPage();
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(url, { waitUntil: "networkidle" });
    await prepare(page);
    const target = path.join(output, `${kind}-${name}.png`);
    await page.screenshot({ path: target, fullPage: true });
    images[kind] = target;
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    report.push({ name, kind, errors, overflow });
    if (name === "1440" || name === "390") {
      for (const [sectionName, selector] of [
        ["hero", ".hero"],
        ["projects", "#projects"],
        ["contact", "#contact"],
      ]) {
        await page.locator(selector).screenshot({
          path: path.join(output, `${kind}-${sectionName}-${name}.png`),
        });
      }
    }
    await page.close();
  }

  const reference = sharp(images.reference);
  const next = sharp(images.nextjs);
  const [referenceMeta, nextMeta] = await Promise.all([
    reference.metadata(),
    next.metadata(),
  ]);
  if (
    referenceMeta.width === nextMeta.width &&
    referenceMeta.height === nextMeta.height
  ) {
    const { data: refData, info } = await reference
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const nextData = await next.ensureAlpha().raw().toBuffer();
    const diffData = Buffer.alloc(refData.length);
    let changed = 0;
    for (let i = 0; i < refData.length; i += 4) {
      const delta =
        Math.abs(refData[i] - nextData[i]) +
        Math.abs(refData[i + 1] - nextData[i + 1]) +
        Math.abs(refData[i + 2] - nextData[i + 2]);
      const value = Math.min(255, delta);
      diffData[i] = value;
      diffData[i + 1] = value;
      diffData[i + 2] = value;
      diffData[i + 3] = 255;
      if (delta > 30) changed++;
    }
    await sharp(diffData, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .png()
      .toFile(path.join(output, `diff-${name}.png`));
    report.push({
      name,
      diffPercent: Number(
        ((changed / (info.width * info.height)) * 100).toFixed(4),
      ),
    });
  }
  await context.close();
}

await fs.writeFile(
  path.join(output, "comparison-report.json"),
  JSON.stringify(report, null, 2),
);
await browser.close();
