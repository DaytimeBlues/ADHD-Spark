import { renderHook, act } from "@testing-library/react-native";
import { AccessibilityInfo } from "react-native";
import useReducedMotion from "../src/hooks/useReducedMotion";

describe("useReducedMotion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(AccessibilityInfo, "addEventListener")
      .mockReturnValue({ remove: jest.fn() });
  });

  it("reads accessibility setting on mount", async () => {
    jest
      .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
      .mockResolvedValue(true);

    const { result } = renderHook(() => useReducedMotion());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toBe(true);
  });

  it("falls back to false when settings fetch fails", async () => {
    jest
      .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
      .mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useReducedMotion());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current).toBe(false);
  });
});
