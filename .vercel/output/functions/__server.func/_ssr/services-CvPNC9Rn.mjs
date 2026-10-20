import { t as axios } from "../_libs/axios+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/services-CvPNC9Rn.js
/** Shared by runtime configuration and the production build preflight. */
function resolveApiBaseUrl(value, production) {
	const configured = value?.trim();
	if (!configured && !production) return "http://localhost:8000";
	if (!configured) throw new Error("Set VITE_API_BASE_URL to your publicly hosted Django HTTPS origin before building for production.");
	let url;
	try {
		url = new URL(configured);
	} catch {
		throw new Error("VITE_API_BASE_URL must be an absolute HTTP(S) origin.");
	}
	if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== "/") throw new Error("VITE_API_BASE_URL must be an HTTP(S) origin without credentials, paths, query parameters or fragments.");
	const host = url.hostname.toLowerCase().replace(/\.$/, "");
	const loopback = host === "localhost" || host.endsWith(".localhost") || host === "[::1]" || host === "0.0.0.0" || /^127\./.test(host);
	if (production && (url.protocol !== "https:" || loopback)) throw new Error("Production VITE_API_BASE_URL must use HTTPS and must not point to localhost or a loopback address.");
	return url.origin;
}
/**
* Runtime configuration. All env access lives here.
*
* Fixture mode is ONLY active when VITE_USE_DEV_FIXTURES=true AND
* (the app runs in Vite development OR VITE_ENABLE_DEMO=true is set explicitly).
* Anything else → live API mode (the default).
*/
var env = {
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/",
	"VITE_API_BASE_URL": "https://api.example.com",
	"VITE_AUTH_STRATEGY": "token",
	"VITE_ENABLE_DEMO": "false",
	"VITE_USE_DEV_FIXTURES": "false"
};
var API_BASE_URL = resolveApiBaseUrl(env["VITE_API_BASE_URL"], env.PROD);
var wantsFixtures = env["VITE_USE_DEV_FIXTURES"] === "true";
var demoAllowed = env.DEV === true || env["VITE_ENABLE_DEMO"] === "true";
var USE_FIXTURES = wantsFixtures && demoAllowed;
var AUTH_STRATEGY = env["VITE_AUTH_STRATEGY"] === "session" ? "session" : "token";
var REQUEST_TIMEOUT_MS = 15e3;
/**
* Single endpoint map. Paths marked PROPOSED must be confirmed with the Django team
* (see docs/API_CONTRACT.md). Components never build URLs themselves.
*/
var endpoints = {
	products: "/api/products/",
	product: (id) => `/api/products/${id}/`,
	categories: "/api/categories/",
	register: "/api/auth/register/",
	login: "/api/auth/login/",
	logout: "/api/auth/logout/",
	me: "/api/auth/me/",
	csrf: "/api/auth/csrf/",
	cart: "/api/cart/",
	cartItems: "/api/cart/items/",
	cartItem: (id) => `/api/cart/items/${id}/`,
	orders: "/api/orders/",
	order: (id) => `/api/orders/${id}/`,
	adminProducts: "/api/admin/products/",
	adminProduct: (id) => `/api/admin/products/${id}/`,
	adminCategories: "/api/admin/categories/",
	adminCategory: (id) => `/api/admin/categories/${id}/`,
	adminOrders: "/api/admin/orders/",
	adminOrder: (id) => `/api/admin/orders/${id}/`
};
/** Normalized error surfaced to every screen. */
var ApiError = class extends Error {
	status;
	fieldErrors;
	kind;
	constructor(message, opts = {}) {
		super(message);
		this.name = "ApiError";
		this.status = opts.status ?? null;
		this.fieldErrors = opts.fieldErrors ?? {};
		this.kind = opts.kind ?? "http";
	}
};
/** Thrown in fixture mode for operations that need the real Django backend. */
var BackendRequiredError = class extends ApiError {
	constructor(message) {
		super(message, { kind: "unsupported" });
		this.name = "BackendRequiredError";
	}
};
var TOKEN_KEY = "forma.auth.token";
var memoryToken = null;
var tokenStore = {
	get() {
		if (memoryToken) return memoryToken;
		if (typeof window === "undefined") return null;
		memoryToken = window.sessionStorage.getItem(TOKEN_KEY);
		return memoryToken;
	},
	set(token) {
		memoryToken = token;
		if (typeof window === "undefined") return;
		if (token) window.sessionStorage.setItem(TOKEN_KEY, token);
		else window.sessionStorage.removeItem(TOKEN_KEY);
	}
};
var unauthorizedHandler = null;
function onUnauthorized(fn) {
	unauthorizedHandler = fn;
}
function readCookie(name) {
	if (typeof document === "undefined") return null;
	const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
	return m ? decodeURIComponent(m[1] ?? "") : null;
}
var http = axios.create({
	baseURL: API_BASE_URL,
	timeout: REQUEST_TIMEOUT_MS,
	withCredentials: AUTH_STRATEGY === "session",
	headers: { Accept: "application/json" }
});
http.interceptors.request.use((config) => {
	if (AUTH_STRATEGY === "token") {
		const t = tokenStore.get();
		if (t) config.headers.set("Authorization", `Token ${t}`);
	} else {
		const method = (config.method ?? "get").toUpperCase();
		if (![
			"GET",
			"HEAD",
			"OPTIONS"
		].includes(method)) {
			const csrf = readCookie("csrftoken");
			if (csrf) config.headers.set("X-CSRFToken", csrf);
		}
	}
	return config;
});
http.interceptors.response.use((r) => r, (err) => {
	throw toApiError(err);
});
function toApiError(err) {
	if (err instanceof ApiError) return err;
	if (axios.isAxiosError(err)) {
		if (!err.response) return new ApiError(err.code === "ECONNABORTED" ? "The server took too long to respond." : "Can't reach the store server. Check your connection or that the API is running.", { kind: "network" });
		const status = err.response.status;
		if (status === 401) {
			tokenStore.set(null);
			unauthorizedHandler?.();
		}
		const data = err.response.data;
		const { message, fieldErrors } = parseDrfError(data, status);
		return new ApiError(message, {
			status,
			fieldErrors
		});
	}
	return new ApiError(err instanceof Error ? err.message : "Unexpected error");
}
/** DRF errors: {"detail": "..."} or {"field": ["msg"]} or {"non_field_errors": [...]} */
function parseDrfError(data, status) {
	const fieldErrors = {};
	let message = defaultMessage(status);
	if (data && typeof data === "object" && !Array.isArray(data)) {
		const obj = data;
		if (typeof obj["detail"] === "string") message = obj["detail"];
		for (const [k, v] of Object.entries(obj)) {
			if (k === "detail") continue;
			const arr = Array.isArray(v) ? v.map(String) : typeof v === "string" ? [v] : [];
			if (arr.length) fieldErrors[k] = arr;
		}
		if (fieldErrors["non_field_errors"]?.length) message = fieldErrors["non_field_errors"][0] ?? message;
		else if (typeof obj["detail"] !== "string" && Object.keys(fieldErrors).length) message = "Please correct the highlighted fields.";
	}
	return {
		message,
		fieldErrors
	};
}
function defaultMessage(status) {
	if (status === 401) return "Your session has expired. Please sign in again.";
	if (status === 403) return "You don't have permission to do that.";
	if (status === 404) return "Not found.";
	if (status === 409) return "This conflicts with the current state. Please refresh.";
	if (status >= 500) return "The server had a problem. Please try again.";
	return "Request failed.";
}
/** Accept DRF page objects or plain lists. */
function normalizePage(data, map) {
	if (Array.isArray(data)) return {
		count: data.length,
		next: null,
		previous: null,
		results: data.map(map)
	};
	const d = data ?? {};
	const results = Array.isArray(d.results) ? d.results.map(map) : [];
	return {
		count: typeof d.count === "number" ? d.count : results.length,
		next: d.next ?? null,
		previous: d.previous ?? null,
		results
	};
}
/** DRF serializes DecimalField as string — coerce safely. */
function num(v, fallback = 0) {
	const n = typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : NaN;
	return Number.isFinite(n) ? n : fallback;
}
var o = (v) => v && typeof v === "object" ? v : {};
function absUrl(u) {
	if (typeof u !== "string" || !u) return null;
	if (/^https?:\/\//.test(u)) return u;
	return API_BASE_URL.replace(/\/$/, "") + (u.startsWith("/") ? u : `/${u}`);
}
function toCategory(raw) {
	const r = o(raw);
	return {
		id: num(r.id),
		name: String(r.name ?? ""),
		slug: String(r.slug ?? r.id ?? ""),
		description: typeof r.description === "string" ? r.description : void 0
	};
}
function toProduct(raw) {
	const r = o(raw);
	const imgs = [];
	if (Array.isArray(r.images)) for (const i of r.images) {
		const u = absUrl(typeof i === "string" ? i : o(i).image ?? o(i).url);
		if (u) imgs.push(u);
	}
	const single = absUrl(r.image);
	if (single && !imgs.length) imgs.push(single);
	const cat = r.category;
	return {
		id: num(r.id),
		name: String(r.name ?? ""),
		slug: String(r.slug ?? r.id ?? ""),
		description: String(r.description ?? ""),
		price: num(r.price),
		category: cat && typeof cat === "object" ? toCategory(cat) : null,
		stock: num(r.stock),
		images: imgs,
		is_featured: Boolean(r.is_featured),
		is_trending: Boolean(r.is_trending),
		is_active: r.is_active === void 0 ? true : Boolean(r.is_active)
	};
}
function toCart(raw) {
	const r = o(raw);
	const items = (Array.isArray(r.items) ? r.items : []).map((it) => {
		const i = o(it);
		return {
			id: num(i.id),
			product: toProduct(i.product),
			quantity: num(i.quantity),
			unit_price: num(i.unit_price),
			line_total: num(i.line_total)
		};
	});
	return {
		id: r.id ?? "server",
		items,
		item_count: num(r.item_count, items.reduce((s, i) => s + i.quantity, 0)),
		subtotal: num(r.subtotal),
		shipping: num(r.shipping),
		tax: num(r.tax),
		total: num(r.total),
		totals_are_estimates: false
	};
}
function toUser(raw) {
	const r = o(raw);
	return {
		id: r.id ?? "",
		email: String(r.email ?? ""),
		first_name: String(r.first_name ?? ""),
		last_name: String(r.last_name ?? ""),
		is_staff: r.is_staff === true
	};
}
function toOrder(raw) {
	const r = o(raw);
	const items = (Array.isArray(r.items) ? r.items : []).map((it) => {
		const i = o(it);
		return {
			id: num(i.id),
			product_id: num(i.product_id ?? i.product),
			product_name: String(i.product_name ?? ""),
			quantity: num(i.quantity),
			unit_price: num(i.unit_price),
			line_total: num(i.line_total)
		};
	});
	const a = o(r.shipping_address);
	return {
		id: num(r.id),
		number: String(r.number ?? r.id ?? ""),
		status: r.status ?? "pending",
		payment_method: r.payment_method ?? "cod",
		payment_status: r.payment_status ?? "unpaid",
		created_at: String(r.created_at ?? ""),
		shipping_address: {
			full_name: String(a.full_name ?? ""),
			phone: String(a.phone ?? ""),
			line1: String(a.line1 ?? ""),
			line2: typeof a.line2 === "string" ? a.line2 : "",
			city: String(a.city ?? ""),
			state: String(a.state ?? ""),
			postal_code: String(a.postal_code ?? ""),
			country: String(a.country ?? "IN")
		},
		items,
		subtotal: num(r.subtotal),
		shipping: num(r.shipping),
		tax: num(r.tax),
		total: num(r.total),
		customer_email: typeof r.customer_email === "string" ? r.customer_email : void 0
	};
}
function queryParams(q) {
	const p = {};
	if (q.search) p["search"] = q.search;
	if (q.category) p["category"] = q.category;
	if (q.min_price != null) p["min_price"] = q.min_price;
	if (q.max_price != null) p["max_price"] = q.max_price;
	if (q.ordering) p["ordering"] = q.ordering;
	if (q.page && q.page > 1) p["page"] = q.page;
	return p;
}
async function ensureCsrf() {
	if (AUTH_STRATEGY === "session") await http.get(endpoints.csrf);
}
/** Login/register responses: {token, user} (token strategy) or {user} / user (session). */
function handleAuthResponse(data) {
	const d = data ?? {};
	if (AUTH_STRATEGY === "token") {
		const token = typeof d.token === "string" ? d.token : typeof d.key === "string" ? d.key : null;
		if (!token) throw new ApiError("Login response did not include a token.");
		tokenStore.set(token);
	}
	return toUser(d.user ?? d);
}
/** Live Django adapter — the only adapter used outside explicit fixture mode. */
var liveBackend = {
	mode: "live",
	products: {
		async list(q) {
			const { data } = await http.get(endpoints.products, { params: queryParams(q) });
			return normalizePage(data, toProduct);
		},
		async get(id) {
			const { data } = await http.get(endpoints.product(id));
			return toProduct(data);
		},
		async featured() {
			const { data } = await http.get(endpoints.products, { params: { is_featured: "true" } });
			return normalizePage(data, toProduct).results.slice(0, 4);
		},
		async trending() {
			const { data } = await http.get(endpoints.products, { params: { is_trending: "true" } });
			return normalizePage(data, toProduct).results.slice(0, 4);
		}
	},
	categories: { async list() {
		const { data } = await http.get(endpoints.categories);
		return normalizePage(data, toCategory).results;
	} },
	auth: {
		async login(c) {
			await ensureCsrf();
			const { data } = await http.post(endpoints.login, c);
			return handleAuthResponse(data);
		},
		async register(r) {
			await ensureCsrf();
			const { data } = await http.post(endpoints.register, r);
			return handleAuthResponse(data);
		},
		async logout() {
			try {
				await http.post(endpoints.logout);
			} finally {
				tokenStore.set(null);
			}
		},
		async me() {
			if (AUTH_STRATEGY === "token" && !tokenStore.get()) return null;
			try {
				const { data } = await http.get(endpoints.me);
				return toUser(data);
			} catch (e) {
				if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return null;
				throw e;
			}
		},
		async updateMe(patch) {
			const { data } = await http.patch(endpoints.me, patch);
			return toUser(data);
		}
	},
	cart: {
		async get() {
			const { data } = await http.get(endpoints.cart);
			return toCart(data);
		},
		async add(product_id, quantity) {
			const { data } = await http.post(endpoints.cartItems, {
				product_id,
				quantity
			});
			return toCart(data);
		},
		async update(itemId, quantity) {
			const { data } = await http.patch(endpoints.cartItem(itemId), { quantity });
			return toCart(data);
		},
		async remove(itemId) {
			const { data } = await http.delete(endpoints.cartItem(itemId));
			if (!data) return toCart((await http.get(endpoints.cart)).data);
			return toCart(data);
		}
	},
	orders: {
		async list() {
			const { data } = await http.get(endpoints.orders);
			return normalizePage(data, toOrder).results;
		},
		async get(id) {
			const { data } = await http.get(endpoints.order(id));
			return toOrder(data);
		},
		async create(p) {
			const { data } = await http.post(endpoints.orders, p, { headers: { "Idempotency-Key": p.client_reference } });
			const order = toOrder(data);
			if (!order.id || typeof data?.number !== "string" || !data.number.trim()) throw new ApiError("The server response did not confirm an order.");
			return order;
		}
	},
	admin: {
		async listProducts() {
			const { data } = await http.get(endpoints.adminProducts);
			return normalizePage(data, toProduct).results;
		},
		async createProduct(p) {
			return toProduct((await http.post(endpoints.adminProducts, p)).data);
		},
		async updateProduct(id, p) {
			return toProduct((await http.patch(endpoints.adminProduct(id), p)).data);
		},
		async deleteProduct(id) {
			await http.delete(endpoints.adminProduct(id));
		},
		async createCategory(c) {
			return toCategory((await http.post(endpoints.adminCategories, c)).data);
		},
		async updateCategory(id, c) {
			return toCategory((await http.patch(endpoints.adminCategory(id), c)).data);
		},
		async deleteCategory(id) {
			await http.delete(endpoints.adminCategory(id));
		},
		async listOrders() {
			const { data } = await http.get(endpoints.adminOrders);
			return normalizePage(data, toOrder).results;
		},
		async updateOrderStatus(id, status) {
			return toOrder((await http.patch(endpoints.adminOrder(id), { status })).data);
		}
	}
};
var p_mug_default = "/assets/p-mug-BprkLwNP.jpg";
var p_lamp_default = "/assets/p-lamp-BBGldiki.jpg";
var p_vase_default = "/assets/p-vase-CxkQxbRL.jpg";
var p_earbuds_default = "/assets/p-earbuds-D3Jrwzlt.jpg";
var p_speaker_default = "/assets/p-speaker-jJg9tY5N.jpg";
var p_charger_default = "/assets/p-charger-CcPTaOpJ.jpg";
var p_tote_default = "/assets/p-tote-B08rOEvl.jpg";
var p_backpack_default = "/assets/p-backpack-BBmpJCRc.jpg";
var p_sleeve_default = "/assets/p-sleeve-C5wVvKel.jpg";
var p_wallet_default = "/assets/p-wallet-D8pvJPw2.jpg";
var p_watch_default = "/assets/p-watch-Bth4TTkz.jpg";
var p_bottle_default = "/assets/p-bottle-DeZBmwj-.jpg";
/** DEVELOPMENT FIXTURES — illustrative catalogue for demo mode only. Not real inventory. */
var fixtureCategories = [
	{
		id: 1,
		name: "Home",
		slug: "home",
		description: "Objects for slower mornings."
	},
	{
		id: 2,
		name: "Tech",
		slug: "tech",
		description: "Quiet, well-made electronics."
	},
	{
		id: 3,
		name: "Carry",
		slug: "carry",
		description: "Bags built for the daily route."
	},
	{
		id: 4,
		name: "Accessories",
		slug: "accessories",
		description: "Small things, used every day."
	}
];
var c = (slug) => fixtureCategories.find((x) => x.slug === slug);
var base = (id, name, cat, price, stock, img, description, flags = {}) => ({
	id,
	name,
	slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
	description,
	price,
	category: c(cat),
	stock,
	images: [img, img],
	is_featured: flags.is_featured ?? false,
	is_trending: flags.is_trending ?? false,
	is_active: true
});
var fixtureProducts = [
	base(1, "Stoneware Mug", "home", 890, 42, p_mug_default, "Wheel-thrown stoneware with a matte slate glaze. Holds 350 ml, dishwasher safe, and sits heavy in the hand.", { is_featured: true }),
	base(2, "Arc Desk Lamp", "home", 5490, 8, p_lamp_default, "Powder-coated steel shade on a solid oak base. Warm 2700K LED, flexible neck, 1.8 m fabric cable.", { is_trending: true }),
	base(3, "Bud Vase", "home", 1290, 0, p_vase_default, "Glazed ceramic in soft cream, sized for a few stems of dried grass or a single bloom.", {}),
	base(4, "Studio Earbuds", "tech", 7990, 25, p_earbuds_default, "Active noise cancellation, 28 hours with the case, and a fit that disappears. USB-C and wireless charging.", {
		is_featured: true,
		is_trending: true
	}),
	base(5, "Pocket Speaker", "tech", 3490, 14, p_speaker_default, "Room-filling sound from a palm-sized body wrapped in woven fabric. IP67, 12-hour battery.", { is_trending: true }),
	base(6, "Oak Charging Stand", "tech", 2990, 3, p_charger_default, "15W wireless charging on a solid oak block with a felt cradle. Works in portrait or landscape.", {}),
	base(7, "Linen Tote", "carry", 1490, 60, p_tote_default, "Heavyweight washed linen with reinforced straps and an inside slip pocket.", { is_featured: true }),
	base(8, "Daypack 18L", "carry", 4990, 11, p_backpack_default, "Waxed canvas body, padded 15\" laptop sleeve, and brass-tone zips that age well.", { is_trending: true }),
	base(9, "Felt Laptop Sleeve", "carry", 2290, 19, p_sleeve_default, "Dense merino felt with a leather closure tab. Fits 13–14\" laptops.", {}),
	base(10, "Slim Card Wallet", "accessories", 1990, 33, p_wallet_default, "Vegetable-tanned leather, four card slots, a centre pocket for notes. Edge-painted by hand.", { is_featured: true }),
	base(11, "Field Watch", "accessories", 9990, 6, p_watch_default, "38 mm gunmetal case, sapphire crystal, Japanese quartz movement, black leather strap.", {}),
	base(12, "Insulated Bottle", "accessories", 1690, 48, p_bottle_default, "Double-wall steel keeps drinks cold for 24 hours. Oak cap, 600 ml.", { is_trending: true })
];
/** EXAMPLE rows only. Shown in the demo account to illustrate layout — never real orders. */
var exampleOrders = [{
	id: 9001,
	number: "EXAMPLE-0001",
	status: "delivered",
	payment_method: "upi",
	payment_status: "paid",
	created_at: "2026-09-12T10:24:00Z",
	shipping_address: {
		full_name: "Example Customer",
		phone: "+91 00000 00000",
		line1: "Example Street",
		city: "Bengaluru",
		state: "Karnataka",
		postal_code: "560001",
		country: "IN"
	},
	items: [{
		id: 1,
		product_id: 1,
		product_name: "Stoneware Mug",
		quantity: 2,
		unit_price: 890,
		line_total: 1780
	}, {
		id: 2,
		product_id: 10,
		product_name: "Slim Card Wallet",
		quantity: 1,
		unit_price: 1990,
		line_total: 1990
	}],
	subtotal: 3770,
	shipping: 0,
	tax: 0,
	total: 3770,
	customer_email: "example@example.invalid",
	is_example: true
}, {
	id: 9002,
	number: "EXAMPLE-0002",
	status: "processing",
	payment_method: "cod",
	payment_status: "unpaid",
	created_at: "2026-10-02T15:02:00Z",
	shipping_address: {
		full_name: "Example Customer",
		phone: "+91 00000 00000",
		line1: "Example Street",
		city: "Pune",
		state: "Maharashtra",
		postal_code: "411001",
		country: "IN"
	},
	items: [{
		id: 3,
		product_id: 8,
		product_name: "Daypack 18L",
		quantity: 1,
		unit_price: 4990,
		line_total: 4990
	}],
	subtotal: 4990,
	shipping: 0,
	tax: 0,
	total: 4990,
	customer_email: "example@example.invalid",
	is_example: true
}];
/** Mirrors the documented Django filters: search, category, min_price, max_price, ordering, page. */
function queryProducts(all, q, pageSize = 8) {
	let rows = all.filter((p) => p.is_active);
	if (q.search) {
		const s = q.search.trim().toLowerCase();
		rows = rows.filter((p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
	}
	if (q.category) rows = rows.filter((p) => p.category?.slug === q.category);
	if (q.min_price != null) rows = rows.filter((p) => p.price >= q.min_price);
	if (q.max_price != null) rows = rows.filter((p) => p.price <= q.max_price);
	const o = q.ordering;
	if (o) {
		const desc = o.startsWith("-");
		const key = o.replace("-", "");
		rows = [...rows].sort((a, b) => {
			const r = key === "price" ? a.price - b.price : key === "name" ? a.name.localeCompare(b.name) : a.id - b.id;
			return desc ? -r : r;
		});
	}
	const page = Math.max(1, q.page ?? 1);
	const start = (page - 1) * pageSize;
	const results = rows.slice(start, start + pageSize);
	return {
		count: rows.length,
		next: start + pageSize < rows.length ? `?page=${page + 1}` : null,
		previous: page > 1 ? `?page=${page - 1}` : null,
		results
	};
}
var products = fixtureProducts.map((p) => ({ ...p }));
var categories = fixtureCategories.map((c) => ({ ...c }));
var CART_KEY = "forma.demo.cart";
var DEMO_USER_KEY = "forma.demo.session";
var delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
function readLines() {
	if (typeof window === "undefined") return [];
	try {
		const v = JSON.parse(window.localStorage.getItem(CART_KEY) ?? "[]");
		return Array.isArray(v) ? v.filter((line) => line !== null && typeof line === "object" && Number.isSafeInteger(line.id) && Number.isSafeInteger(line.product_id) && Number.isSafeInteger(line.quantity) && line.quantity > 0) : [];
	} catch {
		return [];
	}
}
function writeLines(lines) {
	window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
}
function estimateShipping(subtotal) {
	return subtotal === 0 || subtotal >= 2500 ? 0 : 99;
}
function buildCart() {
	const items = readLines().map((l) => {
		const product = products.find((p) => p.id === l.product_id);
		if (!product) return null;
		return {
			id: l.id,
			product,
			quantity: l.quantity,
			unit_price: product.price,
			line_total: product.price * l.quantity
		};
	}).filter((x) => x !== null);
	const subtotal = items.reduce((s, i) => s + i.line_total, 0);
	const shipping = estimateShipping(subtotal);
	return {
		id: "demo",
		items,
		item_count: items.reduce((s, i) => s + i.quantity, 0),
		subtotal,
		shipping,
		tax: 0,
		total: subtotal + shipping,
		totals_are_estimates: true
	};
}
function checkStock(productId, qty) {
	const p = products.find((x) => x.id === productId);
	if (!p) throw new ApiError("Product not found.", { status: 404 });
	if (!Number.isSafeInteger(qty) || qty < 1) throw new ApiError("Quantity must be a positive whole number.", {
		status: 400,
		fieldErrors: { quantity: ["Must be a positive whole number."] }
	});
	if (qty > p.stock) throw new ApiError(p.stock === 0 ? `${p.name} is out of stock.` : `Only ${p.stock} of ${p.name} available.`, {
		status: 400,
		fieldErrors: { quantity: [`Max ${p.stock}.`] }
	});
}
function readDemoUser() {
	if (typeof window === "undefined") return null;
	try {
		return JSON.parse(window.sessionStorage.getItem(DEMO_USER_KEY) ?? "null");
	} catch {
		return null;
	}
}
function demoUser(email, staff, first = "Demo", last = staff ? "Staff" : "Shopper") {
	const u = {
		id: "demo",
		email,
		first_name: first,
		last_name: last,
		is_staff: staff,
		is_demo: true
	};
	window.sessionStorage.setItem(DEMO_USER_KEY, JSON.stringify(u));
	return u;
}
function requireDemoStaff() {
	if (!readDemoUser()?.is_staff) throw new ApiError("Staff permission required.", { status: 403 });
}
var DJANGO_REQUIRED = "Order placement needs the Django backend. Demo mode does not create orders or take payments.";
var backend = USE_FIXTURES ? {
	mode: "fixture",
	products: {
		async list(q) {
			await delay();
			return queryProducts(products, q);
		},
		async get(id) {
			await delay(150);
			const p = products.find((x) => String(x.id) === String(id) && x.is_active);
			if (!p) throw new ApiError("Product not found.", { status: 404 });
			return p;
		},
		async featured() {
			await delay();
			return products.filter((p) => p.is_featured && p.is_active).slice(0, 4);
		},
		async trending() {
			await delay();
			return products.filter((p) => p.is_trending && p.is_active).slice(0, 4);
		}
	},
	categories: { async list() {
		await delay(120);
		return categories;
	} },
	auth: {
		async login({ email }) {
			await delay();
			return demoUser(email || "demo@forma.invalid", false);
		},
		async register({ email, first_name, last_name }) {
			await delay();
			return demoUser(email || "demo@forma.invalid", false, first_name || "Demo", last_name || "Shopper");
		},
		async startDemo(asStaff) {
			await delay(100);
			return demoUser(asStaff ? "staff@demo.invalid" : "shopper@demo.invalid", asStaff);
		},
		async logout() {
			window.sessionStorage.removeItem(DEMO_USER_KEY);
		},
		async me() {
			return readDemoUser();
		},
		async updateMe(patch) {
			const u = readDemoUser();
			if (!u) throw new ApiError("Not signed in.", { status: 401 });
			const next = {
				...u,
				...patch
			};
			window.sessionStorage.setItem(DEMO_USER_KEY, JSON.stringify(next));
			return next;
		}
	},
	cart: {
		async get() {
			return buildCart();
		},
		async add(productId, quantity) {
			await delay(150);
			checkStock(productId, quantity);
			const lines = readLines();
			const existing = lines.find((l) => l.product_id === productId);
			const nextQty = (existing?.quantity ?? 0) + quantity;
			checkStock(productId, nextQty);
			if (existing) existing.quantity = nextQty;
			else lines.push({
				id: Date.now(),
				product_id: productId,
				quantity
			});
			writeLines(lines);
			return buildCart();
		},
		async update(itemId, quantity) {
			await delay(120);
			const lines = readLines();
			const line = lines.find((l) => l.id === itemId);
			if (!line) throw new ApiError("Cart item not found.", { status: 404 });
			checkStock(line.product_id, quantity);
			line.quantity = quantity;
			writeLines(lines);
			return buildCart();
		},
		async remove(itemId) {
			await delay(120);
			writeLines(readLines().filter((l) => l.id !== itemId));
			return buildCart();
		}
	},
	orders: {
		async list() {
			await delay();
			return readDemoUser() ? exampleOrders : [];
		},
		async get(id) {
			await delay();
			const o = exampleOrders.find((x) => String(x.id) === String(id));
			if (!o) throw new ApiError("Order not found.", { status: 404 });
			return o;
		},
		async create() {
			await delay(300);
			throw new BackendRequiredError(DJANGO_REQUIRED);
		}
	},
	admin: {
		async listProducts() {
			requireDemoStaff();
			await delay();
			return products;
		},
		async createProduct(input) {
			requireDemoStaff();
			const cat = categories.find((c) => c.id === input.category_id) ?? null;
			const p = {
				id: Math.max(0, ...products.map((x) => x.id)) + 1,
				slug: input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
				...input,
				category: cat
			};
			products = [...products, p];
			return p;
		},
		async updateProduct(id, patch) {
			requireDemoStaff();
			const idx = products.findIndex((x) => x.id === id);
			if (idx < 0) throw new ApiError("Not found.", { status: 404 });
			const { category_id, ...rest } = patch;
			const next = {
				...products[idx],
				...rest
			};
			if (category_id !== void 0) next.category = categories.find((c) => c.id === category_id) ?? null;
			products = products.map((x, i) => i === idx ? next : x);
			return next;
		},
		async deleteProduct(id) {
			requireDemoStaff();
			products = products.filter((x) => x.id !== id);
		},
		async createCategory(input) {
			requireDemoStaff();
			const cat = {
				id: Math.max(0, ...categories.map((c) => c.id)) + 1,
				...input
			};
			categories = [...categories, cat];
			return cat;
		},
		async updateCategory(id, patch) {
			requireDemoStaff();
			const current = categories.find((c) => c.id === id);
			if (!current) throw new ApiError("Category not found.", { status: 404 });
			const updated = {
				...current,
				...patch
			};
			categories = categories.map((c) => c.id === id ? updated : c);
			products = products.map((p) => p.category?.id === id ? {
				...p,
				category: updated
			} : p);
			return updated;
		},
		async deleteCategory(id) {
			requireDemoStaff();
			if (products.some((p) => p.category?.id === id)) throw new ApiError("Category still has products. Reassign them first.", { status: 409 });
			categories = categories.filter((c) => c.id !== id);
		},
		async listOrders() {
			requireDemoStaff();
			await delay();
			return exampleOrders;
		},
		async updateOrderStatus() {
			requireDemoStaff();
			throw new BackendRequiredError("Example orders can't be changed. Order status updates need the Django backend.");
		}
	}
} : liveBackend;
var productService = backend.products;
var categoryService = backend.categories;
var authService = backend.auth;
var cartService = backend.cart;
var orderService = backend.orders;
var adminService = backend.admin;
var isFixtureMode = backend.mode === "fixture";
//#endregion
export { cartService as a, onUnauthorized as c, p_earbuds_default as d, p_mug_default as f, authService as i, orderService as l, productService as m, BackendRequiredError as n, categoryService as o, p_wallet_default as p, adminService as r, isFixtureMode as s, ApiError as t, p_backpack_default as u };
