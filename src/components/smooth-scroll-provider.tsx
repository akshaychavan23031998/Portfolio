"use client";

import type LocomotiveScroll from "locomotive-scroll";
import { useEffect, useRef } from "react";

const desktopPointerQuery = "(pointer: fine) and (hover: hover)";
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

type HashNavigationDetail = {
  hash?: string;
};

type ScrollLoader = () => Promise<{ default: typeof LocomotiveScroll }>;

const loadBrowserScroll: ScrollLoader = () => import("locomotive-scroll");

export function SmoothScrollProvider({
  children,
  loadScroll = loadBrowserScroll,
}: {
  children: React.ReactNode;
  loadScroll?: ScrollLoader;
}) {
  const instanceRef = useRef<LocomotiveScroll | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const desktopPointer = window.matchMedia(desktopPointerQuery);
    const reducedMotion = window.matchMedia(reducedMotionQuery);
    let disposed = false;

    const scrollToHash = (hash: string) => {
      if (!hash.startsWith("#")) return;
      const target = document.querySelector<HTMLElement>(hash);
      if (!target) return;

      window.history.pushState(null, "", hash);
      if (instanceRef.current) {
        instanceRef.current.scrollTo(target, { offset: -90 });
      } else {
        target.scrollIntoView({ behavior: "auto", block: "start" });
      }
    };

    const onHashNavigation = (event: Event) => {
      const hash = (event as CustomEvent<HashNavigationDetail>).detail?.hash;
      if (hash) scrollToHash(hash);
    };

    window.addEventListener("portfolio:navigate-hash", onHashNavigation);

    if (!desktopPointer.matches || reducedMotion.matches) {
      root.dataset.scrollEngine = "native";
      return () => {
        window.removeEventListener("portfolio:navigate-hash", onHashNavigation);
        delete root.dataset.scrollEngine;
      };
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        instanceRef.current?.stop();
      } else {
        instanceRef.current?.start();
      }
    };

    void loadScroll().then(({ default: LocomotiveScrollConstructor }) => {
      if (disposed) return;

      instanceRef.current = new LocomotiveScrollConstructor({
        autoStart: true,
        lenisOptions: {
          anchors: { offset: -90 },
          lerp: 0.12,
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          syncTouch: false,
          wheelMultiplier: 1,
          stopInertiaOnNavigate: true,
        },
      });
      root.dataset.scrollEngine = "locomotive";
      document.addEventListener("visibilitychange", onVisibilityChange);
    });

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("portfolio:navigate-hash", onHashNavigation);
      instanceRef.current?.destroy();
      instanceRef.current = null;
      delete root.dataset.scrollEngine;
    };
  }, [loadScroll]);

  return children;
}
