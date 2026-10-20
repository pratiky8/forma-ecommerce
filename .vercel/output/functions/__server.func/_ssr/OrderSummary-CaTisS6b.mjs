import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { r as formatINR } from "./format-DNjISxKy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/OrderSummary-CaTisS6b.js
var import_jsx_runtime = require_jsx_runtime();
function Totals({ subtotal, shipping, tax, total, estimate }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
		className: "space-y-2 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-muted-foreground",
					children: "Subtotal"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "tabular-nums",
					children: formatINR(subtotal)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-muted-foreground",
					children: "Shipping"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "tabular-nums",
					children: shipping === 0 ? "Free" : formatINR(shipping)
				})]
			}),
			tax > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-muted-foreground",
					children: "Tax"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "tabular-nums",
					children: formatINR(tax)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between border-t pt-3 text-base font-medium",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "tabular-nums",
					children: formatINR(total)
				})]
			}),
			estimate && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pt-1 text-xs text-muted-foreground",
				children: "Demo estimate computed in the browser. In live mode totals come from the server."
			})
		]
	});
}
//#endregion
export { Totals as t };
