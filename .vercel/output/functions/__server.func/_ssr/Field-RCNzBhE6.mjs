import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Field-RCNzBhE6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Field({ label, errors, hint, className = "", ...props }) {
	const id = (0, import_react.useId)();
	const errId = `${id}-err`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				htmlFor: id,
				className: "text-sm font-medium",
				children: [label, props.required && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					"aria-hidden": true,
					className: "text-primary",
					children: [" ", "*"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id,
				"aria-invalid": errors?.length ? true : void 0,
				"aria-describedby": errors?.length ? errId : void 0,
				className: "mt-1.5 h-10 w-full rounded-md border border-input bg-card px-3 text-sm aria-[invalid=true]:border-destructive",
				...props
			}),
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: hint
			}),
			errors?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: errId,
				className: "mt-1 text-xs text-destructive",
				children: errors.join(" ")
			}) : null
		]
	});
}
//#endregion
export { Field as t };
