import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProjectGrid } from "@/components/project-grid";
vi.mock("next/image", () => ({
  default: (
    imageProps: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean },
  ) => {
    const props = { ...imageProps };
    delete props.fill;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt={props.alt ?? ""} {...props} />
    );
  },
}));
describe("Project filters", () => {
  it("filters by AI and exposes real case study links", async () => {
    render(<ProjectGrid />);
    fireEvent.click(screen.getByRole("button", { name: "AI" }));
    expect(screen.getByText("Netflix GPT")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByText("Quick Chat – MERN Stack Chat App"),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getAllByText("Case study →")).toHaveLength(2);
  });
});
