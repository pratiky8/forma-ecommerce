import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account.orders._id-D1Lh3IWD.js
var $$splitComponentImporter = () => import("./account.orders._id-yNfLWYW1.mjs");
var Route = createFileRoute("/account/orders/$id")({
	validateSearch: (s) => ({ placed: s["placed"] === true || s["placed"] === "true" ? true : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
