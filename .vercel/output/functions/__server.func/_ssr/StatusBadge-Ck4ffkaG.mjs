import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as ORDER_STATUS_LABEL } from "./format-DNjISxKy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/StatusBadge-Ck4ffkaG.js
var import_jsx_runtime = require_jsx_runtime();
function StatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-flex rounded-sm px-2 py-0.5 text-xs font-medium ${status === "cancelled" || status === "refunded" ? "bg-destructive/10 text-destructive" : status === "delivered" || status === "paid" ? "bg-success/10 text-success" : "bg-accent text-accent-foreground"}`,
		children: ORDER_STATUS_LABEL[status] ?? status
	});
}
function ExampleBadge() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex rounded-sm border border-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary",
		children: "Example — not a real order"
	});
}
//#endregion
export { StatusBadge as n, ExampleBadge as t };
