import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as useAuth } from "./auth-context-BA25qOws.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { o as Notice, t as Button } from "./States-B8bf-0Ix.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Field } from "./Field-RCNzBhE6.mjs";
import { s as isFixtureMode } from "./services-CvPNC9Rn.mjs";
import { t as Route } from "./register-TU1byYbC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/register-DEwKRlu6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RegisterPage() {
	const { register } = useAuth();
	const { redirect } = Route.useSearch();
	const navigate = useNavigate();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)(null);
	const [localErr, setLocalErr] = (0, import_react.useState)(null);
	async function submit(e) {
		e.preventDefault();
		if (busy) return;
		const fd = new FormData(e.currentTarget);
		const password = String(fd.get("password"));
		if (password !== String(fd.get("confirm"))) return setLocalErr("Passwords don't match.");
		if (!isFixtureMode && password.length < 8) return setLocalErr("Use at least 8 characters.");
		setLocalErr(null);
		setBusy(true);
		setErr(null);
		try {
			await register({
				email: String(fd.get("email")),
				password,
				first_name: String(fd.get("first_name")),
				last_name: String(fd.get("last_name"))
			});
			navigate({
				to: redirect ?? "/account",
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
				children: "Create account"
			}),
			isFixtureMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
					tone: "warn",
					children: "Demo mode: no account is created. Submitting starts a temporary demo session in this tab only. Your password is not stored or sent anywhere."
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "mt-8 space-y-4",
				children: [
					err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
						tone: "error",
						children: err.message
					}),
					localErr && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
						tone: "error",
						children: localErr
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "First name",
							name: "first_name",
							autoComplete: "given-name",
							required: true,
							errors: err?.fieldErrors["first_name"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Last name",
							name: "last_name",
							autoComplete: "family-name",
							errors: err?.fieldErrors["last_name"]
						})]
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
						autoComplete: "new-password",
						required: true,
						errors: err?.fieldErrors["password"],
						hint: "At least 8 characters."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Confirm password",
						name: "confirm",
						type: "password",
						autoComplete: "new-password",
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy,
						className: "h-10 w-full",
						children: busy ? "Creating…" : "Create account"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-6 text-sm text-muted-foreground",
				children: [
					"Already have one?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						search: { redirect },
						className: "text-foreground underline underline-offset-4",
						children: "Sign in"
					})
				]
			})
		]
	});
}
//#endregion
export { RegisterPage as component };
