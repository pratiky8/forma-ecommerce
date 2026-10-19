/** DEVELOPMENT FIXTURES — illustrative catalogue for demo mode only. Not real inventory. */
import mug from "@/assets/p-mug.jpg";
import lamp from "@/assets/p-lamp.jpg";
import vase from "@/assets/p-vase.jpg";
import earbuds from "@/assets/p-earbuds.jpg";
import speaker from "@/assets/p-speaker.jpg";
import charger from "@/assets/p-charger.jpg";
import tote from "@/assets/p-tote.jpg";
import backpack from "@/assets/p-backpack.jpg";
import sleeve from "@/assets/p-sleeve.jpg";
import wallet from "@/assets/p-wallet.jpg";
import watch from "@/assets/p-watch.jpg";
import bottle from "@/assets/p-bottle.jpg";
import type { Category, Order, Product } from "@/types";

export const fixtureCategories: Category[] = [
  { id: 1, name: "Home", slug: "home", description: "Objects for slower mornings." },
  { id: 2, name: "Tech", slug: "tech", description: "Quiet, well-made electronics." },
  { id: 3, name: "Carry", slug: "carry", description: "Bags built for the daily route." },
  { id: 4, name: "Accessories", slug: "accessories", description: "Small things, used every day." },
];

const c = (slug: string) => fixtureCategories.find((x) => x.slug === slug)!;

const base = (
  id: number,
  name: string,
  cat: string,
  price: number,
  stock: number,
  img: string,
  description: string,
  flags: Partial<Pick<Product, "is_featured" | "is_trending">> = {},
): Product => ({
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
  is_active: true,
});

export const fixtureProducts: Product[] = [
  base(
    1,
    "Stoneware Mug",
    "home",
    890,
    42,
    mug,
    "Wheel-thrown stoneware with a matte slate glaze. Holds 350 ml, dishwasher safe, and sits heavy in the hand.",
    { is_featured: true },
  ),
  base(
    2,
    "Arc Desk Lamp",
    "home",
    5490,
    8,
    lamp,
    "Powder-coated steel shade on a solid oak base. Warm 2700K LED, flexible neck, 1.8 m fabric cable.",
    { is_trending: true },
  ),
  base(
    3,
    "Bud Vase",
    "home",
    1290,
    0,
    vase,
    "Glazed ceramic in soft cream, sized for a few stems of dried grass or a single bloom.",
    {},
  ),
  base(
    4,
    "Studio Earbuds",
    "tech",
    7990,
    25,
    earbuds,
    "Active noise cancellation, 28 hours with the case, and a fit that disappears. USB-C and wireless charging.",
    { is_featured: true, is_trending: true },
  ),
  base(
    5,
    "Pocket Speaker",
    "tech",
    3490,
    14,
    speaker,
    "Room-filling sound from a palm-sized body wrapped in woven fabric. IP67, 12-hour battery.",
    { is_trending: true },
  ),
  base(
    6,
    "Oak Charging Stand",
    "tech",
    2990,
    3,
    charger,
    "15W wireless charging on a solid oak block with a felt cradle. Works in portrait or landscape.",
    {},
  ),
  base(
    7,
    "Linen Tote",
    "carry",
    1490,
    60,
    tote,
    "Heavyweight washed linen with reinforced straps and an inside slip pocket.",
    { is_featured: true },
  ),
  base(
    8,
    "Daypack 18L",
    "carry",
    4990,
    11,
    backpack,
    'Waxed canvas body, padded 15" laptop sleeve, and brass-tone zips that age well.',
    { is_trending: true },
  ),
  base(
    9,
    "Felt Laptop Sleeve",
    "carry",
    2290,
    19,
    sleeve,
    'Dense merino felt with a leather closure tab. Fits 13–14" laptops.',
    {},
  ),
  base(
    10,
    "Slim Card Wallet",
    "accessories",
    1990,
    33,
    wallet,
    "Vegetable-tanned leather, four card slots, a centre pocket for notes. Edge-painted by hand.",
    { is_featured: true },
  ),
  base(
    11,
    "Field Watch",
    "accessories",
    9990,
    6,
    watch,
    "38 mm gunmetal case, sapphire crystal, Japanese quartz movement, black leather strap.",
    {},
  ),
  base(
    12,
    "Insulated Bottle",
    "accessories",
    1690,
    48,
    bottle,
    "Double-wall steel keeps drinks cold for 24 hours. Oak cap, 600 ml.",
    { is_trending: true },
  ),
];

/** EXAMPLE rows only. Shown in the demo account to illustrate layout — never real orders. */
export const exampleOrders: Order[] = [
  {
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
      country: "IN",
    },
    items: [
      {
        id: 1,
        product_id: 1,
        product_name: "Stoneware Mug",
        quantity: 2,
        unit_price: 890,
        line_total: 1780,
      },
      {
        id: 2,
        product_id: 10,
        product_name: "Slim Card Wallet",
        quantity: 1,
        unit_price: 1990,
        line_total: 1990,
      },
    ],
    subtotal: 3770,
    shipping: 0,
    tax: 0,
    total: 3770,
    customer_email: "example@example.invalid",
    is_example: true,
  },
  {
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
      country: "IN",
    },
    items: [
      {
        id: 3,
        product_id: 8,
        product_name: "Daypack 18L",
        quantity: 1,
        unit_price: 4990,
        line_total: 4990,
      },
    ],
    subtotal: 4990,
    shipping: 0,
    tax: 0,
    total: 4990,
    customer_email: "example@example.invalid",
    is_example: true,
  },
];
