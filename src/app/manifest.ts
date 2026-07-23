import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Akshay Ram Chavan — Engineering Portfolio",
    short_name: "Akshay.",
    description: "Full stack and product engineering portfolio",
    start_url: "/",
    display: "standalone",
    background_color: "#08090c",
    theme_color: "#08090c",
    icons: [],
  };
}
