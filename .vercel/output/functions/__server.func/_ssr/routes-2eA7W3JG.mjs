import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { i as GridSkeleton, n as EmptyState, r as ErrorState } from "./States-B8bf-0Ix.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as p_earbuds_default, f as p_mug_default, m as productService, p as p_wallet_default, u as p_backpack_default } from "./services-CvPNC9Rn.mjs";
import { t as useAsync } from "./useAsync-CAfGL-AH.mjs";
import { t as ProductCard } from "./ProductCard-DHx6GOZd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-2eA7W3JG.js
var import_jsx_runtime = require_jsx_runtime();
var hero_default = "/assets/hero-DjNLFSa0.jpg";
var cats = [
	{
		slug: "home",
		name: "Home",
		img: p_mug_default
	},
	{
		slug: "tech",
		name: "Tech",
		img: p_earbuds_default
	},
	{
		slug: "carry",
		name: "Carry",
		img: p_backpack_default
	},
	{
		slug: "accessories",
		name: "Accessories",
		img: p_wallet_default
	}
];
function Home() {
	const featured = useAsync(() => productService.featured(), []);
	const trending = useAsync(() => productService.trending(), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: hero_default,
				alt: "Stoneware mug, leather wallet and linen tote on an oak side table",
				width: 1600,
				height: 1008,
				className: "h-[68vh] min-h-[420px] w-full object-cover"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-end md:items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "container-page pb-10 md:pb-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-w-md",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "eyebrow",
								children: "Autumn edit · 2026"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "mt-3 text-5xl leading-[1.02] md:text-7xl",
								children: [
									"Everyday,",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"considered."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-muted-foreground",
								children: "Fewer, better things for home, desk and the daily route."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-7 flex gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/products",
									search: {},
									className: "rounded-md bg-ink px-5 py-3 text-sm text-ink-foreground hover:bg-ink/90",
									children: "Shop the collection"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/products",
									search: { ordering: "-created_at" },
									className: "rounded-md border border-ink/20 bg-background/60 px-5 py-3 text-sm hover:bg-background",
									children: "New in"
								})]
							})
						]
					})
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "container-page py-20",
			"aria-labelledby": "cat-h",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-end justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "cat-h",
					className: "text-4xl",
					children: "Shop by category"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-8 grid grid-cols-2 gap-5 md:grid-cols-4",
				children: cats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/products",
					search: { category: c.slug },
					className: "group block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: c.img,
						alt: "",
						loading: "lazy",
						width: 816,
						height: 816,
						className: "aspect-[4/5] w-full rounded-md object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 flex items-center justify-between text-sm font-medium",
						children: [c.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							className: "text-muted-foreground group-hover:text-primary",
							children: "→"
						})]
					})]
				}) }, c.slug))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductRow, {
			title: "Featured",
			eyebrow: "Chosen by the studio",
			state: featured
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductRow, {
			title: "Trending now",
			eyebrow: "What people are carrying",
			state: trending
		})
	] });
}
function ProductRow({ title, eyebrow, state }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "container-page pb-20",
		"aria-label": title,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: eyebrow
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-end justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-4xl",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/products",
					search: {},
					className: "text-sm underline-offset-4 hover:underline",
					children: "View all"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: state.loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GridSkeleton, { count: 4 }) : state.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
					error: state.error,
					onRetry: state.reload,
					title: "Couldn't load products"
				}) : !state.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "Nothing here yet",
					body: "Check back soon."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4",
					children: state.data.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product: p }, p.id))
				})
			})
		]
	});
}
//#endregion
export { Home as component };
