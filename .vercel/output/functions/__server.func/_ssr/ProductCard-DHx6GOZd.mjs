import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as formatINR } from "./format-DNjISxKy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ProductCard-DHx6GOZd.js
var import_jsx_runtime = require_jsx_runtime();
function ProductImage({ src, alt, className = "" }) {
	return src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src,
		alt,
		loading: "lazy",
		width: 816,
		height: 816,
		className: `aspect-square w-full rounded-md bg-surface object-cover ${className}`
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `flex aspect-square w-full items-center justify-center rounded-md bg-surface text-xs text-muted-foreground ${className}`,
		children: "No image"
	});
}
function ProductCard({ product }) {
	const out = product.stock <= 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
		className: "group",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/products/$id",
			params: { id: String(product.id) },
			className: "block rounded-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductImage, {
					src: product.images[0],
					alt: product.name,
					className: "transition-opacity group-hover:opacity-90"
				}), out && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute left-3 top-3 rounded-sm bg-background px-2 py-1 text-[11px] uppercase tracking-wider",
					children: "Sold out"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-sans text-sm font-medium",
					children: product.name
				}), product.category && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-xs text-muted-foreground",
					children: product.category.name
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm tabular-nums",
					children: formatINR(product.price)
				})]
			})]
		})
	});
}
//#endregion
export { ProductImage as n, ProductCard as t };
