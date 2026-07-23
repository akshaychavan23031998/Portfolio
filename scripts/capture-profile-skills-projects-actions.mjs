import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const output = path.resolve("artifacts/profile-skills-projects-actions-pass");
await mkdir(output, { recursive: true });
const browser = await chromium.launch();

async function pageAt(width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(2_500);
  return page;
}

for (const viewport of [
  { width: 1440, height: 900, name: "desktop-1440" },
  { width: 768, height: 1024, name: "tablet-768" },
  { width: 390, height: 844, name: "mobile-390" },
]) {
  const page = await pageAt(viewport.width, viewport.height);
  await page.locator(".orbit-stage").screenshot({
    path: path.join(output, `profile-${viewport.name}.png`),
    animations: "disabled",
  });
  await page.close();
}

const desktop = await pageAt(1440, 900);
for (const [selector, filename] of [
  [".stack-grid", "capability-map-desktop-1440.png"],
  ["#experience .timeline", "experience-domains-1440.png"],
  ["#projects", "projects-full-width-1440.png"],
]) {
  await desktop.locator(selector).scrollIntoViewIfNeeded();
  await desktop.locator(selector).screenshot({
    path: path.join(output, filename),
    animations: "disabled",
  });
}

await desktop.locator("nav .hire").click();
await desktop.locator("#contact").screenshot({
  path: path.join(output, "hire-me-contact-navigation.png"),
  animations: "disabled",
});
await desktop
  .getByRole("link", { name: "Email Akshay Ram Chavan using Gmail" })
  .screenshot({
    path: path.join(output, "gmail-action.png"),
    animations: "disabled",
  });
await desktop.close();

const mobile = await pageAt(390, 844);
await mobile.locator("#projects").scrollIntoViewIfNeeded();
await mobile.locator("#projects").screenshot({
  path: path.join(output, "projects-full-width-390.png"),
  animations: "disabled",
});
await mobile.close();

await browser.close();
