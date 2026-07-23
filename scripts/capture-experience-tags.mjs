import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const output = path.resolve("artifacts/experience-tag-pass");
await mkdir(output, { recursive: true });
const browser = await chromium.launch();

async function openPage(width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(2_000);
  await page.locator("#experience").scrollIntoViewIfNeeded();
  return page;
}

const desktop = await openPage(1440, 900);
await desktop.locator("#experience").screenshot({
  path: path.join(output, "experience-desktop-1440.png"),
  animations: "disabled",
});
await desktop
  .locator(".job-card")
  .nth(1)
  .screenshot({
    path: path.join(output, "experience-maybank-1440.png"),
    animations: "disabled",
  });
await desktop
  .locator(".job-card")
  .nth(2)
  .screenshot({
    path: path.join(output, "experience-opethic-1440.png"),
    animations: "disabled",
  });
await desktop.close();

const mobile = await openPage(390, 844);
await mobile.locator("#experience").screenshot({
  path: path.join(output, "experience-mobile-390.png"),
  animations: "disabled",
});
await mobile.close();

await browser.close();
