import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as LoadingState, o as Notice, r as ErrorState } from "./States-B8bf-0Ix.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as orderService } from "./services-CvPNC9Rn.mjs";
import { t as Route } from "./account.orders._id-D1Lh3IWD.mjs";
import { t as useAsync } from "./useAsync-CAfGL-AH.mjs";
import { n as formatDate, r as formatINR } from "./format-DNjISxKy.mjs";
import { n as StatusBadge, t as ExampleBadge } from "./StatusBadge-Ck4ffkaG.mjs";
import { t as Totals } from "./OrderSummary-CaTisS6b.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account.orders._id-yNfLWYW1.js
var import_jsx_runtime = require_jsx_runtime();
var PAY_LABEL = {
	upi: "UPI",
	card: "Card",
	cod: "Cash on delivery"
};
function OrderDetail() {
	const { id } = Route.useParams();
	const { placed } = Route.useSearch();
	const { data: o, error, loading, reload } = useAsync(() => orderService.get(id), [id]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, { label: "Loading order…" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		error,
		onRetry: error.status === 404 ? void 0 : reload,
		title: error.status === 404 ? "Order not found" : "Couldn't load order"
	});
	if (!o) return null;
	const a = o.shipping_address;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/account/orders",
			className: "text-sm text-muted-foreground",
			children: "← All orders"
		}),
		placed && !o.is_example && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, { children: "Order confirmed by the server." })
		}),
		o.is_example && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
				tone: "warn",
				children: "Example order from development fixtures — not a real order, and no payment was taken."
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-wrap items-center gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-4xl",
					children: ["Order #", o.number]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: o.status }),
				o.is_example && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExampleBadge, {})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: [
				"Placed ",
				formatDate(o.created_at),
				" · Payment: ",
				PAY_LABEL[o.payment_method],
				" (",
				o.payment_status,
				")"
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 grid gap-10 lg:grid-cols-[1fr_320px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y border-y",
				children: o.items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between py-4 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						i.product_name,
						" × ",
						i.quantity
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: formatINR(i.line_total)
					})]
				}, i.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-md bg-surface p-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Totals, { ...o })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Ship to"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("address", {
						className: "mt-2 not-italic leading-relaxed",
						children: [
							a.full_name,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							a.line1,
							a.line2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [", ", a.line2] }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							a.city,
							", ",
							a.state,
							" ",
							a.postal_code,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							a.phone
						]
					})]
				})]
			})]
		})
	] });
}
//#endregion
export { OrderDetail as component };
