import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as LoadingState, n as EmptyState, r as ErrorState } from "./States-B8bf-0Ix.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as formatINR } from "./format-DNjISxKy.mjs";
import { t as Totals } from "./OrderSummary-CaTisS6b.mjs";
import { n as useCart } from "./cart-context-C8ImXUQS.mjs";
import { t as QuantityInput } from "./QuantityInput-DD_XxoXL.mjs";
import { n as ProductImage } from "./ProductCard-DHx6GOZd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cart-BtuWNonB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CartItem({ item }) {
	const { update, remove, pending } = useCart();
	const [err, setErr] = (0, import_react.useState)(null);
	const busy = pending.has(item.id);
	async function run(op) {
		setErr(null);
		try {
			await op();
		} catch (e) {
			setErr(e.message);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex gap-4 border-b py-6 sm:gap-6",
		"aria-busy": busy,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/products/$id",
			params: { id: String(item.product.id) },
			className: "w-24 shrink-0 sm:w-28",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductImage, {
				src: item.product.images[0],
				alt: item.product.name
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/products/$id",
							params: { id: String(item.product.id) },
							className: "font-medium",
							children: item.product.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [formatINR(item.unit_price), " each"]
						}),
						item.product.stock < 5 && item.product.stock > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-primary",
							children: [
								"Only ",
								item.product.stock,
								" left"
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "tabular-nums",
						children: formatINR(item.line_total)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuantityInput, {
							label: `Quantity for ${item.product.name}`,
							value: item.quantity,
							max: item.product.stock,
							disabled: busy || item.product.stock <= 0,
							onChange: (q) => q !== item.quantity && run(() => update(item.id, q))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy,
							onClick: () => run(() => remove(item.id)),
							className: "text-sm text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50",
							children: "Remove"
						}),
						busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							role: "status",
							children: "Updating…"
						})
					]
				}),
				err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "text-sm text-destructive",
					children: err
				})
			]
		})]
	});
}
function CartPage() {
	const { cart, loading, error, refresh, canUseCart, pending } = useCart();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-page py-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-5xl",
			children: "Cart"
		}), !canUseCart ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Sign in to see your cart",
			body: "Your cart is saved to your account.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				search: { redirect: "/cart" },
				className: "rounded-md bg-ink px-4 py-2 text-sm text-ink-foreground",
				children: "Sign in"
			})
		}) : loading && !cart ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, { label: "Loading cart…" }) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
			error,
			onRetry: refresh,
			title: "Couldn't load your cart"
		}) : !cart?.items.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Your cart is empty",
			body: "Start with something you'll use every day.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/products",
				search: {},
				className: "rounded-md bg-ink px-4 py-2 text-sm text-ink-foreground",
				children: "Browse products"
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 grid gap-12 lg:grid-cols-[1fr_340px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				"aria-label": "Cart items",
				className: "border-t",
				children: cart.items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartItem, { item: i }, i.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				"aria-label": "Order summary",
				className: "h-fit rounded-md bg-surface p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl",
						children: "Summary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Totals, {
							...cart,
							estimate: cart.totals_are_estimates
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/checkout",
						"aria-disabled": pending.size > 0,
						className: `mt-6 block rounded-md bg-ink px-4 py-3 text-center text-sm text-ink-foreground ${pending.size > 0 ? "pointer-events-none opacity-50" : ""}`,
						children: "Continue to checkout"
					})
				]
			})]
		})]
	});
}
//#endregion
export { CartPage as component };
