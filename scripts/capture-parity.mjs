import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const output = "artifacts/parity";
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const viewports = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1280", width: 1280, height: 720 },
  { name: "tablet-1024", width: 1024, height: 768 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-320", width: 320, height: 568 },
];

async function prepareFullPage(page) {
  await page.evaluate(async () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    for (
      let y = 0;
      y < document.documentElement.scrollHeight;
      y += innerHeight * 0.75
    ) {
      scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    scrollTo(0, 0);
    return reduced.matches;
  });
  await page.waitForTimeout(500);
}

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    colorScheme: "dark",
  });
  const reference = await context.newPage();
  await reference.goto(
    "http://127.0.0.1:4173/akshay-engineering-portfolio-final-responsive-fixed.html",
    { waitUntil: "networkidle" },
  );
  await reference.waitForTimeout(2200);
  await prepareFullPage(reference);
  await reference.screenshot({
    path: `${output}/reference-${viewport.name}.png`,
    fullPage: true,
  });

  const current = await context.newPage();
  await current.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  await current.waitForTimeout(1200);
  await prepareFullPage(current);
  await current.screenshot({
    path: `${output}/current-${viewport.name}.png`,
    fullPage: true,
  });
  if (viewport.name === "desktop-1440") {
    await current.locator(".hero").screenshot({
      path: `${output}/hero-desktop-1440.png`,
    });
    await current.locator("#projects").screenshot({
      path: `${output}/projects-desktop-1440.png`,
    });
  }
  if (viewport.name === "mobile-390") {
    await current.locator("#contact").screenshot({
      path: `${output}/contact-mobile-390.png`,
    });
  }
  await context.close();
}

await browser.close();
