import { createContext, useContext } from "react";
import type { Cart } from "@/types";
import type { ApiError } from "@/services/http";

export interface CartCtx {
  cart: Cart | null;
  loading: boolean;
  error: ApiError | null;
  /** live mode requires a signed-in user; fixture mode works anonymously */
  canUseCart: boolean;
  pending: Set<number | string>;
  refresh(): Promise<void>;
  add(productId: number, qty: number): Promise<void>;
  update(itemId: number, qty: number): Promise<void>;
  remove(itemId: number): Promise<void>;
}

const g = globalThis as { __formaCartCtx?: ReturnType<typeof createContext<CartCtx | null>> };
export const Ctx = (g.__formaCartCtx ??= createContext<CartCtx | null>(null));

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used inside CartProvider");
  return v;
}
