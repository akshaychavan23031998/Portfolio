import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ProjectCaseStudyModal } from "@/components/project-case-study-modal";

describe("ProjectCaseStudyModal", () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.removeAttribute("style");
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-scroll-paused");
  });

  it("opens selected content, traps focus, and restores the trigger", async () => {
    const trigger = document.createElement("button");
    trigger.dataset.caseStudySlug = "pipeline-builder";
    trigger.textContent = "Case study";
    document.body.appendChild(trigger);
    render(<ProjectCaseStudyModal />);

    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", {
      name: "Pipeline Builder",
    });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.getByText("{{variable}} detection")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.position).toBe("fixed");
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(
      dialog.querySelectorAll<HTMLElement>(".case-study-scroll"),
    ).toHaveLength(1);
    expect(dialog).toHaveClass("project-case-study");
    expect(dialog).not.toHaveClass("case-study-scroll");
    expect(dialog.querySelector(".case-study-scroll")).toHaveAttribute(
      "tabindex",
      "0",
    );
    expect(
      screen.getByRole("button", { name: /close case study/i }),
    ).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
    expect(document.body.style.position).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
    trigger.remove();
  });

  it("auto-hides the modal scrollbar with one resettable timer", () => {
    vi.useFakeTimers();
    const trigger = document.createElement("button");
    trigger.dataset.caseStudySlug = "rabbit-ecommerce";
    document.body.appendChild(trigger);
    render(<ProjectCaseStudyModal />);
    fireEvent.click(trigger);
    const scrollArea = screen
      .getByRole("dialog")
      .querySelector(".case-study-scroll") as HTMLElement;

    fireEvent.scroll(scrollArea);
    expect(scrollArea).toHaveClass("is-modal-scrolling");
    act(() => vi.advanceTimersByTime(500));
    fireEvent.scroll(scrollArea);
    act(() => vi.advanceTimersByTime(749));
    expect(scrollArea).toHaveClass("is-modal-scrolling");
    act(() => vi.advanceTimersByTime(1));
    expect(scrollArea).not.toHaveClass("is-modal-scrolling");
    trigger.remove();
  });

  it("routes keyboard scrolling to the modal and clears lifecycle state", () => {
    vi.useFakeTimers();
    const lockStates: boolean[] = [];
    const onLock = (event: Event) => {
      lockStates.push(
        Boolean((event as CustomEvent<{ locked: boolean }>).detail.locked),
      );
    };
    window.addEventListener("portfolio:modal-scroll-lock", onLock);
    const trigger = document.createElement("button");
    trigger.dataset.caseStudySlug = "three-way-match-engine";
    document.body.appendChild(trigger);
    render(<ProjectCaseStudyModal />);
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog");
    const scrollArea = dialog.querySelector(
      ".case-study-scroll",
    ) as HTMLElement;
    Object.defineProperties(scrollArea, {
      clientHeight: { configurable: true, value: 400 },
      scrollHeight: { configurable: true, value: 1600 },
    });

    fireEvent.keyDown(document, { key: "PageDown" });
    expect(scrollArea.scrollTop).toBe(340);
    fireEvent.keyDown(document, { key: "End" });
    expect(scrollArea.scrollTop).toBe(1600);
    fireEvent.keyDown(document, { key: "Home" });
    expect(scrollArea.scrollTop).toBe(0);
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    fireEvent.scroll(scrollArea);

    fireEvent.click(screen.getByRole("button", { name: /close case study/i }));
    expect(lockStates).toEqual([true, false]);
    expect(clearTimeoutSpy).toHaveBeenCalled();
    window.removeEventListener("portfolio:modal-scroll-lock", onLock);
    trigger.remove();
  });

  it("closes from the close button without changing the URL", async () => {
    const initialUrl = window.location.href;
    const trigger = document.createElement("button");
    trigger.dataset.caseStudySlug = "rabbit-ecommerce";
    document.body.appendChild(trigger);
    render(<ProjectCaseStudyModal />);
    fireEvent.click(trigger);
    fireEvent.click(
      await screen.findByRole("button", { name: /close case study/i }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(window.location.href).toBe(initialUrl);
    trigger.remove();
  });

  it("renders verified TraceGraph content in the shared modal", async () => {
    const trigger = document.createElement("button");
    trigger.dataset.caseStudySlug = "tracegraph";
    document.body.appendChild(trigger);
    render(<ProjectCaseStudyModal />);
    fireEvent.click(trigger);

    expect(
      await screen.findByRole("dialog", { name: "TraceGraph" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/96 nodes/)).toBeInTheDocument();
    expect(screen.getByText(/Neo4j Driver → CognoDB/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Graph model" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Decision log" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^Future improvements:/)).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/Wexa|assignment|take-home/i);
    trigger.remove();
  });
});
