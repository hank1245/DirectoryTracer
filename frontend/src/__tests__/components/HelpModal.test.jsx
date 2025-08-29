import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import HelpModal from "../../components/HelpModal";

describe("HelpModal", () => {
  test("does not render when closed", () => {
    const { container } = render(
      <HelpModal isOpen={false} onClose={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  // Overlay click test omitted to keep it simple for juniors

  test("calls onClose when close button clicked", () => {
    const onClose = jest.fn();
    render(<HelpModal isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "×" }));
    expect(onClose).toHaveBeenCalled();
  });
});
