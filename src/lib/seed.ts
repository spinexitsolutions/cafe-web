import type {
  CafeEvent,
  Category,
  Coupon,
  Customer,
  CrmActivity,
  DB,
  Faq,
  GalleryItem,
  Message,
  Order,
  OrderStatus,
  Post,
  Product,
  Reservation,
  Review,
  Settings,
  Testimonial,
  VariantGroup,
} from "./types";

export const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Verified Unsplash photo ids, keyed by what they show. */
export const IMG = {
  cheers: "1495474472287-4d71bcdd2085",
  pourOver: "1442512595331-e89e73853f31",
  beans: "1442550528053-c431ecb55509",
  beansTexture: "1447933601403-0c6688de566e",
  beansBowl: "1587734195503-904fca47e0e9",
  interiorBar: "1442975631115-c4f7b05b8a2c",
  interiorWindow: "1445116572660-236099ec97a0",
  counter: "1453614512568-c4024d13c247",
  icedCoffee: "1461023058943-07fcbe16d735",
  frenchToast: "1484723091739-30a097e8f929",
  latteHeart: "1485808191679-5f86510681a2",
  parfait: "1488477181946-6428a0291777",
  pancakesDark: "1490457843367-34b21b6ccd85",
  blackLeaves: "1494314671902-399b18174975",
  tarts: "1495147466023-ac5c588e2e94",
  steamingCup: "1497515114629-f71d768fd07c",
  latteWood: "1497636577773-f1231844b336",
  espressoTools: "1497935586351-b67a49e012bf",
  cupsCircle: "1498804103079-a6351b050096",
  cafeSign: "1501339847302-ac426a4a7cbb",
  macarons: "1501747315-124a0eaca060",
  brunch: "1504754524776-8f4f37790ca0",
  cappuccinoDark: "1506372023823-741c83b836fe",
  twoLattes: "1507133750040-4a8f57021571",
  cappuccinos: "1509042239860-f550ce710b93",
  bread: "1509440159596-0249088772ff",
  portafilter: "1511920170033-f8396924c348",
  saladBowl: "1512621776951-a57141f2eefd",
  pizza: "1513104890138-7c749659a591",
  limeSoda: "1513558161293-cdaf765ed2fd",
  flatWhite: "1514066558159-fc8c737ef259",
  americano: "1514432324607-a09d9b4aefdd",
  matcha: "1515823064-d6e0c04616a7",
  interiorDark: "1517248135467-4c7edcad34c4",
  icedLatte: "1517701604599-bb29b565090c",
  interiorWood: "1521017432531-fbd92d768814",
  glassCoffee: "1521302080334-4bebac2763a6",
  eggToast: "1525351484163-7529414344d8",
  sandwich: "1528735602780-2552fd46c7af",
  latteTable: "1534778101976-62847782c213",
  matchaLaptop: "1536256263959-770b48d82b0a",
  milkPour: "1541167760496-1628856ab772",
  chai: "1544787219-7f47ccb76574",
  burger: "1550547660-d9450f859349",
  donuts: "1551024601-bec78aea704b",
  interiorPlants: "1554118811-1e0d58224f24",
  croissant: "1555507036-ab1f4038808a",
  teaSet: "1558160074-4d7d8bdf4256",
  coffeeBag: "1559056199-641a0ac8b55e",
  counterBright: "1559305616-3f99cd43e353",
  cortado: "1559496417-e7f25cb247f3",
  streetCafe: "1559925393-8be0ec4767c8",
  freakshake: "1563805042-7684c019e1cb",
  raspberryCake: "1565958011703-44f9829ba187",
  pancakeStack: "1567620905732-2d1ec7ab7445",
  pastries: "1568254183919-78a4f43a2877",
  gelato: "1570197788417-0e82375c9371",
  cappuccinoTop: "1572442388796-11668a67e53d",
  chocCake: "1578985545062-69928b1d9587",
  orangeJuice: "1600271886742-f049cd451bba",
  brownie: "1606312619070-d48b4c652a52",
  espresso: "1610889556528-9a770e32642f",
  grinderBag: "1611854779393-1b2da9d400fe",
  lemonade: "1621263764928-df1444c5e859",
  dinner: "1414235077428-338989a2e8c0",
  avatarW1: "1438761681033-6461ffad8d80",
  avatarW2: "1494790108377-be9c29b29330",
  avatarW3: "1544005313-94ddf0286df2",
  avatarM1: "1500648767791-00dcc994a43e",
  avatarM2: "1507003211169-0a1dd7228f2d",
} as const;

const now = () => new Date();
const daysAgo = (d: number, h = 10) => {
  const t = now();
  t.setDate(t.getDate() - d);
  t.setHours(h, (d * 17) % 60, 0, 0);
  return t.toISOString();
};
const daysAhead = (d: number) => {
  const t = now();
  t.setDate(t.getDate() + d);
  return t.toISOString().slice(0, 10);
};

/* ---------------------------------- Variants --------------------------------- */

const size: VariantGroup = {
  id: "size",
  name: "Size",
  options: [
    { id: "s", label: "Small · 8oz", priceDelta: 0 },
    { id: "r", label: "Regular · 12oz", priceDelta: 40 },
    { id: "l", label: "Large · 16oz", priceDelta: 80 },
  ],
};
const milk: VariantGroup = {
  id: "milk",
  name: "Milk",
  options: [
    { id: "whole", label: "Whole milk", priceDelta: 0 },
    { id: "oat", label: "Oat milk", priceDelta: 50 },
    { id: "almond", label: "Almond milk", priceDelta: 50 },
    { id: "skim", label: "Skimmed", priceDelta: 0 },
  ],
};
const extras: VariantGroup = {
  id: "extra",
  name: "Make it yours",
  options: [
    { id: "none", label: "As is", priceDelta: 0 },
    { id: "shot", label: "Extra shot", priceDelta: 60 },
    { id: "vanilla", label: "Madagascar vanilla", priceDelta: 40 },
    { id: "caramel", label: "Salted caramel", priceDelta: 40 },
  ],
};
const weight: VariantGroup = {
  id: "weight",
  name: "Weight",
  options: [
    { id: "250", label: "250 g", priceDelta: 0 },
    { id: "500", label: "500 g", priceDelta: 590 },
    { id: "1000", label: "1 kg", priceDelta: 1490 },
  ],
};
const grind: VariantGroup = {
  id: "grind",
  name: "Grind",
  options: [
    { id: "whole", label: "Whole bean", priceDelta: 0 },
    { id: "espresso", label: "Espresso", priceDelta: 0 },
    { id: "filter", label: "Pour over", priceDelta: 0 },
    { id: "french", label: "French press", priceDelta: 0 },
  ],
};

/* --------------------------------- Categories -------------------------------- */

export const seedCategories: Category[] = [
  { id: "c-espresso", name: "Espresso Bar", slug: "espresso", type: "menu", order: 1 },
  { id: "c-slow", name: "Slow Bar", slug: "slow-bar", type: "menu", order: 2 },
  { id: "c-notcoffee", name: "Not Coffee", slug: "not-coffee", type: "menu", order: 3 },
  { id: "c-bakery", name: "Bakery", slug: "bakery", type: "menu", order: 4 },
  { id: "c-brunch", name: "All-Day Brunch", slug: "brunch", type: "menu", order: 5 },
  { id: "c-dessert", name: "Desserts", slug: "desserts", type: "menu", order: 6 },
  { id: "c-beans", name: "Coffee Beans", slug: "beans", type: "shop", order: 1 },
  { id: "c-gear", name: "Brew Gear", slug: "gear", type: "shop", order: 2 },
  { id: "c-gifts", name: "Gifts & Merch", slug: "gifts", type: "shop", order: 3 },
];

/* ---------------------------------- Products --------------------------------- */

type P = Omit<Product, "id" | "createdAt" | "gallery" | "active" | "longDescription" | "reviewCount" | "rating"> &
  Partial<Pick<Product, "gallery" | "longDescription" | "reviewCount" | "rating">>;

const mk = (p: P, i: number): Product => ({
  id: `p-${p.slug}`,
  active: true,
  gallery: p.gallery ?? [],
  longDescription:
    p.longDescription ??
    `${p.description} Crafted in small batches every morning at our atelier, using ingredients we trace back to the farm — because the best things are made slowly, with care.`,
  reviewCount: p.reviewCount ?? 20 + ((i * 37) % 180),
  rating: p.rating ?? 4.5 + ((i * 7) % 5) / 10,
  createdAt: daysAgo(60 - i),
  ...p,
});

const rawProducts: P[] = [
  // Espresso bar
  { slug: "aura-flat-white", name: "Aura Flat White", type: "menu", categoryId: "c-espresso", price: 240, description: "Double ristretto, velvet micro-foam, a whisper of cocoa.", image: img(IMG.flatWhite, 900), tags: ["signature", "bestseller"], stock: 999, featured: true, variants: [size, milk, extras], calories: 120, notes: "Cocoa · Hazelnut · Honey", gallery: [img(IMG.milkPour, 900), img(IMG.latteTable, 900)] },
  { slug: "honey-cinnamon-latte", name: "Honey Cinnamon Latte", type: "menu", categoryId: "c-espresso", price: 280, description: "Wild forest honey, Ceylon cinnamon and silky espresso.", image: img(IMG.latteWood, 900), tags: ["signature", "seasonal"], stock: 999, featured: true, variants: [size, milk, extras], calories: 190, notes: "Warm spice · Floral · Caramel" },
  { slug: "classic-cappuccino", name: "Classic Cappuccino", type: "menu", categoryId: "c-espresso", price: 220, description: "Equal parts espresso, milk and cloud-like foam.", image: img(IMG.cappuccinoTop, 900), tags: ["bestseller"], stock: 999, featured: false, variants: [size, milk, extras], calories: 110 },
  { slug: "cortado", name: "Cortado", type: "menu", categoryId: "c-espresso", price: 200, description: "Short, strong and perfectly balanced with warm milk.", image: img(IMG.cortado, 900), tags: [], stock: 999, featured: false, variants: [milk, extras], calories: 70 },
  { slug: "single-origin-espresso", name: "Single Origin Espresso", type: "menu", categoryId: "c-espresso", price: 170, description: "Rotating micro-lot pulled as a syrupy double shot.", image: img(IMG.espresso, 900), tags: ["vegan"], stock: 999, featured: false, variants: [extras], calories: 5, notes: "Changes weekly" },
  { slug: "iced-spanish-latte", name: "Iced Spanish Latte", type: "menu", categoryId: "c-espresso", price: 290, description: "Condensed milk, chilled espresso, poured over clear ice.", image: img(IMG.icedLatte, 900), tags: ["bestseller", "signature"], stock: 999, featured: true, variants: [size, milk, extras], calories: 230 },
  // Slow bar
  { slug: "v60-pour-over", name: "V60 Pour Over", type: "menu", categoryId: "c-slow", price: 260, description: "Hand-poured filter, brewed to order in four minutes.", image: img(IMG.pourOver, 900), tags: ["vegan"], stock: 999, featured: true, variants: [], calories: 5, notes: "Bright · Clean · Tea-like" },
  { slug: "nitro-cold-brew", name: "18-hour Cold Brew", type: "menu", categoryId: "c-slow", price: 270, description: "Steeped for 18 hours, served on tap, impossibly smooth.", image: img(IMG.icedCoffee, 900), tags: ["vegan", "bestseller"], stock: 999, featured: true, variants: [size], calories: 10 },
  { slug: "black-americano", name: "Long Black", type: "menu", categoryId: "c-slow", price: 180, description: "Double espresso over hot water. Honest and bold.", image: img(IMG.americano, 900), tags: ["vegan"], stock: 999, featured: false, variants: [size, extras], calories: 10 },
  { slug: "glass-filter", name: "Chemex for Two", type: "menu", categoryId: "c-slow", price: 420, description: "A slow, shareable carafe of our featured filter roast.", image: img(IMG.glassCoffee, 900), tags: ["vegan", "new"], stock: 999, featured: false, variants: [], calories: 10 },
  // Not coffee
  { slug: "ceremonial-matcha", name: "Ceremonial Matcha", type: "menu", categoryId: "c-notcoffee", price: 310, description: "Uji matcha whisked by hand, with steamed oat milk.", image: img(IMG.matcha, 900), tags: ["signature", "vegan"], stock: 999, featured: true, variants: [size, milk], calories: 140 },
  { slug: "masala-chai", name: "Slow Masala Chai", type: "menu", categoryId: "c-notcoffee", price: 160, description: "Assam leaves simmered with whole spices the slow way.", image: img(IMG.chai, 900), tags: ["bestseller"], stock: 999, featured: false, variants: [size, milk], calories: 150 },
  { slug: "garden-tea", name: "Garden Tea Ritual", type: "menu", categoryId: "c-notcoffee", price: 240, description: "Darjeeling first flush, served in a cast-iron pot.", image: img(IMG.teaSet, 900), tags: ["vegan"], stock: 999, featured: false, variants: [], calories: 0 },
  { slug: "yuzu-lemonade", name: "Yuzu Basil Lemonade", type: "menu", categoryId: "c-notcoffee", price: 220, description: "Sparkling, sour, herbaceous. Summer in a glass.", image: img(IMG.lemonade, 900), tags: ["vegan", "new"], stock: 999, featured: false, variants: [size], calories: 90 },
  { slug: "cold-pressed-orange", name: "Cold-pressed Orange", type: "menu", categoryId: "c-notcoffee", price: 200, description: "Nagpur oranges, pressed to order. Nothing else.", image: img(IMG.orangeJuice, 900), tags: ["vegan"], stock: 999, featured: false, variants: [], calories: 110 },
  // Bakery
  { slug: "butter-croissant", name: "Laminated Butter Croissant", type: "menu", categoryId: "c-bakery", price: 190, description: "81 layers of French butter, baked every two hours.", image: img(IMG.croissant, 900), tags: ["bestseller", "signature"], stock: 40, featured: true, variants: [], calories: 310 },
  { slug: "seasonal-tarts", name: "Seasonal Fruit Tarts", type: "menu", categoryId: "c-bakery", price: 230, description: "Vanilla crème pât, sablé crust, market fruit.", image: img(IMG.tarts, 900), tags: ["seasonal"], stock: 24, featured: false, variants: [], calories: 280 },
  { slug: "sourdough-loaf", name: "Country Sourdough", type: "menu", categoryId: "c-bakery", price: 340, description: "48-hour ferment, crackling crust, open crumb.", image: img(IMG.bread, 900), tags: ["vegan"], stock: 12, featured: false, variants: [], calories: 180 },
  { slug: "pastry-box", name: "Morning Pastry Box", type: "menu", categoryId: "c-bakery", price: 690, description: "Six of today's viennoiserie, boxed to share.", image: img(IMG.pastries, 900), tags: ["new"], stock: 10, featured: false, variants: [], calories: 1400 },
  // Brunch
  { slug: "sunny-sourdough", name: "Sunny Sourdough Toast", type: "menu", categoryId: "c-brunch", price: 380, description: "Smashed avocado, free-range egg, chilli crisp.", image: img(IMG.eggToast, 900), tags: ["bestseller"], stock: 999, featured: true, variants: [], calories: 520 },
  { slug: "brioche-french-toast", name: "Brioche French Toast", type: "menu", categoryId: "c-brunch", price: 420, description: "Caramelised banana, blueberries, maple butter.", image: img(IMG.frenchToast, 900), tags: ["signature"], stock: 999, featured: false, variants: [], calories: 680 },
  { slug: "souffle-pancakes", name: "Soufflé Pancakes", type: "menu", categoryId: "c-brunch", price: 450, description: "Tall, jiggly, golden. With orange blossom syrup.", image: img(IMG.pancakeStack, 900), tags: ["new"], stock: 999, featured: false, variants: [], calories: 610 },
  { slug: "buddha-bowl", name: "Garden Grain Bowl", type: "menu", categoryId: "c-brunch", price: 440, description: "Quinoa, roast veg, chickpeas and tahini dressing.", image: img(IMG.saladBowl, 900), tags: ["vegan", "gluten-free"], stock: 999, featured: false, variants: [], calories: 470 },
  { slug: "pressed-sandwich", name: "Pressed Club Sandwich", type: "menu", categoryId: "c-brunch", price: 400, description: "Smoked chicken, gruyère, pickles on toasted milk bread.", image: img(IMG.sandwich, 900), tags: [], stock: 999, featured: false, variants: [], calories: 590 },
  { slug: "wood-fired-pizza", name: "Wood-fired Margherita", type: "menu", categoryId: "c-brunch", price: 520, description: "San Marzano, fior di latte, basil, olive oil.", image: img(IMG.pizza, 900), tags: [], stock: 999, featured: false, variants: [], calories: 800 },
  // Desserts
  { slug: "raspberry-cake", name: "Raspberry Cloud Cake", type: "menu", categoryId: "c-dessert", price: 320, description: "Chiffon sponge, mascarpone cream, fresh raspberries.", image: img(IMG.raspberryCake, 900), tags: ["signature"], stock: 16, featured: true, variants: [], calories: 420 },
  { slug: "dark-chocolate-cake", name: "70% Dark Chocolate Cake", type: "menu", categoryId: "c-dessert", price: 340, description: "Single-origin chocolate ganache, sea salt.", image: img(IMG.chocCake, 900), tags: ["bestseller"], stock: 16, featured: false, variants: [], calories: 520 },
  { slug: "affogato", name: "Gelato Affogato", type: "menu", categoryId: "c-dessert", price: 280, description: "House vanilla gelato drowned in hot espresso.", image: img(IMG.gelato, 900), tags: [], stock: 999, featured: false, variants: [], calories: 260 },
  { slug: "fudge-brownie", name: "Fudge Brownie Slab", type: "menu", categoryId: "c-dessert", price: 210, description: "Gooey centre, crackled top, toasted walnuts.", image: img(IMG.brownie, 900), tags: [], stock: 30, featured: false, variants: [], calories: 380 },
  // Shop — beans
  { slug: "house-blend-beans", name: "Aura House Blend", type: "shop", categoryId: "c-beans", price: 790, comparePrice: 890, description: "Our everyday blend — chocolate, caramel, toasted almond.", image: img(IMG.coffeeBag, 1000), tags: ["bestseller"], stock: 120, featured: true, variants: [weight, grind], notes: "Medium roast · Chikmagalur + Brazil", gallery: [img(IMG.beans, 1000), img(IMG.beansBowl, 1000)] },
  { slug: "ethiopia-yirgacheffe", name: "Ethiopia Yirgacheffe", type: "shop", categoryId: "c-beans", price: 1150, description: "Washed heirloom lots. Jasmine, bergamot, peach.", image: img(IMG.beansBowl, 1000), tags: ["new"], stock: 40, featured: true, variants: [weight, grind], notes: "Light roast · Washed · 2,100 masl", gallery: [img(IMG.beansTexture, 1000)] },
  { slug: "monsoon-malabar", name: "Monsoon Malabar", type: "shop", categoryId: "c-beans", price: 890, description: "Aged in monsoon winds. Earthy, spiced, low acidity.", image: img(IMG.beans, 1000), tags: [], stock: 60, featured: false, variants: [weight, grind], notes: "Dark roast · India" },
  { slug: "decaf-swiss", name: "Swiss Water Decaf", type: "shop", categoryId: "c-beans", price: 950, description: "All of the flavour, none of the buzz.", image: img(IMG.beansTexture, 1000), tags: [], stock: 25, featured: false, variants: [weight, grind], notes: "Medium roast · Colombia" },
  // Shop — gear
  { slug: "home-grinder-kit", name: "Home Grinder & Beans Kit", type: "shop", categoryId: "c-gear", price: 6490, comparePrice: 7490, description: "Burr grinder plus 250g of house blend to start.", image: img(IMG.grinderBag, 1000), tags: ["bestseller"], stock: 14, featured: true, variants: [], gallery: [img(IMG.coffeeBag, 1000)] },
  { slug: "pour-over-set", name: "Glass Pour Over Set", type: "shop", categoryId: "c-gear", price: 3290, description: "Borosilicate dripper, carafe and 100 filters.", image: img(IMG.pourOver, 1000), tags: ["new"], stock: 22, featured: false, variants: [] },
  { slug: "barista-tool-kit", name: "Barista Tool Kit", type: "shop", categoryId: "c-gear", price: 4590, description: "Tamper, distributor, knock box and dosing cup.", image: img(IMG.espressoTools, 1000), tags: [], stock: 9, featured: false, variants: [] },
  { slug: "portafilter-basket", name: "Precision Portafilter", type: "shop", categoryId: "c-gear", price: 2790, description: "Bottomless 58mm portafilter with precision basket.", image: img(IMG.portafilter, 1000), tags: [], stock: 0, featured: false, variants: [] },
  // Shop — gifts
  { slug: "gift-card", name: "Aura Gift Card", type: "shop", categoryId: "c-gifts", price: 1000, description: "The gift of good mornings. Delivered by email.", image: img(IMG.cheers, 1000), tags: ["bestseller"], stock: 999, featured: true, variants: [{ id: "amount", name: "Amount", options: [{ id: "1000", label: "₹1,000", priceDelta: 0 }, { id: "2500", label: "₹2,500", priceDelta: 1500 }, { id: "5000", label: "₹5,000", priceDelta: 4000 }] }] },
  { slug: "macaron-box", name: "Coffee & Macaron Box", type: "shop", categoryId: "c-gifts", price: 1490, description: "250g beans, 12 French macarons, a handwritten note.", image: img(IMG.macarons, 1000), tags: ["seasonal"], stock: 18, featured: false, variants: [] },
  { slug: "ceramic-cup-set", name: "Stoneware Cup Set", type: "shop", categoryId: "c-gifts", price: 1890, description: "Two hand-thrown cups from our potter friends in Pondicherry.", image: img(IMG.steamingCup, 1000), tags: [], stock: 30, featured: false, variants: [] },
];

export const seedProducts: Product[] = rawProducts.map(mk);

/* ---------------------------------- Settings --------------------------------- */

export const seedSettings: Settings = {
  site: {
    name: "Aura Coffee Atelier",
    shortName: "aura",
    tagline: "Slow coffee for fast cities.",
    email: "hello@auracoffee.in",
    phone: "+91 98765 43210",
    whatsapp: "919876543210",
    instagram: "auracoffee.atelier",
    address: "14 Linking Road, Bandra West",
    city: "Mumbai 400050",
    mapQuery: "Linking Road Bandra West Mumbai",
    currency: "₹",
    taxRate: 5,
    deliveryFee: 49,
    freeDeliveryAbove: 799,
    minOrder: 150,
    acceptingOrders: true,
    hours: [
      { day: "Monday", open: "07:30", close: "22:00", closed: false },
      { day: "Tuesday", open: "07:30", close: "22:00", closed: false },
      { day: "Wednesday", open: "07:30", close: "22:00", closed: false },
      { day: "Thursday", open: "07:30", close: "22:00", closed: false },
      { day: "Friday", open: "07:30", close: "23:30", closed: false },
      { day: "Saturday", open: "08:00", close: "23:30", closed: false },
      { day: "Sunday", open: "08:00", close: "21:00", closed: false },
    ],
  },
  announcement: { enabled: true, text: "New — Honey Cinnamon Latte is back for winter. Use AURA10 for 10% off your first order.", href: "/menu" },
  theme: {
    accent: "#e8432d",
    background: "#f4f2ee",
    ink: "#14110f",
    surface: "#ffffff",
    displayFont: "bricolage",
    radius: 24,
  },
  intro: {
    enabled: true,
    style: "curtain",
    words: ["Picked.", "Roasted.", "Pulled.", "Aura."],
    duration: 2.6,
    oncePerSession: true,
  },
  nav: {
    links: [
      { id: "n1", label: "Menu", href: "/menu" },
      { id: "n2", label: "Shop", href: "/shop" },
      { id: "n3", label: "Reserve", href: "/reserve" },
      { id: "n4", label: "Events", href: "/events" },
      { id: "n5", label: "Journal", href: "/journal" },
      { id: "n6", label: "About", href: "/about" },
      { id: "n7", label: "Contact", href: "/contact" },
    ],
    ctaLabel: "Order now",
    ctaHref: "/menu",
  },
  hero: {
    eyebrow: "Specialty coffee · Bandra, Mumbai",
    title: "Coffee is",
    titleItalic: "a fruit.",
    subtitle:
      "Every cup starts as a ripe red cherry on a hillside in Chikmagalur. We roast it ourselves, pull it by hand and serve it in a room built for lingering.",
    image: img(IMG.milkPour, 1800),
    secondaryImage: img(IMG.beans, 600),
    ctaPrimary: { label: "Order ahead", href: "/menu" },
    ctaSecondary: { label: "Book a table", href: "/reserve" },
    autoplay: 5,
    slides: [
      { id: "hs1", productId: "p-aura-flat-white", bg: "#ead9c6", ink: "#2a190e", pop: "#c4471f" },
      { id: "hs2", productId: "p-ceremonial-matcha", bg: "#d4e4bb", ink: "#17240c", pop: "#2f6b16" },
      { id: "hs3", productId: "p-iced-spanish-latte", bg: "#f6cdb0", ink: "#3a170a", pop: "#e2361f" },
      { id: "hs4", productId: "p-nitro-cold-brew", bg: "#1d1411", ink: "#f6ebe0", pop: "#ff6a3d" },
    ],
  },
  story: {
    eyebrow: "Our story",
    statement:
      "We started with one machine, one grinder and an obsession — to serve the kind of cup that makes you stop scrolling and simply sit.",
    body: "Every bean we pour is traced to the farm it came from. We roast twice a week in small batches, so what reaches your cup is never more than ten days off the roaster. Our bakers start at 4am. Our baristas train for months. It's slow — and that's the point.",
    image: img(IMG.interiorPlants, 1400),
    stats: [
      { value: "12", label: "Partner farms" },
      { value: "10d", label: "Max roast age" },
      { value: "81", label: "Croissant layers" },
      { value: "4.9", label: "Google rating" },
    ],
  },
  marquee: ["Single origin", "Roasted in-house", "Laminated by hand", "Oat milk at no fuss", "Open till late", "Dog friendly"],
  experience: [
    { title: "The slow bar", text: "Pull up a stool and watch your pour over bloom. Ask us anything.", image: img(IMG.pourOver, 1000) },
    { title: "Garden seating", text: "Sun-dappled tables under a neem tree, for long Sunday brunches.", image: img(IMG.interiorWindow, 1000) },
    { title: "Work-friendly", text: "Fast Wi-Fi, outlets at every seat and coffee refills on the house.", image: img(IMG.matchaLaptop, 1000) },
  ],
  sections: [
    { key: "marquee", label: "Marquee ticker", enabled: true },
    { key: "story", label: "Story (scroll reveal)", enabled: true },
    { key: "signature", label: "Signature drinks (horizontal scroll)", enabled: true },
    { key: "menuPreview", label: "Menu preview", enabled: true },
    { key: "experience", label: "Experience", enabled: true },
    { key: "shop", label: "Shop highlight", enabled: true },
    { key: "events", label: "Upcoming events", enabled: true },
    { key: "testimonials", label: "Testimonials", enabled: true },
    { key: "gallery", label: "Gallery", enabled: true },
    { key: "journal", label: "Journal", enabled: true },
    { key: "reserve", label: "Reservation CTA", enabled: true },
    { key: "newsletter", label: "Newsletter", enabled: true },
  ],
  loyalty: { enabled: true, pointsPer100: 5, rewardText: "Earn 5 Aura points for every ₹100. 100 points = a free drink." },
  seo: {
    title: "Aura Coffee Atelier — Specialty coffee in Bandra, Mumbai",
    description: "Single-origin coffee, hand-laminated pastries and all-day brunch. Order online, book a table or shop beans & gear.",
  },
  footer: { note: "Made slowly, in Mumbai." },
};

/* ------------------------------ Content / CMS -------------------------------- */

export const seedCoupons: Coupon[] = [
  { id: "cp1", code: "AURA10", type: "percent", value: 10, minOrder: 0, active: true, uses: 42, description: "10% off your first order" },
  { id: "cp2", code: "BREW200", type: "flat", value: 200, minOrder: 1500, active: true, uses: 11, description: "₹200 off orders above ₹1,500" },
  { id: "cp3", code: "MONSOON25", type: "percent", value: 25, minOrder: 999, active: false, uses: 87, description: "Monsoon sale — expired" },
];

export const seedTestimonials: Testimonial[] = [
  { id: "t1", name: "Ananya Rao", role: "Regular since 2022", quote: "The flat white here ruined every other café for me. The room is calm, the staff remember my order, and the croissants are criminally good.", avatar: img(IMG.avatarW2, 200), rating: 5 },
  { id: "t2", name: "Kabir Mehta", role: "Designer, works from Aura", quote: "My unofficial office. Great Wi-Fi, beautiful light, and the cold brew keeps me going through deadlines.", avatar: img(IMG.avatarM1, 200), rating: 5 },
  { id: "t3", name: "Sara Fernandes", role: "Food writer", quote: "A café that takes coffee as seriously as a wine bar — without any of the snobbery. Ask for the slow bar.", avatar: img(IMG.avatarW1, 200), rating: 5 },
  { id: "t4", name: "Rohan Kapoor", role: "Ordered beans online", quote: "Beans arrived three days off roast with brewing notes handwritten on the bag. That's the kind of detail I love.", avatar: img(IMG.avatarM2, 200), rating: 5 },
  { id: "t5", name: "Meera Iyer", role: "Hosted a birthday", quote: "We booked the private corner for twelve. Flawless service, a surprise cake and the best evening of the year.", avatar: img(IMG.avatarW3, 200), rating: 5 },
];

export const seedGallery: GalleryItem[] = [
  { id: "g1", image: img(IMG.interiorBar, 1200), caption: "The bar at golden hour", span: "wide" },
  { id: "g2", image: img(IMG.milkPour, 900), caption: "Latte art, every time", span: "tall" },
  { id: "g3", image: img(IMG.pastries, 900), caption: "Morning bake", span: "square" },
  { id: "g4", image: img(IMG.cupsCircle, 900), caption: "Cupping Fridays", span: "square" },
  { id: "g5", image: img(IMG.streetCafe, 900), caption: "Street-side seating", span: "tall" },
  { id: "g6", image: img(IMG.brunch, 1200), caption: "Sunday brunch spread", span: "wide" },
  { id: "g7", image: img(IMG.counterBright, 900), caption: "The counter", span: "square" },
  { id: "g8", image: img(IMG.blackLeaves, 900), caption: "Black, no sugar", span: "square" },
];

export const seedFaqs: Faq[] = [
  { id: "f1", q: "Do you take reservations?", a: "Yes — book online for up to 12 guests. For larger groups or private events, drop us a message and we'll tailor something for you." },
  { id: "f2", q: "Do you deliver?", a: "We deliver within 6 km of Bandra from 8am to 10pm. Delivery is free on orders above ₹799." },
  { id: "f3", q: "Are there vegan and gluten-free options?", a: "Plenty. Every drink can be made with oat or almond milk, and our menu marks vegan and gluten-free dishes clearly." },
  { id: "f4", q: "How fresh are your beans?", a: "We roast twice a week. Online orders ship within 48 hours of roasting, and we never sell beans more than 10 days off roast." },
  { id: "f5", q: "Is the café laptop-friendly?", a: "Absolutely. Fast Wi-Fi, outlets at most seats — we just ask that you share big tables during the weekend brunch rush." },
  { id: "f6", q: "How does the loyalty programme work?", a: "Earn 5 Aura points for every ₹100 you spend, online or in-store. 100 points gets you any drink on the house." },
];

export const seedPosts: Post[] = [
  {
    id: "b1",
    slug: "a-beginners-guide-to-pour-over",
    title: "A beginner's guide to the perfect pour over",
    excerpt: "Four minutes, three tools and one simple ratio. Here's how our baristas brew at home.",
    cover: img(IMG.pourOver, 1400),
    author: "Ishaan, Head Roaster",
    date: daysAgo(6),
    tags: ["Brewing", "Guides"],
    readTime: 5,
    published: true,
    content: `Pour over is the purest way to taste a coffee. No pressure, no milk — just water, time and the bean.\n\n## What you need\nA dripper, a paper filter, a kettle (gooseneck if you have one), a scale and freshly ground coffee. That's it.\n\n## The ratio\nStart with 1:16. That's 15g of coffee to 250g of water. Grind medium-fine, like sea salt.\n\n## The method\nRinse the filter with hot water. Add coffee, then pour 40g of water to let it bloom for 30 seconds. Then pour slowly in circles until you hit 250g. Aim to finish by 3:30.\n\n## Taste and adjust\nToo sour? Grind finer. Too bitter? Grind coarser. Coffee is a conversation — keep tasting.`,
  },
  {
    id: "b2",
    slug: "meet-our-farmers-chikmagalur",
    title: "Meet the farmers behind our house blend",
    excerpt: "We spent a week in the hills of Chikmagalur with the family that grows half of every cup we pour.",
    cover: img(IMG.beans, 1400),
    author: "Tara, Founder",
    date: daysAgo(18),
    tags: ["Origins", "Stories"],
    readTime: 7,
    published: true,
    content: `The road to the Gowda family estate winds through pepper vines and silver oak. They've been growing coffee here for four generations.\n\n## Why direct trade\nBuying directly means we pay well above market price, and we know exactly how the coffee was grown, picked and processed.\n\n## Shade-grown, hand-picked\nEvery cherry is picked by hand at peak ripeness. The canopy of native trees keeps the soil healthy and the birds happy.\n\n## What it tastes like\nChocolate, toasted almond and a gentle sweetness that makes our flat white what it is.`,
  },
  {
    id: "b3",
    slug: "why-our-croissants-take-three-days",
    title: "Why our croissants take three days",
    excerpt: "Lamination, patience and a lot of French butter. Inside the 4am bakery shift.",
    cover: img(IMG.croissant, 1400),
    author: "Chef Neha",
    date: daysAgo(31),
    tags: ["Bakery"],
    readTime: 4,
    published: true,
    content: `Day one: the dough. Day two: the butter, folded in again and again until there are 81 layers. Day three: proof, egg wash, bake.\n\n## The butter matters\nWe use cultured French butter with 84% fat. It's pliable when cold and gives that honeycomb crumb.\n\n## Baked every two hours\nNo croissant sits on our counter for long. That's why they shatter when you bite in.`,
  },
  {
    id: "b4",
    slug: "cold-brew-at-home",
    title: "Cold brew at home, the lazy way",
    excerpt: "A jar, a fridge and eighteen hours. The easiest great coffee you'll ever make.",
    cover: img(IMG.icedCoffee, 1400),
    author: "Ishaan, Head Roaster",
    date: daysAgo(45),
    tags: ["Brewing", "Guides"],
    readTime: 3,
    published: true,
    content: `Coarsely grind 100g of coffee. Add it to a jar with 1 litre of cold water. Stir, cover, and leave it in the fridge for 18 hours.\n\n## Strain and store\nStrain through a paper filter. It keeps for a week in the fridge.\n\n## Serve\nDilute 1:1 with water or milk, pour over ice, and add a pinch of salt if you're feeling brave.`,
  },
];

export const seedEvents: CafeEvent[] = [
  { id: "e1", slug: "latte-art-masterclass", title: "Latte Art Masterclass", date: daysAhead(5), time: "18:00", description: "From hearts to rosettas — two hours behind the bar with our head barista. Includes all the milk you can pour.", image: img(IMG.milkPour, 1200), price: 1800, seats: 10, booked: 7, category: "Workshop", published: true },
  { id: "e2", slug: "friday-cupping-session", title: "Friday Cupping Session", date: daysAhead(9), time: "17:30", description: "Taste six new micro-lots side by side and learn to describe what you taste. Free for loyalty members.", image: img(IMG.cupsCircle, 1200), price: 0, seats: 16, booked: 9, category: "Tasting", published: true },
  { id: "e3", slug: "acoustic-sunday", title: "Acoustic Sundays", date: daysAhead(12), time: "19:30", description: "Live acoustic sets in the garden, candles on every table and a special evening menu.", image: img(IMG.interiorDark, 1200), price: 499, seats: 40, booked: 26, category: "Live music", published: true },
  { id: "e4", slug: "home-brewing-101", title: "Home Brewing 101", date: daysAhead(19), time: "11:00", description: "Pour over, AeroPress and French press — learn three methods and take home a bag of beans.", image: img(IMG.glassCoffee, 1200), price: 1200, seats: 12, booked: 3, category: "Workshop", published: true },
];

export const seedMessages: Message[] = [
  { id: "m1", name: "Priya Shah", email: "priya.shah@example.com", phone: "+91 98200 11223", subject: "Corporate order for 40 people", message: "Hi! We'd love to order coffee and pastries for our office offsite next Thursday. Can you share a catering menu?", status: "new", createdAt: daysAgo(0, 9) },
  { id: "m2", name: "Arjun Nair", email: "arjun@example.com", subject: "Wholesale beans", message: "I run a small café in Pune and would like to stock your house blend. What are your wholesale terms?", status: "new", createdAt: daysAgo(1, 15) },
  { id: "m3", name: "Fatima Khan", email: "fatima.k@example.com", subject: "Lost umbrella", message: "I think I left a green umbrella on Saturday near the window seats!", status: "replied", createdAt: daysAgo(3, 12) },
  { id: "m4", name: "Dev Malhotra", email: "dev.m@example.com", subject: "Collaboration", message: "I'm a food photographer and would love to shoot your new winter menu.", status: "read", createdAt: daysAgo(5, 17) },
];

/* ------------------------------- CRM + Commerce ------------------------------ */

const people = [
  ["Ananya Rao", "ananya.rao@example.com", "+91 98200 10001"],
  ["Kabir Mehta", "kabir.mehta@example.com", "+91 98200 10002"],
  ["Sara Fernandes", "sara.f@example.com", "+91 98200 10003"],
  ["Rohan Kapoor", "rohan.k@example.com", "+91 98200 10004"],
  ["Meera Iyer", "meera.iyer@example.com", "+91 98200 10005"],
  ["Vikram Singh", "vikram.s@example.com", "+91 98200 10006"],
  ["Zoya Ali", "zoya.ali@example.com", "+91 98200 10007"],
  ["Aditya Joshi", "aditya.j@example.com", "+91 98200 10008"],
  ["Nisha Patel", "nisha.p@example.com", "+91 98200 10009"],
  ["Rahul Verma", "rahul.v@example.com", "+91 98200 10010"],
  ["Tanya Desai", "tanya.d@example.com", "+91 98200 10011"],
  ["Imran Sheikh", "imran.s@example.com", "+91 98200 10012"],
] as const;

// Deterministic pseudo random
let s = 42;
const rnd = () => {
  s = (s * 16807) % 2147483647;
  return (s - 1) / 2147483646;
};

function buildOrders(): Order[] {
  s = 42;
  const menu = seedProducts.filter((p) => p.type === "menu");
  const shop = seedProducts.filter((p) => p.type === "shop");
  const orders: Order[] = [];
  const statuses: OrderStatus[] = ["completed", "completed", "completed", "completed", "completed", "cancelled"];
  for (let i = 0; i < 64; i++) {
    const day = Math.floor((i / 64) * 30);
    const person = people[Math.floor(rnd() * people.length)];
    const n = 1 + Math.floor(rnd() * 3);
    const items = Array.from({ length: n }, () => {
      const pool = rnd() > 0.82 ? shop : menu;
      const p = pool[Math.floor(rnd() * pool.length)];
      return { productId: p.id, name: p.name, image: p.image, unitPrice: p.price, qty: 1 + Math.floor(rnd() * 2), options: [] as string[] };
    });
    const subtotal = items.reduce((a, b) => a + b.unitPrice * b.qty, 0);
    const fulfillment = (["delivery", "pickup", "dine-in"] as const)[Math.floor(rnd() * 3)];
    const deliveryFee = fulfillment === "delivery" && subtotal < 799 ? 49 : 0;
    const tax = Math.round(subtotal * 0.05);
    const at = daysAgo(29 - day, 8 + Math.floor(rnd() * 13));
    const recent = i >= 58;
    const status: OrderStatus = recent
      ? (["pending", "confirmed", "preparing", "ready", "out-for-delivery", "pending"] as OrderStatus[])[i - 58]
      : statuses[Math.floor(rnd() * statuses.length)];
    orders.push({
      id: `o-${1000 + i}`,
      number: `AU-${(10240 + i).toString()}`,
      createdAt: recent ? new Date(Date.now() - (64 - i) * 7 * 60000).toISOString() : at,
      customer: { name: person[0], email: person[1], phone: person[2] },
      items,
      subtotal,
      discount: 0,
      tax,
      deliveryFee,
      tip: 0,
      total: subtotal + tax + deliveryFee,
      fulfillment,
      address: fulfillment === "delivery" ? `${10 + i} Hill Road, Bandra West, Mumbai` : undefined,
      tableNo: fulfillment === "dine-in" ? String(1 + (i % 14)) : undefined,
      payment: (["upi", "card", "cod"] as const)[Math.floor(rnd() * 3)],
      paymentStatus: status === "cancelled" ? "refunded" : "paid",
      status,
      timeline: [{ status: "pending", at }, ...(status !== "pending" ? [{ status, at }] : [])],
    });
  }
  return orders.reverse();
}

export function buildSeed(): DB {
  const orders = buildOrders();
  const customers: Customer[] = people.map(([name, email, phone], i) => {
    const mine = orders.filter((o) => o.customer.email === email && o.status !== "cancelled");
    const spend = mine.reduce((a, b) => a + b.total, 0);
    const stage = spend > 6000 ? "vip" : mine.length >= 3 ? "regular" : mine.length > 0 ? "new" : "lead";
    return {
      id: `cu-${i + 1}`,
      name,
      email,
      phone,
      tags: [i % 3 === 0 ? "oat milk" : "", i % 4 === 0 ? "works from café" : "", i === 4 ? "birthday host" : ""].filter(Boolean),
      notes: i === 0 ? "Always orders a flat white with oat milk. Prefers the window seat." : "",
      stage,
      source: "order",
      points: Math.round((spend / 100) * 5),
      createdAt: daysAgo(40 + i),
      lastActivity: mine[0]?.createdAt ?? daysAgo(20),
    };
  });

  const activities: CrmActivity[] = orders.slice(0, 30).map((o, i) => ({
    id: `a-${i}`,
    customerId: customers.find((c) => c.email === o.customer.email)!.id,
    type: "order",
    text: `Placed order ${o.number} · ${o.items.length} item(s)`,
    at: o.createdAt,
  }));

  const reservations: Reservation[] = [
    ["Ananya Rao", 0, "09:30", 2, "indoor", "", "confirmed"],
    ["Vikram Singh", 0, "13:00", 4, "garden", "Business lunch", "confirmed"],
    ["Zoya Ali", 0, "19:30", 6, "private", "Birthday", "pending"],
    ["Rahul Verma", 1, "10:00", 2, "bar", "", "pending"],
    ["Meera Iyer", 2, "20:00", 10, "private", "Anniversary", "confirmed"],
    ["Nisha Patel", 3, "11:30", 3, "garden", "", "pending"],
    ["Tanya Desai", -1, "18:00", 2, "indoor", "", "completed"],
    ["Imran Sheikh", -2, "12:30", 5, "garden", "", "no-show"],
  ].map(([name, d, time, guests, area, occasion, status], i) => {
    const p = people.find((x) => x[0] === name)!;
    return {
      id: `r-${i + 1}`,
      name: name as string,
      email: p[1],
      phone: p[2],
      date: daysAhead(d as number),
      time: time as string,
      guests: guests as number,
      area: area as Reservation["area"],
      occasion: (occasion as string) || undefined,
      status: status as Reservation["status"],
      createdAt: daysAgo(3 + i),
      table: status === "confirmed" ? `T${3 + i}` : undefined,
    };
  });

  const reviews: Review[] = [
    { id: "rv1", productId: "p-aura-flat-white", name: "Ananya", rating: 5, text: "Silky, balanced and exactly the right temperature. My daily ritual.", createdAt: daysAgo(4), approved: true },
    { id: "rv2", productId: "p-aura-flat-white", name: "Kabir", rating: 5, text: "Best flat white in Mumbai, no contest.", createdAt: daysAgo(9), approved: true },
    { id: "rv3", productId: "p-butter-croissant", name: "Sara", rating: 5, text: "Shatters perfectly. Honeycomb inside. Come before 10am!", createdAt: daysAgo(2), approved: true },
    { id: "rv4", productId: "p-house-blend-beans", name: "Rohan", rating: 4, text: "Lovely chocolatey blend, great for moka pot too.", createdAt: daysAgo(12), approved: true },
    { id: "rv5", productId: "p-iced-spanish-latte", name: "Zoya", rating: 5, text: "Dangerously addictive.", createdAt: daysAgo(1), approved: false },
  ];

  return {
    version: 1,
    settings: seedSettings,
    categories: seedCategories,
    products: seedProducts,
    reviews,
    coupons: seedCoupons,
    orders,
    reservations,
    customers,
    activities,
    messages: seedMessages,
    subscribers: [
      { id: "s1", email: "hello@example.com", createdAt: daysAgo(3) },
      { id: "s2", email: "coffee.lover@example.com", createdAt: daysAgo(8) },
    ],
    posts: seedPosts,
    events: seedEvents,
    eventBookings: [],
    testimonials: seedTestimonials,
    gallery: seedGallery,
    faqs: seedFaqs,
  };
}
