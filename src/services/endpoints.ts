/**
 * Single endpoint map. Paths marked PROPOSED must be confirmed with the Django team
 * (see docs/API_CONTRACT.md). Components never build URLs themselves.
 */
export const endpoints = {
  products: "/api/products/",
  product: (id: number | string) => `/api/products/${id}/`,
  categories: "/api/categories/",

  register: "/api/auth/register/",
  login: "/api/auth/login/",
  logout: "/api/auth/logout/", // PROPOSED
  me: "/api/auth/me/", // PROPOSED
  csrf: "/api/auth/csrf/", // PROPOSED (session strategy only)

  cart: "/api/cart/",
  cartItems: "/api/cart/items/",
  cartItem: (id: number | string) => `/api/cart/items/${id}/`, // PROPOSED

  orders: "/api/orders/",
  order: (id: number | string) => `/api/orders/${id}/`, // PROPOSED

  // Staff (PROPOSED) — must be enforced with IsAdminUser on the server
  adminProducts: "/api/admin/products/",
  adminProduct: (id: number | string) => `/api/admin/products/${id}/`,
  adminCategories: "/api/admin/categories/",
  adminCategory: (id: number | string) => `/api/admin/categories/${id}/`,
  adminOrders: "/api/admin/orders/",
  adminOrder: (id: number | string) => `/api/admin/orders/${id}/`,
} as const;
