import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { CartDrawer } from "@/components/site/CartDrawer";
import { Footer } from "@/components/site/Footer";
import { Intro } from "@/components/site/Intro";
import { Navbar } from "@/components/site/Navbar";
import { ProductSheet } from "@/components/site/ProductSheet";
import { SmoothScroll } from "@/components/site/SmoothScroll";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <Intro />
      <Navbar />
      <main className="min-h-dvh">{children}</main>
      <Footer />
      <CartDrawer />
      <ProductSheet />
      <AnnouncementBar />
    </>
  );
}
