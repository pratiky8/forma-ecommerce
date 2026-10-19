import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuantityInput } from "@/components/QuantityInput";

afterEach(cleanup);

describe("QuantityInput", () => {
  it("rejects partial, fractional and non-finite quantities", () => {
    const onChange = vi.fn();
    render(<QuantityInput value={2} max={5} onChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Quantity" });
    for (const value of ["2abc", "2.5", "Infinity", "1e999", "", " "]) {
      fireEvent.change(input, { target: { value } });
    }
    expect(onChange).not.toHaveBeenCalled();
  });

  it("accepts whole quantities and clamps them to available stock", () => {
    const onChange = vi.fn();
    render(<QuantityInput value={2} max={5} onChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Quantity" });
    fireEvent.change(input, { target: { value: "4" } });
    expect(onChange).toHaveBeenLastCalledWith(4);
    fireEvent.change(input, { target: { value: "99" } });
    expect(onChange).toHaveBeenLastCalledWith(5);
    fireEvent.change(input, { target: { value: "0" } });
    expect(onChange).toHaveBeenLastCalledWith(1);
  });
});
