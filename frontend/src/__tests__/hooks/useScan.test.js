import { renderHook } from "@testing-library/react";
import { useScan } from "../../hooks/useScan";

describe("useScan (simple)", () => {
  test("initial state and API", () => {
    const { result } = renderHook(() => useScan());
    expect(result.current.results).toEqual({});
    expect(result.current.loading).toBe(false);
    expect(result.current.getScanSummary()).toBeNull();
    expect(typeof result.current.handleScan).toBe("function");
  });
});
