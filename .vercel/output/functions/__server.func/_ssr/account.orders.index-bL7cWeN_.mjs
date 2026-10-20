import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as LoadingState, n as EmptyState, o as Notice, r as ErrorState } from "./States-B8bf-0Ix.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as orderService, s as isFixtureMode } from "./services-CvPNC9Rn.mjs";
import { t as useAsync } from "./useAsync-CAfGL-AH.mjs";
import { n as formatDate, r as formatINR } from "./format-DNjISxKy.mjs";
import { n as StatusBadge, t as ExampleBadge } from "./StatusBadge-Ck4ffkaG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account.orders.index-bL7cWeN_.js
var import_jsx_runtime = require_jsx_runtime();
function Orders() {
	const { data, error, loading, reload } = useAsync(() => orderService.list(), []);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, { label: "Loading orders…" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		error,
		onRetry: reload,
		title: "Couldn't load orders"
	});
	if (!data?.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "No orders yet",
		body: "When you place an order it will appear here.",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/products",
			search: {},
			className: "rounded-md bg-ink px-4 py-2 text-sm text-ink-foreground",
			children: "Start shopping"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [isFixtureMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mb-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
			tone: "warn",
			children: "These rows are illustrative examples from development fixtures. They are not real orders."
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "divide-y border-y",
		children: data.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/account/orders/$id",
			params: { id: String(o.id) },
			search: {},
			className: "flex flex-wrap items-center justify-between gap-3 py-5 hover:bg-card",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-medium",
				children: [
					"#",
					o.number,
					" ",
					o.is_example && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExampleBadge, {})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					formatDate(o.created_at),
					" · ",
					o.items.length,
					" item",
					o.items.length === 1 ? "" : "s"
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: o.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular-nums",
					children: formatINR(o.total)
				})]
			})]
		}) }, o.id))
	})] });
}
//#endregion
export { Orders as component };
