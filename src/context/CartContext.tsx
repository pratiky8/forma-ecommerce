import { Ctx, type CartCtx } from "./cart-context";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { cartService, isFixtureMode } from "@/services";
import { ApiError } from "@/services/http";
import type { Cart } from "@/types";
import { useAuth } from "./auth-context";

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();
  const canUseCart = isFixtureMode || !!user;
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [pending, setPending] = useState<Set<number | string>>(new Set());

  const refresh = useCallback(async () => {
    if (!canUseCart) {
      setCart(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setCart(await cartService.get());
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setLoading(false);
    }
  }, [canUseCart]);

  useEffect(() => {
    if (!initializing) void refresh();
  }, [initializing, refresh]);

  const withPending = useCallback(
    async (key: number | string, op: () => Promise<Cart>) => {
      if (!canUseCart) throw new ApiError("Please sign in to use your cart.", { status: 401 });
      setPending((s) => new Set(s).add(key));
      try {
        setCart(await op()); // always replace with the server (or adapter) cart — never patch totals locally
      } finally {
        setPending((s) => {
          const n = new Set(s);
          n.delete(key);
          return n;
        });
      }
    },
    [canUseCart],
  );

  const value = useMemo<CartCtx>(
    () => ({
      cart,
      loading,
      error,
      canUseCart,
      pending,
      refresh,
      add: (pid, q) => withPending(`p${pid}`, () => cartService.add(pid, q)),
      update: (id, q) => withPending(id, () => cartService.update(id, q)),
      remove: (id) => withPending(id, () => cartService.remove(id)),
    }),
    [cart, loading, error, canUseCart, pending, refresh, withPending],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
