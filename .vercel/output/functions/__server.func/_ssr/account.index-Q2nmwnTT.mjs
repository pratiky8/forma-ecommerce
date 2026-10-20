import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as useAuth } from "./auth-context-BA25qOws.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { o as Notice, t as Button } from "./States-B8bf-0Ix.mjs";
import { t as Field } from "./Field-RCNzBhE6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account.index-Q2nmwnTT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Profile() {
	const { user, updateMe } = useAuth();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [msg, setMsg] = (0, import_react.useState)(null);
	if (!user) return null;
	async function submit(e) {
		e.preventDefault();
		if (busy) return;
		const fd = new FormData(e.currentTarget);
		setBusy(true);
		setMsg(null);
		try {
			await updateMe({
				first_name: String(fd.get("first_name")),
				last_name: String(fd.get("last_name"))
			});
			setMsg({
				tone: "info",
				text: user?.is_demo ? "Updated for this demo session only." : "Profile saved."
			});
		} catch (e) {
			setMsg({
				tone: "error",
				text: e.message
			});
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-md",
		children: [user.is_demo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
				tone: "warn",
				children: "This is a temporary demo session, not a real account. It ends when you close the tab or sign out."
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "First name",
						name: "first_name",
						defaultValue: user.first_name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Last name",
						name: "last_name",
						defaultValue: user.last_name
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Email",
					name: "email",
					defaultValue: user.email,
					disabled: true,
					hint: "Contact support to change your email."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: ["Role: ", user.is_staff ? "Staff" : "Customer"]
				}),
				msg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
					tone: msg.tone,
					children: msg.text
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: busy,
					children: busy ? "Saving…" : "Save profile"
				})
			]
		})]
	});
}
//#endregion
export { Profile as component };
