import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/products.index-DLmYIm2K.js
var ORDERINGS = [
	{
		value: "",
		label: "Recommended"
	},
	{
		value: "price",
		label: "Price: low to high"
	},
	{
		value: "-price",
		label: "Price: high to low"
	},
	{
		value: "name",
		label: "Name: A–Z"
	},
	{
		value: "-created_at",
		label: "Newest"
	}
];
var toNum = (v) => {
	const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
	return Number.isFinite(n) && n >= 0 ? n : void 0;
};
var $$splitComponentImporter = () => import("./products.index-DHgivfQR.mjs");
var Route = createFileRoute("/products/")({
	validateSearch: (s) => ({
		search: typeof s["search"] === "string" && s["search"] ? s["search"] : void 0,
		category: typeof s["category"] === "string" && s["category"] ? s["category"] : void 0,
		min_price: toNum(s["min_price"]),
		max_price: toNum(s["max_price"]),
		ordering: ORDERINGS.some((o) => o.value === s["ordering"]) && s["ordering"] ? s["ordering"] : void 0,
		page: toNum(s["page"]) && toNum(s["page"]) >= 1 ? Math.floor(toNum(s["page"])) : void 0
	}),
	head: () => ({ meta: [
		{ title: "Shop all — Forma" },
		{
			name: "description",
			content: "Browse home, tech, carry and accessories at Forma. Filter by category and price."
		},
		{
			property: "og:title",
			content: "Shop all — Forma"
		},
		{
			property: "og:description",
			content: "Browse home, tech, carry and accessories at Forma."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as n, toNum as r, ORDERINGS as t };
