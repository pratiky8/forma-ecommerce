import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cart-context-C8ImXUQS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var g = globalThis;
var Ctx = g.__formaCartCtx ??= (0, import_react.createContext)(null);
function useCart() {
	const v = (0, import_react.useContext)(Ctx);
	if (!v) throw new Error("useCart must be used inside CartProvider");
	return v;
}
//#endregion
export { useCart as n, Ctx as t };
