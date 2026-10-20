import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as LoadingState, o as Notice, r as ErrorState, t as Button } from "./States-B8bf-0Ix.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as productService } from "./services-CvPNC9Rn.mjs";
import { t as useAsync } from "./useAsync-CAfGL-AH.mjs";
import { r as formatINR } from "./format-DNjISxKy.mjs";
import { n as useCart } from "./cart-context-C8ImXUQS.mjs";
import { t as QuantityInput } from "./QuantityInput-DD_XxoXL.mjs";
import { n as ProductImage } from "./ProductCard-DHx6GOZd.mjs";
import { r as Route, t as DemoTag } from "./products._id-cUbu_Uki.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/products._id-BS66ucMx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductRoute() {
	const { id } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductPage, {}, id);
}
function ProductPage() {
	const { id } = Route.useParams();
	const { data: p, error, loading, reload } = useAsync(() => productService.get(id), [id]);
	const { add, pending, canUseCart } = useCart();
	const navigate = useNavigate();
	const [qty, setQty] = (0, import_react.useState)(1);
	const [img, setImg] = (0, import_react.useState)(0);
	const [msg, setMsg] = (0, import_react.useState)(null);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, { label: "Loading product…" });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		error,
		onRetry: error.status === 404 ? void 0 : reload,
		title: error.status === 404 ? "Product not found" : "Couldn't load product"
	});
	if (!p) return null;
	const busy = pending.has(`p${p.id}`);
	const out = p.stock <= 0;
	async function onAdd() {
		if (!p) return;
		if (!canUseCart) {
			navigate({
				to: "/login",
				search: { redirect: `/products/${p.id}` }
			});
			return;
		}
		setMsg(null);
		try {
			await add(p.id, qty);
			setMsg({
				tone: "info",
				text: `Added ${qty} × ${p.name} to your cart.`
			});
		} catch (e) {
			setMsg({
				tone: "error",
				text: e.message
			});
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-page py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			"aria-label": "Breadcrumb",
			className: "text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/products",
				search: {},
				children: "Shop"
			}), p.category && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				" ",
				"/",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/products",
					search: { category: p.category.slug },
					children: p.category.name
				})
			] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-10 md:grid-cols-2 lg:gap-16",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductImage, {
				src: p.images[img],
				alt: p.name
			}), p.images.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex gap-3",
				role: "group",
				"aria-label": "Product images",
				children: p.images.map((src, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": `Show image ${i + 1}`,
					"aria-pressed": img === i,
					onClick: () => setImg(i),
					className: `w-20 rounded-md border-2 ${img === i ? "border-primary" : "border-transparent"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductImage, {
						src,
						alt: ""
					})
				}, i))
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md:pt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: p.category?.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoTag, {})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-5xl",
						children: p.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-2xl tabular-nums",
						children: formatINR(p.price)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Inclusive of taxes. Final price confirmed at checkout."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 max-w-prose leading-relaxed text-muted-foreground",
						children: p.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-6 text-sm ${out ? "text-destructive" : p.stock < 5 ? "text-primary" : "text-success"}`,
						children: out ? "Out of stock" : p.stock < 5 ? `Only ${p.stock} left` : "In stock"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuantityInput, {
							value: qty,
							onChange: setQty,
							max: Math.max(1, p.stock),
							disabled: out || busy
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							onClick: onAdd,
							disabled: out || busy,
							className: "h-10",
							children: busy ? "Adding…" : out ? "Sold out" : canUseCart ? "Add to cart" : "Sign in to add"
						})]
					}),
					msg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Notice, {
							tone: msg.tone,
							children: [
								msg.text,
								" ",
								msg.tone === "info" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/cart",
									className: "underline underline-offset-4",
									children: "View cart"
								})
							]
						})
					})
				]
			})]
		})]
	});
}
//#endregion
export { ProductRoute as component };
