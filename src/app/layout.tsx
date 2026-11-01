import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono, Instrument_Serif, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { seedSettings } from "@/lib/seed";
import "./globals.css";

const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument" });
const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-fraunces" });
const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-playfair" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: { default: seedSettings.seo.title, template: `%s — ${seedSettings.site.name}` },
  description: seedSettings.seo.description,
  openGraph: { title: seedSettings.seo.title, description: seedSettings.seo.description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#f6f1ea",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} ${fraunces.variable} ${playfair.variable} ${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
