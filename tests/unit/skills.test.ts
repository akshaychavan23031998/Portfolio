import { skillGroups } from "@/data/skills";

const originalInterfaceSkills = [
  "React.js",
  "Next.js",
  "TypeScript",
  "JavaScript ES6+",
  "Redux Toolkit",
  "Tailwind CSS",
  "Responsive Design",
  "Performance Optimization",
];

const originalQualitySkills = [
  "Jest",
  "JUnit",
  "Mockito",
  "JaCoCo",
  "SonarQube",
  "React Testing Library",
  "Playwright",
];

test("JavaScript is added once without removing an interface skill", () => {
  const skills = skillGroups.find(
    (group) => group.title === "Interface systems",
  )?.skills;

  expect(skills).toBeDefined();
  expect(skills?.filter((skill) => skill === "JavaScript")).toHaveLength(1);
  for (const skill of originalInterfaceSkills) {
    expect(skills).toContain(skill);
  }
});

test("Grafana is added once without removing a quality skill", () => {
  const skills = skillGroups.find((group) => group.title === "Quality")?.skills;

  expect(skills).toBeDefined();
  expect(skills?.filter((skill) => skill === "Grafana")).toHaveLength(1);
  for (const skill of originalQualitySkills) {
    expect(skills).toContain(skill);
  }
});

test("all existing capability categories remain", () => {
  expect(skillGroups.map((group) => group.title)).toEqual([
    "Interface systems",
    "Backend & APIs",
    "Data layer",
    "Architecture",
    "Quality",
    "Delivery",
  ]);
});
