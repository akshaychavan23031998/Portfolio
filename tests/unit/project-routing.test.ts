import sitemap from "@/app/sitemap";
import { generateStaticParams } from "@/app/projects/[slug]/page";

test("Three-Way Match Engine is excluded from case-study route generation", () => {
  const slugs = generateStaticParams().map(({ slug }) => slug);
  expect(slugs).not.toContain("three-way-match-engine");
  expect(slugs).not.toContain("pipeline-builder");
  expect(slugs).not.toContain("tracegraph");
  expect(slugs).toContain("rabbit-ecommerce");
  expect(slugs).toHaveLength(9);
});

test("Three-Way Match Engine is excluded from sitemap detail entries", () => {
  const urls = sitemap().map(({ url }) => url);
  expect(
    urls.some((url) => url.endsWith("/projects/three-way-match-engine")),
  ).toBe(false);
  expect(urls.some((url) => url.endsWith("/projects/pipeline-builder"))).toBe(
    false,
  );
  expect(urls.some((url) => url.endsWith("/projects/tracegraph"))).toBe(false);
  expect(urls.some((url) => url.endsWith("/projects/rabbit-ecommerce"))).toBe(
    true,
  );
});
