import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ContactForm } from "@/components/contact-form";
describe("Contact form", () => {
  it("announces field validation errors", async () => {
    render(<ContactForm />);
    fireEvent.submit(
      screen
        .getByRole("button", { name: /validate message/i })
        .closest("form")!,
    );
    await waitFor(() =>
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
  });
});
