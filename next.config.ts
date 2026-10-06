import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const isDev = process.env.NODE_ENV === "development";

// Konfigurasi PWA: dinonaktifkan di mode development agar kompatibel dengan Turbopack
const withPWA = withPWAInit({
  dest: "public",
  disable: isDev,
  register: true,
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    disableDevLogs: true,
    // Eksklusi route Admin Dashboard & API dari pre-caching Service Worker
    exclude: [
      /^\/admin\/.*$/i,
      /^\/api\/.*$/i,
      /\.map$/,
    ],
    // Strategi runtime caching per modul fitur
    runtimeCaching: [
      // Modul Keuangan / Billing — Network First (data sensitif, wajib terbaru)
      {
        urlPattern: /^\/(dashboard\/billing|api\/billing)/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "oskost-billing",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60, // 1 jam
          },
        },
      },
      // Modul Pelaporan / Reports — Network First (fallback ke cache offline)
      {
        urlPattern: /^\/(dashboard\/reports|api\/reports)/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "oskost-reports",
          networkTimeoutSeconds: 15,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 hari
          },
        },
      },
      // App Shell & UI Assets — Stale-While-Revalidate (instan load, update di belakang)
      {
        urlPattern: /\.(js|css|woff2?|ttf|otf|eot)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "oskost-static-assets",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 hari
          },
        },
      },
      // Gambar — Cache First (jarang berubah, hemat bandwidth)
      {
        urlPattern: /\.(png|jpg|jpeg|webp|svg|gif|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "oskost-images",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 hari
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  devIndicators: false,
  // Turbopack: menonaktifkan warning karena @ducanh2912/next-pwa menambahkan config webpack.
  // PWA plugin hanya aktif di production build (webpack), tidak di dev (Turbopack).
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
