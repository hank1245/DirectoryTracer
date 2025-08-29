import { renderHook, act } from "@testing-library/react";
import { useReportGenerator } from "../../hooks/useReportGenerator";

describe("useReportGenerator (simple)", () => {
  test("alerts when data incomplete", () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    const { result } = renderHook(() => useReportGenerator({}, null, null));
    act(() => result.current.generateReport());
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
