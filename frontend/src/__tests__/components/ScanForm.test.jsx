import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ScanForm from "../../components/ScanForm";

// Mock lazy HelpModal to avoid Suspense/act warnings and keep test simple
jest.mock("../../components/HelpModal", () => ({
  __esModule: true,
  default: () => null,
}));

describe("ScanForm", () => {
  test("validates empty target list and shows alert", () => {
    const onScan = jest.fn();
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<ScanForm onScan={onScan} />);

    fireEvent.click(screen.getByRole("button", { name: /start scan/i }));

    expect(alertSpy).toHaveBeenCalled();
    expect(onScan).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  test("submits with parsed values and calls onScan once", () => {
    const onScan = jest.fn();
    render(<ScanForm onScan={onScan} />);

    // Fill target URLs (2 lines, one blank in between)
    fireEvent.change(
      screen.getByLabelText(/target url list/i, { selector: "textarea" }),
      {
        target: { value: "http://a.com\n\nhttp://b.com" },
      }
    );

    // Session cookies
    fireEvent.change(
      screen.getByLabelText(/session cookies/i, { selector: "textarea" }),
      {
        target: { value: "sid=abc; token=xyz" },
      }
    );

    // Exclusions
    fireEvent.change(screen.getByLabelText(/domains or urls to exclude/i), {
      target: { value: "foo.com\nbar.com\n" },
    });

    // Change mode
    fireEvent.change(screen.getByLabelText(/scan mode/i), {
      target: { value: "darkweb" },
    });

    // Change max depth
    fireEvent.change(screen.getByLabelText(/maximum crawling depth/i), {
      target: { value: "3" },
    });

    // Toggle robots off
    fireEvent.click(screen.getByLabelText(/respect robots\.txt rules/i));

    fireEvent.click(screen.getByRole("button", { name: /start scan/i }));

    expect(onScan).toHaveBeenCalledTimes(1);
    const args = onScan.mock.calls[0];
    expect(args[0]).toEqual(["http://a.com", "http://b.com"]); // target list
    expect(args[1]).toBe("darkweb"); // mode
    expect(args[2]).toEqual(["foo.com", "bar.com"]); // exclusions
    expect(args[3]).toBe(3); // max depth parsed to number
    expect(args[4]).toBe(false); // respect robots
    expect(Array.isArray(args[5])).toBe(true); // dictionary operations
    expect(args[6]).toBe(true); // use default dictionary
    expect(args[7]).toBe("sid=abc; token=xyz"); // session cookies
  });
});
