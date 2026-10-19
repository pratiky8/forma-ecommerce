"""Explicit sample inventory stored in MySQL, never a frontend fallback."""
CATEGORIES = {
    "home": ("Home", "Considered objects for comfortable spaces."),
    "tech": ("Tech", "Practical technology for work and downtime."),
    "carry": ("Carry", "Everyday bags and protective sleeves."),
    "accessories": ("Accessories", "Useful details for your daily routine."),
}

# slug, name, category, INR price, stock, asset, description
PRODUCTS = [
    ("stoneware-mug", "Stoneware Mug", "home", "890.00", 32, "p-mug.jpg", "A 350 ml stoneware mug with a smooth matte glaze and comfortable handle. Dishwasher safe."),
    ("arc-desk-lamp", "Arc Desk Lamp", "home", "5490.00", 8, "p-lamp.jpg", "An adjustable desk lamp with a steel shade, oak base and warm LED light for evening reading."),
    ("ceramic-bud-vase", "Ceramic Bud Vase", "home", "1290.00", 15, "p-vase.jpg", "A softly glazed ceramic vase for a single stem or a small arrangement. Height 18 cm."),
    ("studio-earbuds", "Studio Earbuds", "tech", "7990.00", 20, "p-earbuds.jpg", "Compact wireless earbuds with noise cancellation, USB-C charging and a pocket-sized charging case."),
    ("pocket-speaker", "Pocket Speaker", "tech", "3490.00", 14, "p-speaker.jpg", "A portable Bluetooth speaker with a woven finish and rechargeable battery for music around the home."),
    ("oak-charging-stand", "Oak Charging Stand", "tech", "2990.00", 5, "p-charger.jpg", "A 15 W wireless charging stand with a solid oak base. Supports compatible Qi-enabled phones."),
    ("canvas-market-tote", "Canvas Market Tote", "carry", "1490.00", 40, "p-tote.jpg", "A sturdy cotton canvas tote with reinforced handles and an inside pocket for everyday essentials."),
    ("commuter-backpack", "Commuter Backpack", "carry", "6490.00", 11, "p-backpack.jpg", "A practical 20 litre backpack with a padded laptop compartment and organised storage for daily travel."),
    ("felt-laptop-sleeve", "Felt Laptop Sleeve", "carry", "1890.00", 22, "p-sleeve.jpg", "A lightweight felt sleeve with a soft lining, sized for most 13 inch laptops. Check device dimensions before purchase."),
    ("slim-leather-wallet", "Slim Leather Wallet", "accessories", "2490.00", 18, "p-wallet.jpg", "A compact leather wallet with six card slots and a central compartment for folded notes."),
    ("everyday-field-watch", "Everyday Field Watch", "accessories", "8990.00", 7, "p-watch.jpg", "A clear dial quartz watch with a brushed steel case and an adjustable fabric strap for everyday wear."),
    ("insulated-water-bottle", "Insulated Water Bottle", "accessories", "1690.00", 36, "p-bottle.jpg", "A reusable 750 ml stainless steel bottle with double-wall insulation and a secure screw-top lid."),
]
