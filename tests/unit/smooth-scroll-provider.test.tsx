import { StrictMode } from "react";
import { act, render, waitFor } from "@testing-library/react";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";

const scrollMocks = vi.hoisted(() => ({
  instances: 0,
  destroy: vi.fn(),
  raf: vi.fn(),
  scrollTo: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
}));

class MockLocomotiveScroll {
  constructor() {
    scrollMocks.instances += 1;
  }
  destroy = scrollMocks.destroy;
  raf = scrollMocks.raf;
  scrollTo = scrollMocks.scrollTo;
  start = scrollMocks.start;
  stop = scrollMocks.stop;
}

const loadScroll = () =>
  Promise.resolve({
    default:
      MockLocomotiveScroll as unknown as typeof import("locomotive-scroll").default,
  });

function mockMedia({
  finePointer,
  reducedMotion,
}: {
  finePointer: boolean;
  reducedMotion: boolean;
}) {
  vi.mocked(window.matchMedia).mockImplementation(
    (query) =>
      ({
        matches: query.includes("pointer: fine") ? finePointer : reducedMotion,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList,
  );
}

describe("SmoothScrollProvider", () => {
  beforeEach(() => {
    scrollMocks.instances = 0;
    vi.clearAllMocks();
    delete document.documentElement.dataset.scrollEngine;
  });

  it("creates one browser instance in Strict Mode and destroys it", async () => {
    mockMedia({ finePointer: true, reducedMotion: false });
    vi.spyOn(window, "requestAnimationFrame").mockReturnValue(7);
    const cancel = vi
      .spyOn(window, "cancelAnimationFrame")
      .mockImplementation(() => {});

    const { unmount } = render(
      <StrictMode>
        <SmoothScrollProvider loadScroll={loadScroll}>
          <main>content</main>
        </SmoothScrollProvider>
      </StrictMode>,
    );

    await waitFor(() =>
      expect(document.documentElement.dataset.scrollEngine).toBe("locomotive"),
    );
    expect(scrollMocks.instances).toBe(1);

    unmount();
    expect(cancel).not.toHaveBeenCalled();
    expect(scrollMocks.destroy).toHaveBeenCalledOnce();
    expect(document.documentElement.dataset.scrollEngine).toBeUndefined();
  });

  it.each([
    { finePointer: false, reducedMotion: false },
    { finePointer: true, reducedMotion: true },
  ])("uses native scrolling for $finePointer/$reducedMotion", async (media) => {
    mockMedia(media);
    render(
      <SmoothScrollProvider loadScroll={loadScroll}>
        <main>content</main>
      </SmoothScrollProvider>,
    );

    await waitFor(() =>
      expect(document.documentElement.dataset.scrollEngine).toBe("native"),
    );
    expect(scrollMocks.instances).toBe(0);
  });

  it("routes command navigation through the active instance", async () => {
    mockMedia({ finePointer: true, reducedMotion: false });
    vi.spyOn(window, "requestAnimationFrame").mockReturnValue(8);
    const target = document.createElement("section");
    target.id = "contact";
    document.body.append(target);

    render(
      <SmoothScrollProvider loadScroll={loadScroll}>
        <main>content</main>
      </SmoothScrollProvider>,
    );
    await waitFor(() => expect(scrollMocks.instances).toBe(1));

    act(() => {
      window.dispatchEvent(
        new CustomEvent("portfolio:navigate-hash", {
          detail: { hash: "#contact" },
        }),
      );
    });

    expect(window.location.hash).toBe("#contact");
    expect(scrollMocks.scrollTo).toHaveBeenCalledWith(target, { offset: -90 });
    target.remove();
  });
});
