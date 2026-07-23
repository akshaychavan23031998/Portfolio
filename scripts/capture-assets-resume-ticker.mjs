import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = "http://127.0.0.1:3000";
const outputDirectory = path.resolve("artifacts/assets-resume-ticker-pass");
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch();
const alignmentResults = [];

async function openPage(width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(2_500);
  return page;
}

const desktop = await openPage(1440, 900);
await desktop.locator(".orbit-stage").screenshot({
  path: path.join(outputDirectory, "profile-current-1440.png"),
  animations: "disabled",
});
await desktop.locator("#projects").scrollIntoViewIfNeeded();
await desktop.locator("#projects").screenshot({
  path: path.join(outputDirectory, "projects-current-1440.png"),
  animations: "disabled",
});
await desktop.locator("#social-proof").scrollIntoViewIfNeeded();
await desktop.locator("#social-proof").screenshot({
  path: path.join(outputDirectory, "testimonials-current-1440.png"),
  animations: "disabled",
});
await desktop.locator(".ticker").scrollIntoViewIfNeeded();
await desktop.locator(".ticker").screenshot({
  path: path.join(outputDirectory, "ticker-current-1440.png"),
  animations: "disabled",
});
await desktop
  .getByRole("link", { name: "Download Akshay Ram Chavan résumé" })
  .screenshot({
    path: path.join(outputDirectory, "resume-button-current-1440.png"),
    animations: "disabled",
  });
await desktop.close();

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
]) {
  const page = await openPage(viewport.width, viewport.height);
  const result = await page.locator(".ticker-track").evaluate((track) => {
    const text = track.querySelector("span");
    const separator = track.querySelector("i");
    const textBox = text?.getBoundingClientRect();
    const separatorBox = separator?.getBoundingClientRect();
    const style = getComputedStyle(track);

    return {
      trackDisplay: style.display,
      trackAlignItems: style.alignItems,
      textDisplay: text ? getComputedStyle(text).display : null,
      separatorDisplay: separator ? getComputedStyle(separator).display : null,
      centerDelta:
        textBox && separatorBox
          ? Math.abs(
              textBox.top +
                textBox.height / 2 -
                (separatorBox.top + separatorBox.height / 2),
            )
          : null,
      horizontalOverflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    };
  });
  alignmentResults.push({ viewport, ...result });

  if (viewport.width === 390) {
    await page.locator(".ticker").scrollIntoViewIfNeeded();
    await page.locator(".ticker").screenshot({
      path: path.join(outputDirectory, "ticker-current-390.png"),
      animations: "disabled",
    });
  }
  await page.close();
}

await writeFile(
  path.join(outputDirectory, "ticker-alignment.json"),
  `${JSON.stringify(alignmentResults, null, 2)}\n`,
);
await browser.close();
