import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as useAuth } from "./auth-context-BA25qOws.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { o as Notice, t as Button } from "./States-B8bf-0Ix.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Field } from "./Field-RCNzBhE6.mjs";
import { s as isFixtureMode } from "./services-CvPNC9Rn.mjs";
import { t as Route } from "./login-Cqnaefw5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-lGBDBsGT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const { login, startDemo, sessionExpired, user } = useAuth();
	const { redirect } = Route.useSearch();
	const navigate = useNavigate();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)(null);
	const go = () => navigate({
		to: redirect ?? "/account",
		replace: true
	});
	async function submit(e) {
		e.preventDefault();
		if (busy) return;
		const fd = new FormData(e.currentTarget);
		setBusy(true);
		setErr(null);
		try {
			await login({
				email: String(fd.get("email")),
				password: String(fd.get("password"))
			});
			go();
		} catch (e) {
			setErr(e);
		} finally {
			setBusy(false);
		}
	}
	async function demo(staff) {
		if (!startDemo || busy) return;
		setBusy(true);
		setErr(null);
		try {
			await startDemo(staff);
			await navigate({
				to: staff ? "/admin" : redirect ?? "/account",
				replace: true
			});
		} catch (e) {
			setErr(e);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-page max-w-md py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-5xl",
				children: "Sign in"
			}),
			sessionExpired && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
					tone: "warn",
					children: "Your session expired. Please sign in again."
				})
			}),
			user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Notice, { children: [
					"You're signed in as ",
					user.email,
					".",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/account",
						className: "underline",
						children: "Go to account"
					})
				] })
			}),
			isFixtureMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-md border border-primary/30 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Demo mode"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "No real accounts exist. A demo session is temporary, held only in this tab, and is not real authentication. Passwords are ignored and never stored."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							disabled: busy,
							onClick: () => demo(false),
							children: "Start demo shopper session"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							disabled: busy,
							onClick: () => demo(true),
							children: "Start demo staff session"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "mt-8 space-y-4",
				noValidate: false,
				children: [
					err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
						tone: "error",
						children: err.message
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Email",
						name: "email",
						type: "email",
						autoComplete: "email",
						required: true,
						errors: err?.fieldErrors["email"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Password",
						name: "password",
						type: "password",
						autoComplete: "current-password",
						required: true,
						minLength: isFixtureMode ? 0 : 1,
						errors: err?.fieldErrors["password"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy,
						className: "h-10 w-full",
						children: busy ? "Signing in…" : isFixtureMode ? "Sign in (demo session)" : "Sign in"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-6 text-sm text-muted-foreground",
				children: [
					"New here?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/register",
						search: { redirect },
						className: "text-foreground underline underline-offset-4",
						children: "Create an account"
					})
				]
			})
		]
	});
}
//#endregion
export { LoginPage as component };
