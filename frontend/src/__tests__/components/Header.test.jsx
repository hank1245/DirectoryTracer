import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "../../components/Header";

// Mock the buy-me-a-coffee hook to a no-op and to capture the styles passed
const mockHook = jest.fn();
jest.mock("../../hooks/useBuyMeACoffee", () => ({
  __esModule: true,
  default: (styles) => mockHook(styles),
}));

describe("Header", () => {
  test("renders links and title", () => {
    render(<Header />);

    expect(
      screen.getByRole("heading", { name: /directory tracer/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      expect.stringContaining("github.com")
    );
    expect(
      screen.getByRole("link", { name: /buy me a coffee/i })
    ).toHaveAttribute("href", expect.stringContaining("buymeacoffee.com"));
    // Hook should be called with styles module
    expect(mockHook).toHaveBeenCalled();
  });
});
