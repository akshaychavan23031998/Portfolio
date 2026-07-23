import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

test("homepage preserves the reference structure and interactions", async ({
  page,
  isMobile,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.waitForTimeout(1900);

  await expect(page.locator("nav .brand")).toHaveText("ARC.");
  await expect(
    page.locator("#primaryNav li:not(.mobile-hire):not(.mobile-theme) a"),
  ).toHaveText(["About", "Experience", "Projects", "Labs", "Contact"]);
  await expect(page.locator("nav .hire")).toHaveText("Hire me ↗");
  await expect(page.locator("#cmdBtn")).toHaveText("⌘K");
  await expect(page.locator("#themeBtn")).toHaveAttribute(
    "aria-label",
    /Switch to (?:light|dark) mode/,
  );
  await expect(
    page.getByRole("heading", { name: /BUILDING PRODUCT SYSTEMS/i }),
  ).toBeVisible();
  await expect(page.locator(".portrait img")).toBeVisible();
  await expect(page.locator(".floating-tag")).toHaveText([
    "React / Next.js",
    "Node / APIs",
    "Kafka / Redis",
    "Ship / Measure",
  ]);
  await expect(page.locator(".ring .sat")).toHaveCount(2);
  await expect(page.locator(".project")).toHaveCount(9);
  await expect(page.locator("#stars")).toHaveCount(1);
  await expect(page.locator(".spot")).toHaveCount(1);

  if (!isMobile) {
    await page.locator("#cmdBtn").click();
    await expect(page.locator("#palette")).toHaveClass(/open/);
    await page.keyboard.press("Escape");
    await expect(page.locator("#palette")).not.toHaveClass(/open/);
  }

  await page.locator('.filter[data-filter="ai"]').click();
  await expect(page.locator(".project:not(.hidden)")).toHaveCount(2);
  await page.locator('.filter[data-filter="all"]').click();
  await expect(page.locator(".project:not(.hidden)")).toHaveCount(9);

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});

test("mobile navigation follows the reference behavior", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile);
  await page.goto("/");
  const menu = page.locator("#menuBtn");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("nav")).toHaveClass(/menu-open/);
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});

test("mobile theme control toggles both ways and persists", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile);
  await page.addInitScript(() => {
    if (!localStorage.getItem("arc-theme")) {
      localStorage.setItem("arc-theme", "dark");
      localStorage.setItem("theme", "dark");
    }
  });
  await page.goto("/");
  await page.waitForTimeout(1900);
  const menuButton = page.locator("#menuBtn");
  await menuButton.click();
  const themeToggle = page.locator("#mobileThemeBtn");

  await expect(themeToggle).toBeVisible();
  await expect(themeToggle).toHaveAttribute(
    "aria-label",
    "Switch to light mode",
  );
  await expect(themeToggle).toHaveAttribute("aria-pressed", "false");
  await themeToggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(themeToggle).toHaveAttribute(
    "aria-label",
    "Switch to dark mode",
  );
  await expect(themeToggle).toHaveAttribute("aria-pressed", "true");

  await page.reload();
  await page.waitForTimeout(1900);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.locator("#menuBtn").click();
  await page.locator("#mobileThemeBtn").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  expect(
    await page
      .locator("#primaryNav")
      .evaluate((menu) => menu.scrollWidth - menu.clientWidth),
  ).toBeLessThanOrEqual(1);
});

test("project routes, resume, and not-found route remain available", async ({
  page,
}) => {
  for (const slug of [
    "rabbit-ecommerce",
    "ai-quick-blog",
    "quick-chat",
    "giphy-clone",
    "netflix-gpt",
    "ochi-agency",
    "obys-agency",
    "sundown-studio",
    "lazarev-agency",
  ]) {
    await page.goto(`/projects/${slug}`);
    await expect(page.locator(".case-image img")).toBeVisible();
  }
  expect((await page.goto("/not-a-real-route"))?.status()).toBe(404);
  expect(
    (await page.request.get("/resume/akshay-ram-chavan-resume.pdf")).ok(),
  ).toBeTruthy();
});

test("reference source remains present and untouched by runtime", async () => {
  const reference = path.join(
    process.cwd(),
    "akshay-engineering-portfolio-final-responsive-fixed.html",
  );
  expect(fs.existsSync(reference)).toBe(true);
});

test("experience roles retain their content with one industry tag each", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForTimeout(1900);
  await expect(page.locator(".job-card h3")).toHaveText([
    "Software Development Engineer I",
    "Product Engineer Intern",
    "Junior Software Developer",
  ]);
  await expect(page.locator(".job-card .company")).toHaveText([
    "SuperAGI (formerly Contlo) · Bengaluru",
    "MBB Labs Private Limited · Maybank · Bengaluru",
    "Opethic Software Solutions LLP · Solapur",
  ]);
  await expect(page.locator(".job-date")).toHaveText([
    "NOV 2025 — APR 2026",
    "JUN 2024 — NOV 2025",
    "SEP 2023 — JAN 2024",
  ]);
  await expect(page.locator(".job-top > .pill")).toHaveText([
    "AI CRM",
    "Banking",
    "E-Comm",
  ]);
  await expect(page.locator(".job-top > .pill")).toHaveCount(3);
  await expect(page.locator("#experience")).not.toContainText(
    /Banking Domain|E-Commerce Domain|Fintech|SaaS/,
  );
});

test("form interaction tolerates key events without a key value", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.waitForTimeout(1900);
  await page.evaluate(() => dispatchEvent(new Event("keydown")));
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.locator("#conversationForm button[type='submit']").click();
  await expect(page.locator("#formStatus")).not.toBeEmpty();
  expect(errors).toEqual([]);
});

test("honeypot is present without consuming contact-form space", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForTimeout(1900);
  const field = page.locator(".honeypot-field");
  const input = field.locator('input[name="companyWebsite"]');
  await expect(field).toHaveCount(1);
  await expect(field).toHaveAttribute("aria-hidden", "true");
  await expect(input).toHaveAttribute("tabindex", "-1");
  expect(
    await input.evaluate((element) => element.hasAttribute("hidden")),
  ).toBe(false);

  const styles = await field.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      position: style.position,
      opacity: style.opacity,
      pointerEvents: style.pointerEvents,
      width: box.width,
      height: box.height,
    };
  });
  expect(styles).toMatchObject({
    position: "absolute",
    opacity: "0",
    pointerEvents: "none",
    width: 1,
    height: 1,
  });
});

test("three-font typography system loads without serif fallbacks", async ({
  page,
}) => {
  const fontRequestFailures: string[] = [];
  const consoleErrors: string[] = [];
  page.on("requestfailed", (request) => {
    if (/\.(?:woff2?|ttf|otf)(?:\?|$)/i.test(request.url())) {
      fontRequestFailures.push(request.url());
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  const expected = [
    [".hero h1", "Manrope"],
    [".hero-copy", "Geist"],
    [".eyebrow", "JetBrains Mono"],
    [".metric strong", "Manrope"],
    [".project h3", "Manrope"],
    [".project p", "Geist"],
    [".job-date", "JetBrains Mono"],
    [".conversation-form input", "Geist"],
  ];
  for (const [selector, family] of expected) {
    await expect
      .poll(() =>
        page
          .locator(selector)
          .first()
          .evaluate((element) => getComputedStyle(element).fontFamily),
      )
      .toContain(family);
  }

  expect(
    await page.evaluate(async () => {
      const families = ["Geist", "Manrope", "JetBrains Mono"];
      await Promise.all(
        families.map((family) => document.fonts.load(`400 16px "${family}"`)),
      );
      return families.every((family) =>
        document.fonts.check(`400 16px "${family}"`),
      );
    }),
  ).toBe(true);
  expect(
    await page.locator("body *").evaluateAll((elements) =>
      elements
        .filter((element) => {
          const style = getComputedStyle(element);
          return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            element.getClientRects().length > 0
          );
        })
        .some((element) =>
          /Times New Roman|Georgia/i.test(getComputedStyle(element).fontFamily),
        ),
    ),
  ).toBe(false);
  expect(fontRequestFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("local images, résumé download, and ticker alignment are correct", async ({
  page,
}) => {
  const projectPaths = [
    "/images/projects/rabbit-ecommerce.png",
    "/images/projects/ai-quick-blog.png",
    "/images/projects/quick-chat.png",
    "/images/projects/giphy-clone.jpg",
    "/images/projects/netflix-gpt.jpg",
    "/images/projects/ochi-agency.png",
    "/images/projects/obys-agency.png",
    "/images/projects/sundown-studio.jpg",
    "/images/projects/lazarev-agency.jpg",
  ];
  const testimonialPaths = [
    "/images/testimonials/rahul-chavan.jpg",
    "/images/testimonials/shirish-yenganti.png",
    "/images/testimonials/muzzamil-shaikh.png",
    "/images/testimonials/muzammil-alloli.png",
  ];
  await page.goto("/");
  await page.waitForTimeout(1900);

  const projectImages = page.locator(".project .visual img");
  await expect(projectImages).toHaveCount(9);
  for (const [index, assetPath] of projectPaths.entries()) {
    await expect(projectImages.nth(index)).toHaveAttribute(
      "src",
      new RegExp(encodeURIComponent(assetPath).replaceAll("%", "%")),
    );
    expect((await page.request.get(assetPath)).ok()).toBe(true);
  }

  const profile = page.locator(".portrait img");
  await expect(profile).toHaveAttribute("alt", "Akshay Ram Chavan");
  await expect(profile).toHaveAttribute(
    "src",
    /akshay-ram-chavan-transparent\.png/,
  );
  expect(
    await profile.evaluate((image) => getComputedStyle(image).filter),
  ).toBe("none");
  expect(
    (
      await page.request.get(
        "/images/profile/akshay-ram-chavan-transparent.png",
      )
    ).ok(),
  ).toBe(true);

  const testimonialImages = page.locator(".proof-avatar img");
  await expect(testimonialImages).toHaveCount(4);
  for (const [index, assetPath] of testimonialPaths.entries()) {
    await expect(testimonialImages.nth(index)).toHaveAttribute(
      "src",
      new RegExp(encodeURIComponent(assetPath).replaceAll("%", "%")),
    );
    expect((await page.request.get(assetPath)).ok()).toBe(true);
  }

  const resume = page.locator(".hero-actions a").nth(1);
  await expect(resume).toHaveAttribute(
    "href",
    "/resume/akshay-ram-chavan-resume.pdf",
  );
  await expect(resume).toHaveAttribute(
    "download",
    "Akshay-Ram-Chavan-Resume.pdf",
  );
  await expect(resume).not.toHaveAttribute("target", "_blank");
  expect(
    (await page.request.get("/resume/akshay-ram-chavan-resume.pdf")).ok(),
  ).toBe(true);

  expect(
    await page.evaluate(() => {
      const track = document.querySelector(".ticker-track");
      const text = document.querySelector(".ticker-track span");
      const separator = document.querySelector(".ticker-track i");
      if (!track || !text || !separator) return false;
      const textBox = text.getBoundingClientRect();
      const separatorBox = separator.getBoundingClientRect();
      return (
        getComputedStyle(track).alignItems === "center" &&
        ["flex", "inline-flex"].includes(getComputedStyle(text).display) &&
        ["flex", "inline-flex"].includes(getComputedStyle(separator).display) &&
        Math.abs(
          textBox.top +
            textBox.height / 2 -
            (separatorBox.top + separatorBox.height / 2),
        ) < 0.5
      );
    }),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
});

test("profile, actions, skills, domains, and full-width project media are correct", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await page.waitForTimeout(1900);

  const profile = page.locator(".portrait img");
  await expect(profile).toHaveAttribute(
    "src",
    /akshay-ram-chavan-transparent\.png/,
  );
  const portraitStyle = await profile.evaluate((image) => {
    const imageStyle = getComputedStyle(image);
    const wrapperStyle = getComputedStyle(image.parentElement!);
    return {
      filter: imageStyle.filter,
      borderRadius: wrapperStyle.borderRadius,
      boxShadow: wrapperStyle.boxShadow,
      background: wrapperStyle.backgroundColor,
    };
  });
  expect(portraitStyle.filter).toBe("none");
  expect(portraitStyle.borderRadius).toBe("50%");
  expect(portraitStyle.boxShadow).not.toContain("0px 0px 0px 12px");
  expect(portraitStyle.background).toBe("rgba(0, 0, 0, 0)");

  const hire = isMobile
    ? page.locator(".navlinks .mobile-hire a")
    : page.locator("nav .hire");
  await expect(hire).toHaveAttribute("href", "#contact");
  if (isMobile) {
    await page.locator("#menuBtn").click();
    await hire.focus();
    await expect(hire).toBeFocused();
    await hire.click();
    await expect(page.locator("#menuBtn")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  } else {
    await hire.focus();
    await expect(hire).toBeFocused();
  }

  const capabilityCards = page.locator(".stack-card");
  await expect(capabilityCards).toHaveCount(6);
  const backend = capabilityCards.filter({ hasText: "Backend & APIs" });
  const delivery = capabilityCards.filter({ hasText: "Quality & Delivery" });
  await expect(backend.getByText("Go", { exact: true })).toHaveCount(1);
  await expect(backend.getByText("gRPC", { exact: true })).toHaveCount(1);
  await expect(delivery.getByText("Kubernetes", { exact: true })).toHaveCount(
    1,
  );

  const bankingRole = page.locator(".job-card", {
    hasText: "Product Engineer Intern",
  });
  const commerceRole = page.locator(".job-card", {
    hasText: "Junior Software Developer",
  });
  await expect(bankingRole).not.toContainText("Banking Domain");
  await expect(bankingRole.locator(".job-top > .pill")).toHaveText("Banking");
  await expect(commerceRole).not.toContainText("E-Commerce Domain");
  await expect(commerceRole.locator(".job-top > .pill")).toHaveText("E-Comm");
  await expect(
    page
      .locator(".job-card", {
        hasText: "Software Development Engineer I",
      })
      .locator(".job-top > .pill"),
  ).toHaveText("AI CRM");

  const mediaResults = await page
    .locator(".project .visual")
    .evaluateAll((wrappers) =>
      wrappers.map((wrapper) => {
        const image = wrapper.querySelector("img")!;
        const wrapperBox = wrapper.getBoundingClientRect();
        const imageBox = image.getBoundingClientRect();
        const style = getComputedStyle(image);
        return {
          widthDelta: Math.abs(wrapperBox.width - imageBox.width),
          maxWidth: style.maxWidth,
          objectFit: style.objectFit,
          aspectRatio:
            Number(image.getAttribute("width")) /
            Number(image.getAttribute("height")),
        };
      }),
    );
  expect(mediaResults).toHaveLength(9);
  for (const media of mediaResults) {
    expect(media.widthDelta).toBeLessThanOrEqual(2);
    expect(media.maxWidth).toBe("none");
    expect(media.objectFit).toBe("cover");
    expect(media.aspectRatio).toBeGreaterThan(1);
  }

  const gmail = page.getByRole("link", {
    name: "Email Akshay Ram Chavan using Gmail",
  });
  await expect(gmail).toHaveAttribute(
    "href",
    "https://mail.google.com/mail/?view=cm&fs=1&to=akshayrchavan07@gmail.com",
  );
  await expect(gmail).toHaveAttribute("target", "_blank");
  await expect(gmail).toHaveAttribute("rel", "noopener noreferrer");

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);

  await page.goto("/projects/rabbit-ecommerce");
  await expect(page.locator(".hire-button")).toHaveAttribute(
    "href",
    "/#contact",
  );
});
