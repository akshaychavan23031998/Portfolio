import { render, screen } from "@testing-library/react";
import { GlobalAtmosphere } from "@/components/layout/global-atmosphere";

describe("Global atmosphere", () => {
  it("renders one deterministic decorative system", () => {
    const { container } = render(<GlobalAtmosphere />);
    expect(screen.getByTestId("global-atmosphere")).toBeInTheDocument();
    expect(container.querySelectorAll(".star")).toHaveLength(24);
    expect(container.querySelectorAll(".global-signal")).toHaveLength(5);
    expect(container.querySelectorAll(".cursor-spotlight")).toHaveLength(0);
  });
});
