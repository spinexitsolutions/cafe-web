# Aura Coffee Atelier — café website + admin (CRM · CMS · shop)

A demo café website built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **Framer Motion**, **Lenis** smooth scrolling and **Zustand**. It's mobile-first, and the design follows Apple's clean style. Typography is all sans-serif: Archivo (expanded) for headlines and Instrument Sans for body text, on an editorial grid with a cobalt-blue accent.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

**Admin:** `/admin`. Demo login: `admin@aura.cafe` / `aura123`.

## Storefront
- **Hero:** a split screen with a café menu board of today's pours next to a full-height drink photo. The whole hero recolours for each drink, and the board auto-advances. Drinks, colours and timing are edited in the CMS.
- **Page transitions:** an accent-colour wipe between pages.
- **Intro animation:** curtain, counter or minimal style. The words, duration, on/off switch and once-per-session setting are all controlled from the admin.
- **Navigation:** a vertical side rail on desktop and an app-style bottom tab bar on phones (with a raised bag button). The menu opens as a full-screen index with rolling-letter links and image previews.
- **Home sections:**
  - Hero image that expands as you scroll
  - Apple-style word-by-word text reveal
  - Pinned horizontal scroll of signature drinks
  - Sticky stacked experience cards
  - Event list with a cursor-following image preview
  - Parallax gallery
  - Testimonials carousel
  - Loyalty card and newsletter signup

  Every section can be turned on or off and **reordered from the CMS**.
- **Ordering and shop:**
  - Menu with a scroll-spy category bar, search and diet filters
  - Shop with sorting and filters
  - Product pages with variants (size, milk, extras, weight, grind), reviews, wishlist and related items
- **Cart and checkout:**
  - Cart drawer (a bottom sheet on phones), free-delivery progress bar and upsells
  - Full checkout: delivery, pickup or dine-in, ASAP or scheduled, UPI, card or cash, coupons, GST, tips and loyalty points
- **Live order tracking:** the tracking page updates when staff change the status in the admin.
- **Other pages:** table reservations (date strip, time slots, seating area, occasion), events with seat booking, journal/blog, about, contact (map, hours, FAQ) and an account page (orders, wishlist, rewards).

## Admin
- **Dashboard:** revenue KPIs and chart, fulfilment mix, top sellers and the live order queue.
- **Commerce:** orders (with a printable receipt), kitchen **live board** (kanban), products (variant editor), categories, coupons and review moderation.
- **Bookings:** reservations (including walk-ins) and events (with bookings).
- **CRM:** customers in pipeline stages (lead, new, regular, VIP), lifetime value, an activity timeline, notes, tags, loyalty points and CSV export. Also an inbox and the subscriber list.
- **CMS:**
  - Homepage copy and images, section order and visibility
  - Appearance: colours, preset palettes, display font, corner radius
  - Intro animation, navigation, journal, testimonials, gallery, FAQs
- **Settings:** store info, opening hours, tax and delivery rules, loyalty programme, SEO, and data export, import or reset.

## Data layer
For the demo, all data is stored in the browser with `localStorage` (`src/store/db.ts`, seeded from `src/lib/seed.ts`). That means it works without a backend and deploys anywhere. Changes made in the admin show up on the storefront straight away, even in other tabs. To go to production, replace the store actions with API calls to a database (for example Postgres or Supabase); the types in `src/lib/types.ts` already describe the schema.

Photos come from Unsplash.
