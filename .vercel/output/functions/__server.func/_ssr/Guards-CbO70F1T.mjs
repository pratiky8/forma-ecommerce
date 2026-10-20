import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as useAuth } from "./auth-context-BA25qOws.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as LoadingState, n as EmptyState } from "./States-B8bf-0Ix.mjs";
import { b as Link, p as useLocation, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Guards-CbO70F1T.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** UI gate only. The backend must still authenticate every request. */
function RequireAuth({ children }) {
	const { user, initializing } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const redirected = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (initializing || user || redirected.current || location.pathname === "/login") return;
		redirected.current = true;
		navigate({
			to: "/login",
			search: { redirect: location.href },
			replace: true
		});
	}, [
		initializing,
		user,
		navigate,
		location.href,
		location.pathname
	]);
	(0, import_react.useEffect)(() => {
		if (user) redirected.current = false;
	}, [user]);
	if (initializing || !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, { label: "Checking your session…" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
/** UI gate only. Staff endpoints must enforce IsAdminUser server-side. */
function RequireStaff({ children }) {
	const { user } = useAuth();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: user?.is_staff ? children : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Staff only",
		body: "This area is restricted to staff accounts.",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "text-sm underline underline-offset-4",
			children: "Back to the shop"
		})
	}) });
}
//#endregion
export { RequireStaff as n, RequireAuth as t };
