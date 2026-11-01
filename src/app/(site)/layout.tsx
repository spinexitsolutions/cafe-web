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
      <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-[76px]">
        <main className="min-h-dvh">{children}</main>
        <Footer />
      </div>
      <CartDrawer />
      <ProductSheet />
      <AnnouncementBar />
    </>
  );
}
