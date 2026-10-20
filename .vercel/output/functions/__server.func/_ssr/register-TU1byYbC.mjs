import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/register-TU1byYbC.js
var $$splitComponentImporter = () => import("./register-DEwKRlu6.mjs");
var Route = createFileRoute("/register")({
	validateSearch: (s) => ({ redirect: typeof s["redirect"] === "string" && s["redirect"].startsWith("/") && !s["redirect"].startsWith("//") ? s["redirect"] : void 0 }),
	head: () => ({ meta: [
		{ title: "Create account — Forma" },
		{
			name: "description",
			content: "Create a Forma account to save your cart and orders."
		},
		{
			property: "og:title",
			content: "Create account — Forma"
		},
		{
			property: "og:description",
			content: "Create a Forma account to save your cart and orders."
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
export { Route as t };
