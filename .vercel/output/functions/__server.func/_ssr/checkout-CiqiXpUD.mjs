import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as LoadingState, n as EmptyState, o as Notice, r as ErrorState, t as Button } from "./States-B8bf-0Ix.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as RequireAuth } from "./Guards-CbO70F1T.mjs";
import { t as Field } from "./Field-RCNzBhE6.mjs";
import { l as orderService, n as BackendRequiredError, s as isFixtureMode } from "./services-CvPNC9Rn.mjs";
import { r as formatINR } from "./format-DNjISxKy.mjs";
import { t as Totals } from "./OrderSummary-CaTisS6b.mjs";
import { n as useCart } from "./cart-context-C8ImXUQS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checkout-CiqiXpUD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PAYMENTS = [
	{
		value: "upi",
		label: "UPI",
		note: "You'll be redirected to the payment provider by the server."
	},
	{
		value: "card",
		label: "Card",
		note: "Handled by the server's payment provider. Card details are never entered here."
	},
	{
		value: "cod",
		label: "Cash on delivery",
		note: "Pay when your order arrives."
	}
];
function Checkout() {
	const { cart, loading, error, refresh } = useCart();
	const navigate = useNavigate();
	const [payment, setPayment] = (0, import_react.useState)("upi");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)(null);
	const ref = (0, import_react.useRef)(crypto.randomUUID());
	if (loading && !cart) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, { label: "Loading checkout…" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		error,
		onRetry: refresh
	});
	if (!cart?.items.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Nothing to check out",
		body: "Your cart is empty.",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/products",
			search: {},
			className: "rounded-md bg-ink px-4 py-2 text-sm text-ink-foreground",
			children: "Browse products"
		})
	});
	async function submit(e) {
		e.preventDefault();
		if (submitting) return;
		const fd = new FormData(e.currentTarget);
		const address = {
			full_name: String(fd.get("full_name")).trim(),
			phone: String(fd.get("phone")).trim(),
			line1: String(fd.get("line1")).trim(),
			line2: String(fd.get("line2") ?? "").trim(),
			city: String(fd.get("city")).trim(),
			state: String(fd.get("state")).trim(),
			postal_code: String(fd.get("postal_code")).trim(),
			country: "IN"
		};
		setSubmitting(true);
		setErr(null);
		try {
			const order = await orderService.create({
				shipping_address: address,
				payment_method: payment,
				client_reference: ref.current
			});
			await refresh();
			navigate({
				to: "/account/orders/$id",
				params: { id: String(order.id) },
				search: { placed: true }
			});
		} catch (e) {
			setErr(e);
			if (e.status === 409 || e.status === 400) refresh();
		} finally {
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-page py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-5xl",
				children: "Checkout"
			}),
			isFixtureMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Notice, {
					tone: "warn",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Demo mode:" }), " you can fill in this form, but orders can't be placed and no payment is taken. Placing an order requires the Django backend."]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "mt-8 grid gap-12 lg:grid-cols-[1fr_360px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "space-y-4",
						disabled: submitting,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "text-2xl font-display",
							children: "Shipping address"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Full name",
									name: "full_name",
									autoComplete: "name",
									required: true,
									errors: err?.fieldErrors["shipping_address.full_name"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Phone",
									name: "phone",
									type: "tel",
									autoComplete: "tel",
									required: true,
									pattern: "[0-9+ ]{10,15}",
									title: "10–15 digits"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Address line 1",
									name: "line1",
									autoComplete: "address-line1",
									required: true,
									className: "sm:col-span-2"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Address line 2",
									name: "line2",
									autoComplete: "address-line2",
									className: "sm:col-span-2"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "City",
									name: "city",
									autoComplete: "address-level2",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "State",
									name: "state",
									autoComplete: "address-level1",
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "PIN code",
									name: "postal_code",
									autoComplete: "postal-code",
									required: true,
									inputMode: "numeric",
									pattern: "[0-9]{6}",
									title: "6-digit PIN code"
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						disabled: submitting,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "font-display text-2xl",
							children: "Payment"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 space-y-2",
							children: PAYMENTS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: `flex cursor-pointer gap-3 rounded-md border p-4 ${payment === p.value ? "border-primary bg-card" : ""}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "radio",
									name: "payment",
									value: p.value,
									checked: payment === p.value,
									onChange: () => setPayment(p.value),
									className: "mt-1 accent-[var(--primary)]"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-sm font-medium",
									children: p.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: p.note
								})] })]
							}, p.value))
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					"aria-label": "Order summary",
					className: "h-fit rounded-md bg-surface p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl",
							children: "Summary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 space-y-2 text-sm",
							children: cart.items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									i.product.name,
									" × ",
									i.quantity
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums",
									children: formatINR(i.line_total)
								})]
							}, i.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 border-t pt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Totals, {
								...cart,
								estimate: cart.totals_are_estimates
							})
						}),
						err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
								tone: err instanceof BackendRequiredError ? "warn" : "error",
								children: err.message
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: submitting,
							className: "mt-6 h-11 w-full",
							children: submitting ? "Placing order…" : "Place order"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-xs text-muted-foreground",
							children: "The server confirms the final total, stock and payment. Nothing is charged by this page."
						})
					]
				})]
			})
		]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkout, {}) });
//#endregion
export { SplitComponent as component };
