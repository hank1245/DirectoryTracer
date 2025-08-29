import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import ResultTable from "../../components/ResultTable";

describe("ResultTable", () => {
  test("renders component", () => {
    render(<ResultTable results={{}} />);
    expect(screen.getByText(/no scan results/i)).toBeInTheDocument();
  });

  test("shows rows, can filter and sort", () => {
    const results = {
      "http://a.com/admin/": {
        status_code: 200,
        content_length: 1234,
        directory_listing: false,
        source: "initial",
        note: "ok",
      },
      "http://a.com/api/users": {
        status_code: 403,
        content_length: 42,
        directory_listing: false,
        source: "js_api",
        note: "api",
      },
      "http://a.com/hidden/": {
        status_code: 404,
        content_length: 0,
        directory_listing: false,
        source: "crawl",
        note: "not found",
      },
    };

    render(<ResultTable results={results} />);

    // Initially, filter is FOUND (Dirs & APIs: 200, 403)
    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    // header + 2 rows (200 dir + 403 js_api)
    expect(rows.length).toBe(3);

    // Change filter to All
    fireEvent.change(screen.getByLabelText(/filter by/i), {
      target: { value: "ALL" },
    });

    const rowsAll = within(screen.getByRole("table")).getAllByRole("row");
    // header + 3 rows
    expect(rowsAll.length).toBe(4);

    // Sort by Length desc and assert first data row
    fireEvent.click(screen.getByText(/^length$/i)); // asc
    fireEvent.click(screen.getByText(/^length$/i)); // desc
    const bodyRows = within(screen.getByRole("table"))
      .getAllByRole("row")
      .slice(1);
    expect(within(bodyRows[0]).getByRole("link").getAttribute("href")).toBe(
      "http://a.com/admin/"
    );

    // Source badge label
    expect(screen.getByText(/initial/i)).toBeInTheDocument();
    expect(screen.getByText(/js api/i)).toBeInTheDocument();
  });
});
