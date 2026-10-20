import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { o as Plus, s as Minus } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/QuantityInput-DD_XxoXL.js
var import_jsx_runtime = require_jsx_runtime();
function QuantityInput({ value, onChange, min = 1, max, disabled, label = "Quantity" }) {
	const clamp = (n) => Math.max(min, max != null ? Math.min(max, n) : n);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "group",
		"aria-label": label,
		className: "inline-flex h-10 items-center rounded-md border border-input bg-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Decrease quantity",
				className: "flex h-full w-10 items-center justify-center disabled:opacity-40",
				disabled: disabled || value <= min,
				onClick: () => onChange(clamp(value - 1)),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-3.5 w-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				"aria-label": label,
				inputMode: "numeric",
				className: "h-full w-10 bg-transparent text-center text-sm tabular-nums",
				value,
				disabled,
				onChange: (e) => {
					const text = e.target.value.trim();
					const n = Number(text);
					if (text && Number.isSafeInteger(n)) onChange(clamp(n));
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Increase quantity",
				className: "flex h-full w-10 items-center justify-center disabled:opacity-40",
				disabled: disabled || max != null && value >= max,
				onClick: () => onChange(clamp(value + 1)),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" })
			})
		]
	});
}
//#endregion
export { QuantityInput as t };
