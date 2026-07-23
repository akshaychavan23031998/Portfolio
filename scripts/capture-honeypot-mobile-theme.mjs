import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const output = path.resolve("artifacts/honeypot-mobile-theme-pass");
await mkdir(output, { recursive: true });
const browser = await chromium.launch();

async function openPage(width, height, theme = "dark") {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.addInitScript((initialTheme) => {
    localStorage.setItem("arc-theme", initialTheme);
    localStorage.setItem("theme", initialTheme);
  }, theme);
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(2_000);
  return page;
}

const desktop = await openPage(1440, 900);
await desktop.locator("#contact").scrollIntoViewIfNeeded();
await desktop.locator("#contact").screenshot({
  path: path.join(output, "contact-before-or-after-1440.png"),
  animations: "disabled",
});
await desktop.locator("#conversationForm").screenshot({
  path: path.join(output, "contact-form-clean-1440.png"),
  animations: "disabled",
});
await desktop.close();

const mobile = await openPage(390, 844);
await mobile.locator("#conversationForm").scrollIntoViewIfNeeded();
await mobile.locator("#conversationForm").screenshot({
  path: path.join(output, "contact-form-clean-390.png"),
  animations: "disabled",
});
await mobile.locator("#menuBtn").click();
await mobile.screenshot({
  path: path.join(output, "mobile-menu-dark-390.png"),
  animations: "disabled",
});
await mobile.locator("#mobileThemeBtn").click();
await mobile.screenshot({
  path: path.join(output, "mobile-menu-light-390.png"),
  animations: "disabled",
});
await mobile.close();

const narrow = await openPage(320, 568);
await narrow.locator("#menuBtn").click();
await narrow.locator(".mobile-theme").screenshot({
  path: path.join(output, "mobile-theme-toggle-320.png"),
  animations: "disabled",
});
await narrow.close();

await browser.close();
