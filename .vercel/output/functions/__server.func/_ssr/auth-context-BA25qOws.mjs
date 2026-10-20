import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-context-BA25qOws.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var g = globalThis;
var Ctx = g.__formaAuthCtx ??= (0, import_react.createContext)(null);
function useAuth() {
	const v = (0, import_react.useContext)(Ctx);
	if (!v) throw new Error("useAuth must be used inside AuthProvider");
	return v;
}
//#endregion
export { useAuth as n, Ctx as t };
