import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as useAuth, t as Ctx } from "./auth-context-BA25qOws.mjs";
import { n as require_jsx_runtime, t as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { c as Menu, i as Search, n as User, r as ShoppingBag, t as X } from "../_libs/lucide-react.mjs";
import { o as Notice } from "./States-B8bf-0Ix.mjs";
import { S as useRouter, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, v as createFileRoute, x as useNavigate, y as createRootRouteWithContext } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as cartService, c as onUnauthorized, i as authService, s as isFixtureMode, t as ApiError } from "./services-CvPNC9Rn.mjs";
import { t as Route$8 } from "./account.orders._id-D1Lh3IWD.mjs";
import { n as useCart, t as Ctx$1 } from "./cart-context-C8ImXUQS.mjs";
import { t as Route$9 } from "./login-Cqnaefw5.mjs";
import { n as ModeBanner, r as Route$10, t as DemoTag } from "./products._id-cUbu_Uki.mjs";
import { n as Route$11 } from "./products.index-DLmYIm2K.mjs";
import { t as Route$12 } from "./register-TU1byYbC.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CpCZdE4r.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-DsCQRaRr.css";
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [initializing, setInitializing] = (0, import_react.useState)(true);
	const [sessionExpired, setSessionExpired] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let alive = true;
		authService.me().then((u) => alive && setUser(u)).catch(() => alive && setUser(null)).finally(() => alive && setInitializing(false));
		onUnauthorized(() => {
			setUser((prev) => {
				if (prev) setSessionExpired(true);
				return null;
			});
		});
		return () => {
			alive = false;
			onUnauthorized(null);
		};
	}, []);
	const login = (0, import_react.useCallback)(async (c) => {
		const u = await authService.login(c);
		setUser(u);
		setSessionExpired(false);
		return u;
	}, []);
	const register = (0, import_react.useCallback)(async (r) => {
		const u = await authService.register(r);
		setUser(u);
		return u;
	}, []);
	const logout = (0, import_react.useCallback)(async () => {
		try {
			await authService.logout();
		} finally {
			setUser(null);
		}
	}, []);
	const updateMe = (0, import_react.useCallback)(async (p) => {
		const u = await authService.updateMe(p);
		setUser(u);
		return u;
	}, []);
	const startDemo = (0, import_react.useMemo)(() => authService.startDemo ? async (asStaff) => {
		const u = await authService.startDemo(asStaff);
		setUser(u);
		return u;
	} : void 0, []);
	const value = (0, import_react.useMemo)(() => ({
		user,
		initializing,
		login,
		register,
		logout,
		updateMe,
		startDemo,
		sessionExpired
	}), [
		user,
		initializing,
		login,
		register,
		logout,
		updateMe,
		startDemo,
		sessionExpired
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, {
		value,
		children
	});
}
function CartProvider({ children }) {
	const { user, initializing } = useAuth();
	const canUseCart = isFixtureMode || !!user;
	const [cart, setCart] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const refresh = (0, import_react.useCallback)(async () => {
		if (!canUseCart) {
			setCart(null);
			setLoading(false);
			return;
		}
		setLoading(true);
		setError(null);
		try {
			setCart(await cartService.get());
		} catch (e) {
			setError(e);
		} finally {
			setLoading(false);
		}
	}, [canUseCart]);
	(0, import_react.useEffect)(() => {
		if (!initializing) refresh();
	}, [initializing, refresh]);
	const withPending = (0, import_react.useCallback)(async (key, op) => {
		if (!canUseCart) throw new ApiError("Please sign in to use your cart.", { status: 401 });
		setPending((s) => new Set(s).add(key));
		try {
			setCart(await op());
		} finally {
			setPending((s) => {
				const n = new Set(s);
				n.delete(key);
				return n;
			});
		}
	}, [canUseCart]);
	const value = (0, import_react.useMemo)(() => ({
		cart,
		loading,
		error,
		canUseCart,
		pending,
		refresh,
		add: (pid, q) => withPending(`p${pid}`, () => cartService.add(pid, q)),
		update: (id, q) => withPending(id, () => cartService.update(id, q)),
		remove: (id) => withPending(id, () => cartService.remove(id))
	}), [
		cart,
		loading,
		error,
		canUseCart,
		pending,
		refresh,
		withPending
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx$1.Provider, {
		value,
		children
	});
}
function SearchBar({ initial = "", onSubmitted, id = "site-search" }) {
	const [q, setQ] = (0, import_react.useState)(initial);
	const navigate = useNavigate();
	function submit(e) {
		e.preventDefault();
		navigate({
			to: "/products",
			search: { search: q.trim() || void 0 }
		});
		onSubmitted?.();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		role: "search",
		onSubmit: submit,
		className: "relative w-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: id,
				className: "sr-only",
				children: "Search products"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id,
				type: "search",
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Search Forma",
				className: "h-9 w-full rounded-full border border-input bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
				className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
				"aria-hidden": true
			})
		]
	});
}
var categoryLinks = [
	{
		slug: "home",
		label: "Home"
	},
	{
		slug: "tech",
		label: "Tech"
	},
	{
		slug: "carry",
		label: "Carry"
	},
	{
		slug: "accessories",
		label: "Accessories"
	}
];
function Navbar() {
	const { user, logout } = useAuth();
	const { cart } = useCart();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [logoutError, setLogoutError] = (0, import_react.useState)(null);
	const navigate = useNavigate();
	const count = cart?.item_count ?? 0;
	async function handleLogout() {
		setLogoutError(null);
		try {
			await logout();
			setOpen(false);
			await navigate({
				to: "/",
				replace: true
			});
		} catch (e) {
			setLogoutError(e.message);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "border-b bg-background",
		children: [
			logoutError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Notice, {
				tone: "error",
				children: ["Server sign-out could not be confirmed: ", logoutError]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container-page flex h-16 items-center gap-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "-ml-2 p-2 md:hidden",
						"aria-label": open ? "Close menu" : "Open menu",
						"aria-expanded": open,
						"aria-controls": "mobile-nav",
						onClick: () => setOpen((v) => !v),
						children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "font-display text-2xl leading-none tracking-tight",
						"aria-label": "Forma home",
						children: "Forma"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						"aria-label": "Primary",
						className: "hidden items-center gap-5 text-sm md:flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/products",
							search: {},
							className: "hover:text-primary",
							activeOptions: {
								exact: true,
								includeSearch: false
							},
							children: "Shop all"
						}), categoryLinks.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/products",
							search: { category: c.slug },
							className: "text-muted-foreground hover:text-foreground",
							children: c.label
						}, c.slug))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "ml-auto hidden w-56 lg:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBar, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-1 lg:ml-0",
						children: [
							user?.is_staff && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/admin",
								className: "hidden rounded-md px-3 py-2 text-sm hover:bg-accent md:inline-block",
								children: "Admin"
							}),
							user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden items-center gap-1 md:flex",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/account",
									className: "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, {
											className: "h-4 w-4",
											"aria-hidden": true
										}),
										" ",
										user.first_name || "Account",
										user.is_demo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoTag, { children: "Demo" })
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: handleLogout,
									className: "rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent",
									children: "Sign out"
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								className: "hidden rounded-md px-3 py-2 text-sm hover:bg-accent md:inline-block",
								children: "Sign in"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/cart",
								className: "relative rounded-md p-2 hover:bg-accent",
								"aria-label": `Cart, ${count} item${count === 1 ? "" : "s"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, {
									className: "h-5 w-5",
									"aria-hidden": true
								}), count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground",
									children: count
								})]
							})
						]
					})
				]
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				id: "mobile-nav",
				className: "border-t md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container-page space-y-4 py-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchBar, {
						id: "mobile-search",
						onSubmitted: () => setOpen(false)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						"aria-label": "Mobile",
						className: "flex flex-col text-base",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/products",
								search: {},
								onClick: () => setOpen(false),
								className: "py-2",
								children: "Shop all"
							}),
							categoryLinks.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/products",
								search: { category: c.slug },
								onClick: () => setOpen(false),
								className: "py-2 text-muted-foreground",
								children: c.label
							}, c.slug)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { className: "my-2" }),
							user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/account",
									onClick: () => setOpen(false),
									className: "py-2",
									children: "Account"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/account/orders",
									onClick: () => setOpen(false),
									className: "py-2",
									children: "Orders"
								}),
								user.is_staff && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/admin",
									onClick: () => setOpen(false),
									className: "py-2",
									children: "Admin"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: handleLogout,
									className: "py-2 text-left text-muted-foreground",
									children: "Sign out"
								})
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								onClick: () => setOpen(false),
								className: "py-2",
								children: "Sign in"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/register",
								onClick: () => setOpen(false),
								className: "py-2",
								children: "Create account"
							})] })
						]
					})]
				})
			})
		]
	});
}
function Footer() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "mt-24 border-t bg-surface",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container-page grid gap-10 py-14 md:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl",
						children: "Forma"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-xs text-sm text-muted-foreground",
						children: "Everyday, considered. Objects for home, tech and carry — chosen to last."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					"aria-label": "Shop",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Shop"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 space-y-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/products",
								search: {},
								children: "All products"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/products",
								search: { category: "home" },
								children: "Home"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/products",
								search: { category: "tech" },
								children: "Tech"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/products",
								search: { category: "carry" },
								children: "Carry"
							}) })
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					"aria-label": "Account",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "Account"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 space-y-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/account",
								children: "Profile"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/account/orders",
								children: "Orders"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/cart",
								children: "Cart"
							}) })
						]
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container-page flex flex-col gap-2 border-t py-5 text-xs text-muted-foreground md:flex-row md:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "© 2026 Forma. Portfolio frontend." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: isFixtureMode ? "Running on development fixtures (demo mode)." : "Connected to live API." })]
		})]
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-[60vh] items-center justify-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-5xl",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground",
					children: "Go home"
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong. Try again or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "rounded-md border px-4 py-2 text-sm",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$7 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Forma — Everyday, considered." },
			{
				name: "description",
				content: "Forma: a considered store for home, tech, carry and everyday accessories."
			},
			{
				property: "og:title",
				content: "Forma — Everyday, considered."
			},
			{
				property: "og:description",
				content: "A considered store for home, tech, carry and everyday accessories."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "application-name",
				content: "Forma"
			},
			{
				name: "theme-color",
				content: "#f8f5ef"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			},
			{
				rel: "icon",
				href: "/favicon.svg",
				type: "image/svg+xml"
			},
			{
				rel: "manifest",
				href: "/site.webmanifest"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Instrument+Serif&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en-IN",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$7.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CartProvider, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "#main",
				className: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2",
				children: "Skip to content"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeBanner, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navbar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				id: "main",
				className: "min-h-[60vh]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		] }) })
	});
}
var $$splitComponentImporter$6 = () => import("./routes-2eA7W3JG.mjs");
var Route$6 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Forma — Everyday, considered." },
		{
			name: "description",
			content: "Considered objects for home, tech, carry and everyday accessories."
		},
		{
			property: "og:title",
			content: "Forma — Everyday, considered."
		},
		{
			property: "og:description",
			content: "Considered objects for home, tech, carry and everyday accessories."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./account-D7DK2RNO.mjs");
var Route$5 = createFileRoute("/account")({
	head: () => ({ meta: [
		{ title: "Your account — Forma" },
		{
			name: "description",
			content: "Manage your Forma profile and orders."
		},
		{
			property: "og:title",
			content: "Your account — Forma"
		},
		{
			property: "og:description",
			content: "Manage your Forma profile and orders."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./admin-DdUy033E.mjs");
var Route$4 = createFileRoute("/admin")({
	head: () => ({ meta: [
		{ title: "Staff admin — Forma" },
		{
			name: "description",
			content: "Staff management for products, categories, inventory and orders."
		},
		{
			property: "og:title",
			content: "Staff admin — Forma"
		},
		{
			property: "og:description",
			content: "Staff management screens."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./cart-BtuWNonB.mjs");
var Route$3 = createFileRoute("/cart")({
	head: () => ({ meta: [
		{ title: "Your cart — Forma" },
		{
			name: "description",
			content: "Review items and totals in your Forma cart."
		},
		{
			property: "og:title",
			content: "Your cart — Forma"
		},
		{
			property: "og:description",
			content: "Review items and totals in your Forma cart."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./checkout-CiqiXpUD.mjs");
var Route$2 = createFileRoute("/checkout")({
	head: () => ({ meta: [
		{ title: "Checkout — Forma" },
		{
			name: "description",
			content: "Enter shipping details and choose a payment method."
		},
		{
			property: "og:title",
			content: "Checkout — Forma"
		},
		{
			property: "og:description",
			content: "Enter shipping details and choose a payment method."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./account.index-Q2nmwnTT.mjs");
var Route$1 = createFileRoute("/account/")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./account.orders.index-bL7cWeN_.mjs");
var Route = createFileRoute("/account/orders/")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$6.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$7
});
var AccountRoute = Route$5.update({
	id: "/account",
	path: "/account",
	getParentRoute: () => Route$7
});
var AdminRoute = Route$4.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$7
});
var CartRoute = Route$3.update({
	id: "/cart",
	path: "/cart",
	getParentRoute: () => Route$7
});
var CheckoutRoute = Route$2.update({
	id: "/checkout",
	path: "/checkout",
	getParentRoute: () => Route$7
});
var LoginRoute = Route$9.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$7
});
var RegisterRoute = Route$12.update({
	id: "/register",
	path: "/register",
	getParentRoute: () => Route$7
});
var AccountIndexRoute = Route$1.update({
	id: "/",
	path: "/",
	getParentRoute: () => AccountRoute
});
var ProductsIndexRoute = Route$11.update({
	id: "/products/",
	path: "/products/",
	getParentRoute: () => Route$7
});
var ProductsIdRoute = Route$10.update({
	id: "/products/$id",
	path: "/products/$id",
	getParentRoute: () => Route$7
});
var AccountOrdersIndexRoute = Route.update({
	id: "/orders/",
	path: "/orders/",
	getParentRoute: () => AccountRoute
});
var AccountRouteChildren = {
	AccountIndexRoute,
	AccountOrdersIdRoute: Route$8.update({
		id: "/orders/$id",
		path: "/orders/$id",
		getParentRoute: () => AccountRoute
	}),
	AccountOrdersIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AccountRoute: AccountRoute._addFileChildren(AccountRouteChildren),
	AdminRoute,
	CartRoute,
	CheckoutRoute,
	LoginRoute,
	RegisterRoute,
	ProductsIdRoute,
	ProductsIndexRoute
};
var routeTree = Route$7._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
