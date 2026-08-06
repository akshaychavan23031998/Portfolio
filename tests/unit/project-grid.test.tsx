import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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
    expect(screen.getByText("Three-Way Match Engine")).toBeInTheDocument();
    expect(screen.queryByText("Pipeline Builder")).not.toBeInTheDocument();
    expect(screen.getAllByText("Case study →")).toHaveLength(2);
  });

  it("includes Pipeline Builder in Full Stack, Frontend, and Backend only", async () => {
    render(<ProjectGrid />);
    for (const category of ["Full Stack", "Frontend", "Backend"]) {
      fireEvent.click(screen.getByRole("button", { name: category }));
      expect(screen.getByText("Pipeline Builder")).toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole("button", { name: "AI" }));
    await waitFor(() =>
      expect(screen.queryByText("Pipeline Builder")).not.toBeInTheDocument(),
    );
  });

  it("includes the match engine in its existing project categories", async () => {
    render(<ProjectGrid />);
    for (const category of ["Full Stack", "Backend"]) {
      fireEvent.click(screen.getByRole("button", { name: category }));
      expect(screen.getByText("Three-Way Match Engine")).toBeInTheDocument();
    }
  });

  it("renders only Code and Live actions for Three-Way Match Engine", () => {
    render(<ProjectGrid />);
    const card = screen.getByText("Three-Way Match Engine").closest("article");
    expect(card).not.toBeNull();
    const links = within(card as HTMLElement).getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      "Code",
      "Live",
    ]);
    expect(
      within(card as HTMLElement).queryByText(/case study/i),
    ).not.toBeInTheDocument();
  });

  it("renders only Code and Live actions for Pipeline Builder", () => {
    render(<ProjectGrid />);
    const card = screen.getByText("Pipeline Builder").closest("article");
    expect(card).not.toBeNull();
    const links = within(card as HTMLElement).getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      "Code",
      "Live",
    ]);
    expect(
      within(card as HTMLElement).queryByText(/case study/i),
    ).not.toBeInTheDocument();
  });

  it("hides only the requested card technology containers", () => {
    render(<ProjectGrid />);
    for (const title of [
      /Rabbit/,
      "Three-Way Match Engine",
      "Pipeline Builder",
    ]) {
      const card = screen.getByText(title).closest("article");
      expect(card?.querySelector(".tags")).not.toBeInTheDocument();
    }
    const unchangedCard = screen.getByText(/AI Quick Blog/).closest("article");
    expect(unchangedCard?.querySelector(".tags")).toBeInTheDocument();
  });
});
