import { Ctx } from "./auth-context";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService } from "@/services";
import { onUnauthorized } from "@/services/http";
import type { Credentials, RegisterInput, User } from "@/types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    let alive = true;
    authService
      .me()
      .then((u) => alive && setUser(u))
      .catch(() => alive && setUser(null))
      .finally(() => alive && setInitializing(false));
    onUnauthorized(() => {
      setUser((prev) => {
        if (prev) setSessionExpired(true);
        return null;
      });
    });
    return () => {
      alive = false;
      onUnauthorized(null);
    };
  }, []);

  const login = useCallback(async (c: Credentials) => {
    const u = await authService.login(c);
    setUser(u);
    setSessionExpired(false);
    return u;
  }, []);
  const register = useCallback(async (r: RegisterInput) => {
    const u = await authService.register(r);
    setUser(u);
    return u;
  }, []);
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);
  const updateMe = useCallback(async (p: Partial<Pick<User, "first_name" | "last_name">>) => {
    const u = await authService.updateMe(p);
    setUser(u);
    return u;
  }, []);
  const startDemo = useMemo(
    () =>
      authService.startDemo
        ? async (asStaff: boolean) => {
            const u = await authService.startDemo!(asStaff);
            setUser(u);
            return u;
          }
        : undefined,
    [],
  );

  const value = useMemo(
    () => ({ user, initializing, login, register, logout, updateMe, startDemo, sessionExpired }),
    [user, initializing, login, register, logout, updateMe, startDemo, sessionExpired],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
