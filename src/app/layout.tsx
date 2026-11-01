import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Funnel_Display, Funnel_Sans, Unbounded } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { seedSettings } from "@/lib/seed";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], axes: ["wdth", "opsz"], variable: "--font-bricolage" });
const funnelDisplay = Funnel_Display({ subsets: ["latin"], variable: "--font-funnel-display" });
const unbounded = Unbounded({ subsets: ["latin"], variable: "--font-unbounded" });
const funnelSans = Funnel_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: { default: seedSettings.seo.title, template: `%s — ${seedSettings.site.name}` },
  description: seedSettings.seo.description,
  openGraph: { title: seedSettings.seo.title, description: seedSettings.seo.description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#f4f2ee",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${funnelDisplay.variable} ${unbounded.variable} ${funnelSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
