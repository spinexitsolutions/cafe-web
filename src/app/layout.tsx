import type { Metadata, Viewport } from "next";
import { Archivo, Bricolage_Grotesque, Instrument_Sans, Unbounded } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { seedSettings } from "@/lib/seed";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], axes: ["wdth", "opsz"], variable: "--font-bricolage" });
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo" });
const unbounded = Unbounded({ subsets: ["latin"], variable: "--font-unbounded" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"], axes: ["wdth"], variable: "--font-body" });

export const metadata: Metadata = {
  title: { default: seedSettings.seo.title, template: `%s — ${seedSettings.site.name}` },
  description: seedSettings.seo.description,
  openGraph: { title: seedSettings.seo.title, description: seedSettings.seo.description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#f2f0ea",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${bricolage.variable} ${unbounded.variable} ${instrumentSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
