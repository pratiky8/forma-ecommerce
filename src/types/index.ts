export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | undefined;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: Category | null;
  stock: number;
  images: string[];
  is_featured: boolean;
  is_trending: boolean;
  is_active: boolean;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type Ordering = "" | "price" | "-price" | "name" | "-name" | "-created_at";

export interface ProductQuery {
  search?: string | undefined;
  category?: string | undefined;
  min_price?: number | undefined;
  max_price?: number | undefined;
  ordering?: Ordering | undefined;
  page?: number | undefined;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Cart {
  id: number | string;
  items: CartItem[];
  item_count: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  /** true when totals were computed in the browser (fixture mode only) — never authoritative */
  totals_are_estimates: boolean;
}

export interface User {
  id: number | string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  /** true for transient fixture-mode demo sessions */
  is_demo?: boolean | undefined;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  line1: string;
  line2?: string | undefined;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export type PaymentMethod = "cod" | "upi" | "card";

export type OrderStatus =
  | "pending"
  | "awaiting_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Order {
  id: number;
  number: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: "unpaid" | "pending" | "paid" | "failed" | "refunded";
  created_at: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  customer_email?: string | undefined;
  /** fixture-only marker: example rows, not real orders */
  is_example?: boolean | undefined;
}

export interface CheckoutPayload {
  shipping_address: ShippingAddress;
  payment_method: PaymentMethod;
  /** idempotency key so a retried submission cannot create a duplicate order */
  client_reference: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  category_id: number | null;
  stock: number;
  is_featured: boolean;
  is_trending: boolean;
  is_active: boolean;
  images: string[];
}

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string | undefined;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterInput extends Credentials {
  first_name: string;
  last_name: string;
}
