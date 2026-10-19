import type {
  Cart,
  Category,
  CategoryInput,
  CheckoutPayload,
  Credentials,
  Order,
  OrderStatus,
  Paginated,
  Product,
  ProductInput,
  ProductQuery,
  RegisterInput,
  User,
} from "@/types";

/** Contract every adapter (live Django, dev fixtures) implements. */
export interface Backend {
  mode: "live" | "fixture";
  products: {
    list(q: ProductQuery): Promise<Paginated<Product>>;
    get(id: number | string): Promise<Product>;
    featured(): Promise<Product[]>;
    trending(): Promise<Product[]>;
  };
  categories: { list(): Promise<Category[]> };
  auth: {
    login(c: Credentials): Promise<User>;
    register(r: RegisterInput): Promise<User>;
    logout(): Promise<void>;
    me(): Promise<User | null>;
    updateMe(patch: Partial<Pick<User, "first_name" | "last_name">>): Promise<User>;
    /** fixture only */
    startDemo?(asStaff: boolean): Promise<User>;
  };
  cart: {
    get(): Promise<Cart>;
    add(productId: number, quantity: number): Promise<Cart>;
    update(itemId: number, quantity: number): Promise<Cart>;
    remove(itemId: number): Promise<Cart>;
  };
  orders: {
    list(): Promise<Order[]>;
    get(id: number | string): Promise<Order>;
    create(p: CheckoutPayload): Promise<Order>;
  };
  admin: {
    listProducts(): Promise<Product[]>;
    createProduct(p: ProductInput): Promise<Product>;
    updateProduct(id: number, p: Partial<ProductInput>): Promise<Product>;
    deleteProduct(id: number): Promise<void>;
    createCategory(c: CategoryInput): Promise<Category>;
    updateCategory(id: number, c: Partial<CategoryInput>): Promise<Category>;
    deleteCategory(id: number): Promise<void>;
    listOrders(): Promise<Order[]>;
    updateOrderStatus(id: number, status: OrderStatus): Promise<Order>;
  };
}
