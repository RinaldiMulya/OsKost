import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono, Noto_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const notoSerif = Noto_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono-alt",
  subsets: ["latin"],
  display: "swap",
  weight: ["500"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "OsKost Residences | Hunian Modern & SaaS Manajemen Kost",
    template: "%s | OsKost Residences",
  },
  description:
    "Kost eksklusif dekat Pabrik Yamaha Cakung & Stasiun Buaran. WiFi Fiber ultra cepat, smart lock RFID, tur 360°, dan software manajemen kost terintegrasi.",
  keywords: ["kost pulo jahe", "kost cakung", "oskpost", "kost jakarta timur", "saas manajemen kost", "smart kost"],
  icons: {
    icon: "/images/logo-icon.png",
    shortcut: "/images/logo-icon.png",
    apple: "/images/logo-icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: baseUrl,
    siteName: "OsKost Residences & SaaS Platform",
    title: "OsKost Residences | Hunian Modern & SaaS Manajemen Kost",
    description: "Kost eksklusif dekat Pabrik Yamaha Cakung & Stasiun Buaran. WiFi Fiber ultra cepat, smart lock RFID, dan tur 360°.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OsKost Residences",
    description: "Hunian modern dan platform SaaS manajemen kost di Jakarta Timur.",
  },
  alternates: {
    canonical: "/",
  },
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakartaSans.variable} ${notoSerif.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
        {children}
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
