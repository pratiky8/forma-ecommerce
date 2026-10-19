import { useEffect, useRef, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/auth-context";
import { EmptyState, LoadingState } from "./States";

/** UI gate only. The backend must still authenticate every request. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirected = useRef(false);
  useEffect(() => {
    // Redirect once; location changes during the transition must not re-trigger (avoids redirect loops).
    if (initializing || user || redirected.current || location.pathname === "/login") return;
    redirected.current = true;
    navigate({ to: "/login", search: { redirect: location.href }, replace: true });
  }, [initializing, user, navigate, location.href, location.pathname]);
  useEffect(() => {
    if (user) redirected.current = false;
  }, [user]);
  if (initializing || !user) return <LoadingState label="Checking your session…" />;
  return <>{children}</>;
}

/** UI gate only. Staff endpoints must enforce IsAdminUser server-side. */
export function RequireStaff({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <RequireAuth>
      {user?.is_staff ? (
        children
      ) : (
        <EmptyState
          title="Staff only"
          body="This area is restricted to staff accounts."
          action={
            <Link to="/" className="text-sm underline underline-offset-4">
              Back to the shop
            </Link>
          }
        />
      )}
    </RequireAuth>
  );
}
