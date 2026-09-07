import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
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
    default: "Smartkost Pulo Jahe | Kost Modern, Cepat & Bebas Ribet",
    template: "%s | Smartkost Pulo Jahe",
  },
  description:
    "Upgrade pengalaman ngekost kamu di Pulo Jahe. Fasilitas lengkap, WiFi Fiber Optic, Keamanan AI 24/7, dan Virtual Tour 360°. Amankan kamarmu sekarang!",
  keywords: ["kost pulo jahe", "kost cakung", "smart kost", "kost karyawan", "kost fasilitas lengkap"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: baseUrl,
    siteName: "Smartkost Pulo Jahe",
    title: "Smartkost Pulo Jahe",
    description: "Upgrade pengalaman ngekost kamu di Pulo Jahe. Fasilitas lengkap, WiFi Fiber Optic, Keamanan AI 24/7.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smartkost Pulo Jahe",
    description: "Upgrade pengalaman ngekost kamu di Pulo Jahe.",
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
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
        {children}
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
