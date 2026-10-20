import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { i as GridSkeleton, n as EmptyState, r as ErrorState } from "./States-B8bf-0Ix.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as productService, o as categoryService } from "./services-CvPNC9Rn.mjs";
import { t as useAsync } from "./useAsync-CAfGL-AH.mjs";
import { t as ProductCard } from "./ProductCard-DHx6GOZd.mjs";
import { n as Route, r as toNum, t as ORDERINGS } from "./products.index-DLmYIm2K.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/products.index-DHgivfQR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductsPage() {
	const q = Route.useSearch();
	const navigate = useNavigate({ from: "/products/" });
	const cats = useAsync(() => categoryService.list(), []);
	const list = useAsync(() => productService.list(q), [JSON.stringify(q)]);
	const [min, setMin] = (0, import_react.useState)(q.min_price?.toString() ?? "");
	const [max, setMax] = (0, import_react.useState)(q.max_price?.toString() ?? "");
	const [priceError, setPriceError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setMin(q.min_price?.toString() ?? "");
		setMax(q.max_price?.toString() ?? "");
	}, [q.min_price, q.max_price]);
	const set = (patch) => navigate({ search: (prev) => ({
		...prev,
		...patch,
		page: patch.page
	}) });
	function applyPrice(e) {
		e.preventDefault();
		const a = toNum(min), b = toNum(max);
		if (min && a === void 0 || max && b === void 0) return setPriceError("Enter valid amounts.");
		if (a != null && b != null && a > b) return setPriceError("Minimum must be below maximum.");
		setPriceError(null);
		set({
			min_price: a,
			max_price: b
		});
	}
	const totalPages = list.data ? Math.max(1, Math.ceil(list.data.count / 8)) : 1;
	const page = q.page ?? 1;
	const activeCat = cats.data?.find((c) => c.slug === q.category);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-page py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: activeCat ? "Category" : "Catalogue"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 text-5xl",
				children: activeCat?.name ?? (q.search ? `“${q.search}”` : "Shop all")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 grid gap-10 lg:grid-cols-[220px_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					"aria-label": "Filters",
					className: "space-y-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "f-search",
							className: "eyebrow",
							children: "Search"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
							onSubmit: (e) => {
								e.preventDefault();
								set({ search: new FormData(e.currentTarget).get("s").trim() || void 0 });
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "f-search",
								name: "s",
								defaultValue: q.search ?? "",
								className: "mt-2 h-9 w-full rounded-md border border-input bg-card px-3 text-sm",
								placeholder: "Mug, lamp…"
							}, q.search ?? "")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "eyebrow",
							children: "Category"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-3 space-y-1 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => set({ category: void 0 }),
									"aria-pressed": !q.category,
									className: `py-1 ${!q.category ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground"}`,
									children: "All"
								}) }),
								cats.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: cats.reload,
									className: "text-xs text-destructive underline",
									children: "Categories failed — retry"
								}) }),
								cats.data?.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => set({ category: c.slug }),
									"aria-pressed": q.category === c.slug,
									className: `py-1 ${q.category === c.slug ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground"}`,
									children: c.name
								}) }, c.id))
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: applyPrice,
							"aria-labelledby": "price-legend",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									id: "price-legend",
									className: "eyebrow",
									children: "Price (₹)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "sr-only",
											htmlFor: "min",
											children: "Minimum price"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "min",
											inputMode: "numeric",
											value: min,
											onChange: (e) => setMin(e.target.value),
											placeholder: "Min",
											className: "h-9 w-full rounded-md border border-input bg-card px-2 text-sm"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"aria-hidden": true,
											children: "–"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "sr-only",
											htmlFor: "max",
											children: "Maximum price"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "max",
											inputMode: "numeric",
											value: max,
											onChange: (e) => setMax(e.target.value),
											placeholder: "Max",
											className: "h-9 w-full rounded-md border border-input bg-card px-2 text-sm"
										})
									]
								}),
								priceError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									role: "alert",
									className: "mt-2 text-xs text-destructive",
									children: priceError
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "mt-3 h-8 rounded-md border px-3 text-xs hover:bg-accent",
									children: "Apply"
								})
							]
						}),
						(q.search || q.category || q.min_price != null || q.max_price != null) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/products",
							search: {},
							className: "block text-sm underline underline-offset-4",
							children: "Clear all filters"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-label": "Results",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							"aria-live": "polite",
							children: list.data ? `${list.data.count} product${list.data.count === 1 ? "" : "s"}` : "\xA0"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "Sort"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: q.ordering ?? "",
								onChange: (e) => set({ ordering: e.target.value || void 0 }),
								className: "h-9 rounded-md border border-input bg-card px-2 text-sm",
								children: ORDERINGS.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: o.value,
									children: o.label
								}, o.value))
							})]
						})]
					}), list.loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GridSkeleton, {}) : list.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
						error: list.error,
						onRetry: list.reload,
						title: "Couldn't load products"
					}) : !list.data?.results.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No matches",
						body: "Try a different search or widen the price range.",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/products",
							search: {},
							className: "rounded-md bg-ink px-4 py-2 text-sm text-ink-foreground",
							children: "Clear filters"
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3",
						children: list.data.results.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product: p }, p.id))
					}), totalPages > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						"aria-label": "Pagination",
						className: "mt-12 flex items-center justify-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: !list.data.previous,
								onClick: () => set({ page: page - 1 > 1 ? page - 1 : void 0 }),
								className: "h-9 rounded-md border px-3 text-sm disabled:opacity-40",
								children: "Previous"
							}),
							Array.from({ length: totalPages }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-current": page === i + 1 ? "page" : void 0,
								onClick: () => set({ page: i + 1 > 1 ? i + 1 : void 0 }),
								className: `h-9 w-9 rounded-md text-sm ${page === i + 1 ? "bg-ink text-ink-foreground" : "border hover:bg-accent"}`,
								children: i + 1
							}, i)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: !list.data.next,
								onClick: () => set({ page: page + 1 }),
								className: "h-9 rounded-md border px-3 text-sm disabled:opacity-40",
								children: "Next"
							})
						]
					})] })]
				})]
			})
		]
	});
}
//#endregion
export { ProductsPage as component };
