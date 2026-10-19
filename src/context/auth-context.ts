import { createContext, useContext } from "react";
import type { Credentials, RegisterInput, User } from "@/types";

interface AuthCtx {
  user: User | null;
  /** true until the initial session check finishes */
  initializing: boolean;
  login(c: Credentials): Promise<User>;
  register(r: RegisterInput): Promise<User>;
  startDemo: ((asStaff: boolean) => Promise<User>) | undefined;
  logout(): Promise<void>;
  updateMe(p: Partial<Pick<User, "first_name" | "last_name">>): Promise<User>;
  sessionExpired: boolean;
}

// Keep one context instance across hot reloads so providers and consumers always match.
const g = globalThis as { __formaAuthCtx?: ReturnType<typeof createContext<AuthCtx | null>> };
export const Ctx = (g.__formaAuthCtx ??= createContext<AuthCtx | null>(null));

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
