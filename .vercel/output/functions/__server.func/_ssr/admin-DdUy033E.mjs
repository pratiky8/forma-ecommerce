import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as LoadingState, o as Notice, r as ErrorState, t as Button } from "./States-B8bf-0Ix.mjs";
import { n as RequireStaff } from "./Guards-CbO70F1T.mjs";
import { o as categoryService, r as adminService, s as isFixtureMode } from "./services-CvPNC9Rn.mjs";
import { t as useAsync } from "./useAsync-CAfGL-AH.mjs";
import { r as formatINR } from "./format-DNjISxKy.mjs";
import { n as StatusBadge, t as ExampleBadge } from "./StatusBadge-Ck4ffkaG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-DdUy033E.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Admin() {
	const [tab, setTab] = (0, import_react.useState)("products");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "container-page py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-5xl",
				children: "Admin"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "Access here is a UI convenience; the server must enforce staff permissions on every request."
			}),
			isFixtureMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
					tone: "warn",
					children: "Demo mode: edits are local to this tab and vanish on reload. Nothing is saved to a server."
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "tablist",
				"aria-label": "Admin sections",
				className: "mt-6 flex flex-wrap gap-2 border-b pb-3",
				children: [
					"products",
					"inventory",
					"categories",
					"orders"
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					role: "tab",
					"aria-selected": tab === t,
					onClick: () => setTab(t),
					className: `rounded-md px-3 py-2 text-sm capitalize ${tab === t ? "bg-accent" : "text-muted-foreground hover:bg-accent"}`,
					children: t
				}, t))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8",
				role: "tabpanel",
				children: [
					tab === "products" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Products, {}),
					tab === "inventory" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inventory, {}),
					tab === "categories" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Categories, {}),
					tab === "orders" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Orders, {})
				]
			})
		]
	});
}
function Products() {
	const s = useAsync(() => adminService.listProducts(), []);
	const cats = useAsync(() => categoryService.list(), []);
	const [err, setErr] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (s.loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, {});
	if (s.error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		error: s.error,
		onRetry: s.reload
	});
	async function create(e) {
		e.preventDefault();
		if (busy) return;
		const f = e.currentTarget;
		const fd = new FormData(f);
		setBusy(true);
		setErr(null);
		try {
			await adminService.createProduct({
				name: String(fd.get("name")),
				description: String(fd.get("description") ?? ""),
				price: Number(fd.get("price")),
				stock: Number(fd.get("stock")),
				category_id: Number(fd.get("category")) || null,
				images: [],
				is_featured: false,
				is_trending: false,
				is_active: true
			});
			f.reset();
			s.reload();
		} catch (e) {
			setErr(e.message);
		} finally {
			setBusy(false);
		}
	}
	async function del(id) {
		setErr(null);
		try {
			await adminService.deleteProduct(id);
			s.reload();
		} catch (e) {
			setErr(e.message);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: create,
				className: "grid gap-3 rounded-md bg-surface p-4 sm:grid-cols-5",
				"aria-label": "New product",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "name",
						required: true,
						placeholder: "Name",
						"aria-label": "Name",
						className: "h-9 rounded-md border bg-card px-2 text-sm sm:col-span-2"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "price",
						required: true,
						type: "number",
						min: "0",
						step: "1",
						placeholder: "Price ₹",
						"aria-label": "Price",
						className: "h-9 rounded-md border bg-card px-2 text-sm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "stock",
						required: true,
						type: "number",
						min: "0",
						placeholder: "Stock",
						"aria-label": "Stock",
						className: "h-9 rounded-md border bg-card px-2 text-sm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						name: "category",
						"aria-label": "Category",
						className: "h-9 rounded-md border bg-card px-2 text-sm",
						children: cats.data?.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c.id,
							children: c.name
						}, c.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "description",
						placeholder: "Description",
						"aria-label": "Description",
						className: "h-9 rounded-md border bg-card px-2 text-sm sm:col-span-4"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy,
						children: "Add product"
					})
				]
			}),
			err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
				tone: "error",
				children: err
			}),
			!s.data?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No products yet. Add one above."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[640px] text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-left text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2",
								children: "Name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Category" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Price" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Stock" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Flags" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: "Actions"
							}) })
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y",
						children: s.data?.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductRow, {
							p,
							cats: cats.data ?? [],
							onChanged: s.reload,
							onError: setErr,
							onDelete: () => del(p.id)
						}, p.id))
					})]
				})
			})
		]
	});
}
function Inventory() {
	const s = useAsync(() => adminService.listProducts(), []);
	const [err, setErr] = (0, import_react.useState)(null);
	if (s.loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, {});
	if (s.error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		error: s.error,
		onRetry: s.reload
	});
	async function save(id, stock) {
		setErr(null);
		if (!Number.isInteger(stock) || stock < 0) return setErr("Stock must be a whole number ≥ 0.");
		try {
			await adminService.updateProduct(id, { stock });
			s.reload();
		} catch (e) {
			setErr(e.message);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
		tone: "error",
		children: err
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "divide-y",
		children: s.data?.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-center justify-between gap-4 py-3 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				p.name,
				" ",
				p.stock === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-destructive",
					children: "· out"
				}) : p.stock < 5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-primary",
					children: "· low"
				}) : null
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					save(p.id, Number(new FormData(e.currentTarget).get("stock")));
				},
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					name: "stock",
					type: "number",
					min: "0",
					defaultValue: p.stock,
					"aria-label": `Stock for ${p.name}`,
					className: "h-8 w-20 rounded-md border bg-card px-2"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					type: "submit",
					children: "Save"
				})]
			})]
		}, p.id))
	})] });
}
function Categories() {
	const s = useAsync(() => categoryService.list(), []);
	const [err, setErr] = (0, import_react.useState)(null);
	if (s.loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, {});
	if (s.error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		error: s.error,
		onRetry: s.reload
	});
	async function create(e) {
		e.preventDefault();
		const f = e.currentTarget;
		const name = String(new FormData(f).get("name")).trim();
		setErr(null);
		try {
			await adminService.createCategory({
				name,
				slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
			});
			f.reset();
			s.reload();
		} catch (e) {
			setErr(e.message);
		}
	}
	async function del(id) {
		setErr(null);
		try {
			await adminService.deleteCategory(id);
			s.reload();
		} catch (e) {
			setErr(e.message);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-lg space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: create,
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					name: "name",
					required: true,
					placeholder: "New category",
					"aria-label": "Category name",
					className: "h-9 flex-1 rounded-md border bg-card px-2 text-sm"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Add"
				})]
			}),
			err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
				tone: "error",
				children: err
			}),
			!s.data?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No categories yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y",
				children: s.data.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryRow, {
					c,
					onDelete: () => del(c.id),
					onChanged: s.reload,
					onError: setErr
				}, c.id))
			})
		]
	});
}
function Orders() {
	const s = useAsync(() => adminService.listOrders(), []);
	const [err, setErr] = (0, import_react.useState)(null);
	if (s.loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, {});
	if (s.error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		error: s.error,
		onRetry: s.reload
	});
	if (!s.data?.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "No orders yet."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
		tone: "warn",
		children: err
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "divide-y",
		children: s.data?.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex flex-wrap items-center justify-between gap-3 py-3 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				"#",
				o.number,
				" ",
				o.is_example && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExampleBadge, {}),
				" · ",
				o.customer_email
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: o.status }),
					formatINR(o.total),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						"aria-label": `Status for ${o.number}`,
						defaultValue: o.status,
						onChange: async (e) => {
							setErr(null);
							try {
								await adminService.updateOrderStatus(o.id, e.target.value);
								s.reload();
							} catch (x) {
								setErr(x.message);
							}
						},
						className: "h-8 rounded-md border bg-card px-2",
						children: [
							"pending",
							"processing",
							"shipped",
							"delivered",
							"cancelled"
						].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: v,
							children: v
						}, v))
					})
				]
			})]
		}, o.id))
	})] });
}
function ProductRow({ p, cats, onChanged, onError, onDelete }) {
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function save(e) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const price = Number(fd.get("price"));
		if (!(price >= 0)) return onError("Price must be 0 or more.");
		setBusy(true);
		onError(null);
		try {
			await adminService.updateProduct(p.id, {
				name: String(fd.get("name")).trim(),
				price,
				category_id: Number(fd.get("category")) || null,
				is_featured: fd.get("featured") === "on",
				is_trending: fd.get("trending") === "on",
				is_active: fd.get("active") === "on"
			});
			setEditing(false);
			onChanged();
		} catch (x) {
			onError(x.message);
		} finally {
			setBusy(false);
		}
	}
	if (!editing) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
			className: "py-2",
			children: p.name
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: p.category?.name ?? "—" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
			className: "tabular-nums",
			children: formatINR(p.price)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: p.stock }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
			className: "text-xs text-muted-foreground",
			children: [
				p.is_featured && "featured",
				p.is_trending && "trending",
				!p.is_active && "hidden"
			].filter(Boolean).join(", ") || "—"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
			className: "space-x-3 text-right",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setEditing(true),
				className: "underline-offset-4 hover:underline",
				children: "Edit"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onDelete,
				className: "text-destructive underline-offset-4 hover:underline",
				children: "Delete"
			})]
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		colSpan: 6,
		className: "py-2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: save,
			className: "flex flex-wrap items-center gap-2",
			"aria-label": `Edit ${p.name}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					name: "name",
					defaultValue: p.name,
					required: true,
					"aria-label": "Name",
					className: "h-8 rounded-md border bg-card px-2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					name: "price",
					type: "number",
					min: "0",
					defaultValue: p.price,
					"aria-label": "Price",
					className: "h-8 w-24 rounded-md border bg-card px-2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					name: "category",
					defaultValue: p.category?.id ?? "",
					"aria-label": "Category",
					className: "h-8 rounded-md border bg-card px-2",
					children: cats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: c.id,
						children: c.name
					}, c.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						name: "featured",
						defaultChecked: p.is_featured
					}), " Featured"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						name: "trending",
						defaultChecked: p.is_trending
					}), " Trending"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						name: "active",
						defaultChecked: p.is_active
					}), " Visible"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					type: "submit",
					disabled: busy,
					children: "Save"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					type: "button",
					onClick: () => setEditing(false),
					children: "Cancel"
				})
			]
		})
	}) });
}
function CategoryRow({ c, onDelete, onChanged, onError }) {
	const [editing, setEditing] = (0, import_react.useState)(false);
	async function save(e) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		onError(null);
		try {
			await adminService.updateCategory(c.id, {
				name: String(fd.get("name")).trim(),
				slug: String(fd.get("slug")).trim(),
				description: String(fd.get("description") ?? "")
			});
			setEditing(false);
			onChanged();
		} catch (x) {
			onError(x.message);
		}
	}
	if (!editing) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex items-center justify-between py-3 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
			c.name,
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-muted-foreground",
				children: ["/", c.slug]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "space-x-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setEditing(true),
				children: "Edit"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onDelete,
				className: "text-destructive",
				children: "Delete"
			})]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
		className: "py-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: save,
			className: "flex flex-wrap gap-2",
			"aria-label": `Edit ${c.name}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					name: "name",
					defaultValue: c.name,
					required: true,
					"aria-label": "Category name",
					className: "h-8 rounded-md border bg-card px-2 text-sm"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					name: "slug",
					defaultValue: c.slug,
					required: true,
					pattern: "[a-z0-9-]+",
					"aria-label": "Slug",
					className: "h-8 rounded-md border bg-card px-2 text-sm"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					name: "description",
					defaultValue: c.description ?? "",
					"aria-label": "Description",
					className: "h-8 flex-1 rounded-md border bg-card px-2 text-sm"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					type: "submit",
					children: "Save"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					type: "button",
					onClick: () => setEditing(false),
					children: "Cancel"
				})
			]
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireStaff, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Admin, {}) });
//#endregion
export { SplitComponent as component };
