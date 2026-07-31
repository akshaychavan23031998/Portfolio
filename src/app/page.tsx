import fs from "node:fs";
import path from "node:path";
import { getImageProps } from "next/image";
import Script from "next/script";
import { EmailJsContactBridge } from "@/components/emailjs-contact-bridge";
import { siteConfig } from "@/config/site";
import { experience } from "@/data/experience";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { testimonials } from "@/data/testimonials";

function escapeAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function optimizedImage({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const { props } = getImageProps({
    src,
    alt,
    width,
    height,
    sizes,
    priority,
  });
  return `<img src="${escapeAttribute(String(props.src))}" srcset="${escapeAttribute(
    String(props.srcSet),
  )}" sizes="${escapeAttribute(String(props.sizes))}" width="${width}" height="${height}" alt="${escapeAttribute(
    alt,
  )}"${className ? ` class="${className}"` : ""} decoding="async"${
    priority ? ' fetchpriority="high"' : ' loading="lazy" fetchpriority="auto"'
  }>`;
}

function getReferenceBody() {
  const source = fs.readFileSync(
    path.join(
      process.cwd(),
      "akshay-engineering-portfolio-final-responsive-fixed.html",
    ),
    "utf8",
  );
  const body = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1];
  if (!body) throw new Error("Reference HTML body could not be read.");

  let homepage = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(
      /src="data:image\/[^;]+;base64,[^"]+"/i,
      optimizedImage({
        src: "/images/profile/akshay-ram-chavan-transparent.png",
        alt: "Akshay Ram Chavan",
        width: 1086,
        height: 1448,
        sizes: "(max-width: 680px) 44vw, 24vw",
        priority: true,
      }).slice(5, -1),
    );

  projects.forEach((project, index) => {
    homepage = homepage.replace(
      '<div class="visual"><div class="screen"></div></div>',
      `<div class="visual">${optimizedImage({
        src: project.image,
        alt: project.imageAlt,
        width: 1600,
        height: 900,
        sizes:
          index === 0
            ? "(max-width: 980px) 100vw, 66vw"
            : "(max-width: 680px) 100vw, 33vw",
        className: `screen project-image project-image--${project.imageFit}`,
        priority: index === 0,
      })}</div>`,
    );
  });

  let testimonialIndex = 0;
  homepage = homepage.replace(
    /<div class="proof-avatar">[\s\S]*?<\/div>/g,
    () => {
      const testimonial = testimonials[testimonialIndex++];
      const initials = testimonial.name
        .split(" ")
        .map((part) => part[0])
        .join("");
      return `<div class="proof-avatar">${optimizedImage({
        src: testimonial.image,
        alt: testimonial.name,
        width: 160,
        height: 160,
        sizes: "62px",
      })}<span class="avatar-fallback" aria-hidden="true">${initials}</span></div>`;
    },
  );

  homepage = homepage.replace(
    /<a\s+class="btn magnetic"\s+href="https:\/\/drive\.google\.com[\s\S]*?<\/a\s*>/,
    `<a class="btn magnetic" href="${siteConfig.resume}" download="${siteConfig.resumeDownloadName}" aria-label="Download Akshay Ram Chavan résumé">Download résumé ↓</a>`,
  );

  const backendSkills = skillGroups.find(
    (group) => group.title === "Backend & APIs",
  )?.skills;
  const interfaceSkills = skillGroups.find(
    (group) => group.title === "Interface systems",
  )?.skills;
  const qualitySkills = skillGroups.find(
    (group) => group.title === "Quality",
  )?.skills;
  const deliverySkills = skillGroups.find(
    (group) => group.title === "Delivery",
  )?.skills;
  if (interfaceSkills?.includes("JavaScript")) {
    homepage = homepage.replace(
      '<span class="pill">TypeScript</span',
      '<span class="pill">JavaScript</span><span class="pill">TypeScript</span',
    );
  }
  if (qualitySkills?.includes("Grafana")) {
    homepage = homepage.replace(
      '<span class="pill">GitHub Actions</span',
      '<span class="pill">Grafana</span><span class="pill">GitHub Actions</span',
    );
  }
  for (const skill of ["Go", "gRPC"] as const) {
    if (backendSkills?.includes(skill)) {
      homepage = homepage.replace(
        '<span class="pill">Swagger</span>',
        `<span class="pill">Swagger</span><span class="pill">${skill}</span>`,
      );
    }
  }
  if (deliverySkills?.includes("Kubernetes")) {
    homepage = homepage.replace(
      '<span class="pill">Vercel</span>',
      '<span class="pill">Vercel</span><span class="pill">Kubernetes</span>',
    );
  }

  const maybankTag = experience.find(
    (item) => item.role === "Product Engineer Intern",
  )?.tag;
  const opethicTag = experience.find(
    (item) => item.role === "Junior Software Developer",
  )?.tag;
  if (maybankTag) {
    homepage = homepage.replace(
      '<span class="pill">Fintech</span>',
      `<span class="pill">${maybankTag}</span>`,
    );
  }
  if (opethicTag) {
    homepage = homepage.replace(
      '<span class="pill">SaaS</span>',
      `<span class="pill">${opethicTag}</span>`,
    );
  }

  homepage = homepage
    .replace(
      "https://linkedin.com/in/akshayrchavan07",
      siteConfig.linkedin,
    )
    .replace(
      '<li><a href="#contact">Contact</a></li>',
      '<li><a href="#contact">Contact</a></li><li class="mobile-theme"><span>Theme</span><button id="mobileThemeBtn" type="button" aria-pressed="false"><span data-theme-state>Dark</span><span data-theme-icon aria-hidden="true">☾</span></button></li><li class="mobile-hire"><a href="#contact">Hire me ↗</a></li>',
    )
    .replace(
      /<a class="icon-btn hire"\s+href="mailto:akshayrchavan07@gmail\.com"/,
      '<a class="icon-btn hire" href="#contact"',
    )
    .replace(
      /<a\s+class="btn primary magnetic"\s+href="mailto:akshayrchavan07@gmail\.com"\s*>Email me ↗<\/a\s*>/,
      `<a class="btn primary magnetic" href="${siteConfig.emailGmail}" target="_blank" rel="noopener noreferrer" aria-label="Email Akshay Ram Chavan using Gmail">Email me ↗</a>`,
    );

  return homepage;
}

export default function Home() {
  return (
    <>
      <div
        className="reference-page-shell"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: getReferenceBody() }}
      />
      <EmailJsContactBridge />
      <Script src="/reference-runtime.js" strategy="afterInteractive" />
    </>
  );
}
