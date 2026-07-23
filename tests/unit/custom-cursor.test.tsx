import { render, waitFor } from "@testing-library/react";
import { CustomCursor } from "@/components/custom-cursor";

describe("Custom cursor", () => {
  it("activates only when a fine pointer is available", async () => {
    vi.mocked(window.matchMedia).mockImplementation(
      (query) =>
        ({
          matches: query.includes("pointer: fine"),
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );
    vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const { unmount } = render(<CustomCursor />);
    await waitFor(() =>
      expect(document.documentElement.dataset.customCursor).toBe("active"),
    );
    unmount();
    expect(document.documentElement.dataset.customCursor).toBeUndefined();
  });
});
