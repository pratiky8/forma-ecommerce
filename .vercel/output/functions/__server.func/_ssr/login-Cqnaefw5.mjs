import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-Cqnaefw5.js
var $$splitComponentImporter = () => import("./login-lGBDBsGT.mjs");
var safeRedirect = (r) => typeof r === "string" && r.startsWith("/") && !r.startsWith("//") ? r : void 0;
var Route = createFileRoute("/login")({
	validateSearch: (s) => ({ redirect: safeRedirect(s["redirect"]) }),
	head: () => ({ meta: [
		{ title: "Sign in — Forma" },
		{
			name: "description",
			content: "Sign in to your Forma account."
		},
		{
			property: "og:title",
			content: "Sign in — Forma"
		},
		{
			property: "og:description",
			content: "Sign in to your Forma account."
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
