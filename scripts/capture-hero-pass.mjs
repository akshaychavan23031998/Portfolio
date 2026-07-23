import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const output = "artifacts/hero-pass";
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const viewports = [
  [320, 568],
  [360, 800],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1280, 720],
  [1440, 900],
  [1920, 1080],
];

for (const [width, height] of viewports) {
  const context = await browser.newContext({
    viewport: { width, height },
    colorScheme: "dark",
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const result = await page.evaluate(() => {
    const hero = document.querySelector(".hero");
    const orbit = document.querySelector(".orbit");
    const tickerGroups = [...document.querySelectorAll("[data-marquee-group]")];
    return {
      overflow:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
      heroBottom: hero?.getBoundingClientRect().bottom,
      orbitVisible: !!orbit && orbit.getBoundingClientRect().width > 0,
      groupsIdentical:
        tickerGroups.length === 2 &&
        tickerGroups[0].textContent === tickerGroups[1].textContent,
      customCursor: document.documentElement.dataset.customCursor ?? "off",
    };
  });
  console.log(`${width}x${height}`, result);

  if (width === 1440) {
    await page.locator(".hero").screenshot({
      path: `${output}/hero-current-1440.png`,
    });
    await page.locator(".ticker").screenshot({
      path: `${output}/marquee-current-1440.png`,
    });
    const cta = page.getByRole("link", { name: /explore engineering work/i });
    await cta.hover();
    const box = await cta.boundingBox();
    if (box)
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
        steps: 8,
      });
    await page.waitForTimeout(650);
    await page.locator(".hero").screenshot({
      path: `${output}/cursor-hover-current-1440.png`,
    });
  }
  if (width === 768 || width === 390) {
    await page.locator(".hero").screenshot({
      path: `${output}/hero-current-${width}.png`,
    });
  }
  await context.close();
}

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
await reference.locator(".hero").screenshot({
  path: `${output}/hero-reference-1440.png`,
});
await referenceContext.close();
await browser.close();
