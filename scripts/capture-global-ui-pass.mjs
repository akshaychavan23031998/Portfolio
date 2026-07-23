import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const output = "artifacts/global-ui-pass";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });

const desktop = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "dark",
});
const page = await desktop.newPage();
await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.locator(".site-header").screenshot({
  path: `${output}/current-navbar-1440.png`,
});
await page.screenshot({
  path: `${output}/current-background-1440.png`,
});
await page.locator(".global-signals").screenshot({
  path: `${output}/current-signal-balls-1440.png`,
});
await page.mouse.move(720, 430, { steps: 10 });
await page.waitForTimeout(700);
await page.screenshot({
  path: `${output}/current-cursor-spotlight-1440.png`,
});

await page.goto("http://127.0.0.1:3000/projects/rabbit-ecommerce", {
  waitUntil: "networkidle",
});
await page.waitForTimeout(400);
await page.screenshot({
  path: `${output}/current-background-project-page-1440.png`,
});
await desktop.close();

const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  colorScheme: "dark",
  hasTouch: true,
  isMobile: true,
});
const mobilePage = await mobile.newPage();
await mobilePage.goto("http://127.0.0.1:3000/", {
  waitUntil: "networkidle",
});
await mobilePage.locator(".site-header").screenshot({
  path: `${output}/current-mobile-navbar-390.png`,
});
await mobilePage.getByRole("button", { name: "Open menu" }).click();
await mobilePage.waitForTimeout(200);
await mobilePage.screenshot({
  path: `${output}/current-mobile-menu-open-390.png`,
});
await mobile.close();

const referenceContext = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "dark",
});
const reference = await referenceContext.newPage();
await reference.goto(
  "http://127.0.0.1:4173/akshay-engineering-portfolio-final-responsive-fixed.html",
  { waitUntil: "networkidle" },
);
await reference.waitForTimeout(2200);
await reference.locator('nav[aria-label="Primary"]').screenshot({
  path: `${output}/reference-navbar-1440.png`,
});
await referenceContext.close();
await browser.close();
