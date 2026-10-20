import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as isFixtureMode } from "./services-CvPNC9Rn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/products._id-cUbu_Uki.js
var import_jsx_runtime = require_jsx_runtime();
/** Thin, always-visible strip while fixture mode is active. */
function ModeBanner() {
	if (!isFixtureMode) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "bg-ink text-ink-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "container-page py-1.5 text-center text-xs tracking-wide",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mr-2 rounded-sm bg-primary px-1.5 py-0.5 font-medium text-primary-foreground",
				children: "DEMO"
			}), "Development fixtures — no real backend, orders or payments. Connect Django to go live."]
		})
	});
}
function DemoTag({ children = "Demo data" }) {
	if (!isFixtureMode) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex items-center rounded-sm border border-primary/40 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary",
		children
	});
}
var $$splitComponentImporter = () => import("./products._id-BS66ucMx.mjs");
var Route = createFileRoute("/products/$id")({
	head: () => ({ meta: [
		{ title: "Product — Forma" },
		{
			name: "description",
			content: "Product details, stock and pricing at Forma."
		},
		{
			property: "og:title",
			content: "Product — Forma"
		},
		{
			property: "og:description",
			content: "Product details, stock and pricing at Forma."
		},
		{
			property: "og:type",
			content: "product"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { ModeBanner as n, Route as r, DemoTag as t };
