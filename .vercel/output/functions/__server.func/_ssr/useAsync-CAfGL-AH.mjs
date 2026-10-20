import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { t as ApiError } from "./services-CvPNC9Rn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useAsync-CAfGL-AH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/** Runs an async loader on mount / when deps change; exposes retry. */
function useAsync(fn, deps) {
	const [data, setData] = (0, import_react.useState)();
	const [error, setError] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [tick, setTick] = (0, import_react.useState)(0);
	const fnRef = (0, import_react.useRef)(fn);
	fnRef.current = fn;
	(0, import_react.useEffect)(() => {
		let alive = true;
		setLoading(true);
		setError(null);
		fnRef.current().then((d) => alive && setData(d)).catch((e) => alive && setError(e instanceof ApiError ? e : new ApiError(String(e?.message ?? e)))).finally(() => alive && setLoading(false));
		return () => {
			alive = false;
		};
	}, [...deps, tick]);
	return {
		data,
		error,
		loading,
		reload: (0, import_react.useCallback)(() => setTick((t) => t + 1), []),
		setData
	};
}
//#endregion
export { useAsync as t };
