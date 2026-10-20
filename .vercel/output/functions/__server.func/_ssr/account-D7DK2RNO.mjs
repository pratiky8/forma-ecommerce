import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link, g as Outlet } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as RequireAuth } from "./Guards-CbO70F1T.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-D7DK2RNO.js
var import_jsx_runtime = require_jsx_runtime();
function AccountLayout() {
	const cls = "rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent data-[status=active]:bg-accent data-[status=active]:text-foreground";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-page py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-5xl",
				children: "Account"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				"aria-label": "Account",
				className: "mt-6 flex gap-2 border-b pb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/account",
					activeOptions: { exact: true },
					className: cls,
					children: "Profile"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/account/orders",
					className: cls,
					children: "Orders"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
			})
		]
	}) });
}
//#endregion
export { AccountLayout as component };
