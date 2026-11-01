export type ID = string;

export type CatalogType = "menu" | "shop";

export interface VariantOption {
  id: ID;
  label: string;
  priceDelta: number;
}

export interface VariantGroup {
  id: ID;
  name: string;
  options: VariantOption[];
}

export interface Category {
  id: ID;
  name: string;
  slug: string;
  type: CatalogType;
  order: number;
}

export interface Product {
  id: ID;
  slug: string;
  name: string;
  type: CatalogType;
  categoryId: ID;
  price: number;
  comparePrice?: number;
  description: string;
  longDescription: string;
  image: string;
  gallery: string[];
  tags: string[]; // bestseller | new | vegan | seasonal | signature | gluten-free
  stock: number;
  featured: boolean;
  active: boolean;
  rating: number;
  reviewCount: number;
  variants: VariantGroup[];
  calories?: number;
  notes?: string; // tasting notes / origin
  createdAt: string;
}

export interface Review {
  id: ID;
  productId: ID;
  name: string;
  rating: number;
  text: string;
  createdAt: string;
  approved: boolean;
}

export type CouponType = "percent" | "flat";
export interface Coupon {
  id: ID;
  code: string;
  type: CouponType;
  value: number;
  minOrder: number;
  active: boolean;
  uses: number;
  description: string;
  expiresAt?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out-for-delivery"
  | "completed"
  | "cancelled";

export type Fulfillment = "delivery" | "pickup" | "dine-in";
export type PaymentMethod = "upi" | "card" | "cod";

export interface OrderItem {
  productId: ID;
  name: string;
  image: string;
  unitPrice: number;
  qty: number;
  options: string[];
}

export interface Order {
  id: ID;
  number: string;
  createdAt: string;
  customer: { name: string; email: string; phone: string };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  tip: number;
  total: number;
  couponCode?: string;
  fulfillment: Fulfillment;
  address?: string;
  tableNo?: string;
  scheduledFor?: string;
  payment: PaymentMethod;
  paymentStatus: "paid" | "pending" | "refunded";
  status: OrderStatus;
  notes?: string;
  timeline: { status: OrderStatus; at: string }[];
}

export type ReservationStatus = "pending" | "confirmed" | "seated" | "completed" | "cancelled" | "no-show";
export interface Reservation {
  id: ID;
  name: string;
  email: string;
  phone: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  guests: number;
  area: "indoor" | "garden" | "bar" | "private";
  occasion?: string;
  notes?: string;
  table?: string;
  status: ReservationStatus;
  createdAt: string;
}

export type CustomerStage = "lead" | "new" | "regular" | "vip" | "inactive";
export interface Customer {
  id: ID;
  name: string;
  email: string;
  phone: string;
  tags: string[];
  notes: string;
  stage: CustomerStage;
  source: "order" | "reservation" | "newsletter" | "contact" | "event" | "manual";
  points: number;
  birthday?: string;
  createdAt: string;
  lastActivity: string;
}

export interface CrmActivity {
  id: ID;
  customerId: ID;
  type: "order" | "reservation" | "message" | "note" | "event" | "newsletter" | "points";
  text: string;
  at: string;
}

export interface Message {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
}

export interface Subscriber {
  id: ID;
  email: string;
  createdAt: string;
}

export interface Post {
  id: ID;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // paragraphs separated by blank lines; lines starting with "## " are headings
  cover: string;
  author: string;
  date: string;
  tags: string[];
  readTime: number;
  published: boolean;
}

export interface CafeEvent {
  id: ID;
  slug: string;
  title: string;
  date: string;
  time: string;
  description: string;
  image: string;
  price: number;
  seats: number;
  booked: number;
  category: string;
  published: boolean;
}

export interface EventBooking {
  id: ID;
  eventId: ID;
  name: string;
  email: string;
  phone: string;
  seats: number;
  createdAt: string;
}

export interface Testimonial {
  id: ID;
  name: string;
  role: string;
  quote: string;
  avatar: string;
  rating: number;
}

export interface GalleryItem {
  id: ID;
  image: string;
  caption: string;
  span: "tall" | "wide" | "square";
}

export interface Faq {
  id: ID;
  q: string;
  a: string;
}

export interface NavLink {
  id: ID;
  label: string;
  href: string;
}

export type HomeSectionKey =
  | "marquee"
  | "story"
  | "signature"
  | "menuPreview"
  | "experience"
  | "shop"
  | "events"
  | "testimonials"
  | "gallery"
  | "journal"
  | "reserve"
  | "newsletter";

export interface HomeSection {
  key: HomeSectionKey;
  label: string;
  enabled: boolean;
}

export interface OpeningHour {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export type DisplayFont = "archivo" | "bricolage" | "unbounded";

export interface HeroSlide {
  id: ID;
  productId: ID;
  bg: string; // hero background while this drink is showing
  ink: string; // text colour on that background
  pop: string; // accent colour on that background
}
export type IntroStyle = "curtain" | "counter" | "minimal";

export interface Settings {
  site: {
    name: string;
    shortName: string;
    tagline: string;
    email: string;
    phone: string;
    whatsapp: string;
    instagram: string;
    address: string;
    city: string;
    mapQuery: string;
    currency: string;
    taxRate: number; // percent
    deliveryFee: number;
    freeDeliveryAbove: number;
    minOrder: number;
    acceptingOrders: boolean;
    hours: OpeningHour[];
  };
  announcement: { enabled: boolean; text: string; href: string };
  theme: {
    accent: string;
    background: string;
    ink: string;
    surface: string;
    displayFont: DisplayFont;
    radius: number;
  };
  intro: {
    enabled: boolean;
    style: IntroStyle;
    words: string[];
    duration: number; // seconds
    oncePerSession: boolean;
  };
  nav: {
    links: NavLink[];
    ctaLabel: string;
    ctaHref: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    titleItalic: string;
    subtitle: string;
    image: string;
    secondaryImage: string;
    ctaPrimary: { label: string; href: string };
    ctaSecondary: { label: string; href: string };
    slides: HeroSlide[];
    autoplay: number; // seconds per drink, 0 = off
  };
  story: {
    eyebrow: string;
    statement: string;
    body: string;
    image: string;
    stats: { value: string; label: string }[];
  };
  marquee: string[];
  experience: { title: string; text: string; image: string }[];
  sections: HomeSection[];
  loyalty: { enabled: boolean; pointsPer100: number; rewardText: string };
  seo: { title: string; description: string };
  footer: { note: string };
}

export interface DB {
  version: number;
  settings: Settings;
  categories: Category[];
  products: Product[];
  reviews: Review[];
  coupons: Coupon[];
  orders: Order[];
  reservations: Reservation[];
  customers: Customer[];
  activities: CrmActivity[];
  messages: Message[];
  subscribers: Subscriber[];
  posts: Post[];
  events: CafeEvent[];
  eventBookings: EventBooking[];
  testimonials: Testimonial[];
  gallery: GalleryItem[];
  faqs: Faq[];
}

export type CollectionKey = Exclude<keyof DB, "version" | "settings">;
