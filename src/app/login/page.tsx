import { LoginForm } from "@/features/auth/login-form";
import "./login.css";

export const metadata = {
  title: "Login | Smartkost Pulo Jahe",
  description: "Login untuk masuk ke panel manajemen OSkost.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="login-stage">
      {/* ================= FORM PANEL (kiri) ================= */}
      <main className="login-panel-form">
        <LoginForm />
      </main>

      {/* ================= BRAND PANEL (kanan) ================= */}
      <aside className="login-panel-brand">
        <div className="login-grid-overlay" />

        {/* Blueprint SVG — ilustrasi rumah kost */}
        <svg
          className="login-blueprint-cluster"
          viewBox="0 0 900 340"
          fill="none"
          stroke="rgb(0, 204, 64)"
          strokeWidth="1.4"
        >
          {/* baseline */}
          <line x1="20" y1="300" x2="880" y2="300" />
          {/* 5 cluster house units — front elevation blueprint style */}
          <g>
            {/* unit 1 */}
            <rect x="40" y="190" width="140" height="110" />
            <path d="M40 190 L110 130 L180 190" />
            <rect x="80" y="230" width="30" height="70" />
            <rect x="130" y="215" width="24" height="24" />
            <line
              x1="180"
              y1="130"
              x2="180"
              y2="300"
              strokeDasharray="3 4"
              strokeWidth="0.8"
            />
            {/* unit 2 */}
            <rect x="180" y="200" width="140" height="100" />
            <path d="M180 200 L250 145 L320 200" />
            <rect x="215" y="235" width="28" height="65" />
            <rect x="265" y="222" width="24" height="24" />
            {/* unit 3 (taller, focal) */}
            <rect x="320" y="170" width="160" height="130" />
            <path d="M320 170 L400 100 L480 170" />
            <rect x="365" y="220" width="32" height="80" />
            <rect x="420" y="200" width="26" height="26" />
            <rect x="340" y="200" width="26" height="26" />
            <line
              x1="320"
              y1="100"
              x2="320"
              y2="300"
              strokeDasharray="3 4"
              strokeWidth="0.8"
            />
            <line
              x1="480"
              y1="100"
              x2="480"
              y2="300"
              strokeDasharray="3 4"
              strokeWidth="0.8"
            />
            {/* unit 4 */}
            <rect x="480" y="200" width="140" height="100" />
            <path d="M480 200 L550 145 L620 200" />
            <rect x="513" y="235" width="28" height="65" />
            <rect x="565" y="222" width="24" height="24" />
            {/* unit 5 */}
            <rect x="620" y="190" width="140" height="110" />
            <path d="M620 190 L690 130 L760 190" />
            <rect x="660" y="230" width="30" height="70" />
            <rect x="710" y="215" width="24" height="24" />
            <line
              x1="620"
              y1="130"
              x2="620"
              y2="300"
              strokeDasharray="3 4"
              strokeWidth="0.8"
            />
          </g>
          {/* dimension line flourish */}
          <line x1="40" y1="318" x2="180" y2="318" strokeWidth="0.8" />
          <line x1="40" y1="312" x2="40" y2="324" strokeWidth="0.8" />
          <line x1="180" y1="312" x2="180" y2="324" strokeWidth="0.8" />
          <circle
            cx="400"
            cy="100"
            r="2.5"
            fill="rgb(0, 204, 64)"
            stroke="none"
          />
        </svg>

        {/* Brand top: Logo + Eyebrow */}
        <div className="login-brand-top">
          <div className="login-brand-row">
            {/* Keytag SVG icon */}
            <div className="login-keytag-wrap">
              <svg width="36" height="47" viewBox="0 0 40 52" fill="none">
                <circle
                  cx="20"
                  cy="8"
                  r="6"
                  stroke="#8891a3"
                  strokeWidth="2"
                  fill="none"
                />
                <rect
                  x="4"
                  y="14"
                  width="32"
                  height="34"
                  rx="8"
                  fill="url(#tagGradLogin)"
                  stroke="#0a7f29"
                  strokeWidth="1"
                />
                <circle cx="20" cy="17" r="5.5" fill="#0d1016" />
                <circle cx="20" cy="30" r="5" fill="#002e10" opacity="0.55" />
                <path d="M20 32 L16 40 H24 Z" fill="#002e10" opacity="0.55" />
                <defs>
                  <linearGradient
                    id="tagGradLogin"
                    x1="4"
                    y1="14"
                    x2="36"
                    y2="48"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#33d96a" />
                    <stop offset="1" stopColor="#00a333" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="login-wordmark">
              OS<span>KOST</span>
            </div>
          </div>
          <div className="login-hero-eyebrow">Sistem Manajemen Kost</div>
        </div>

        {/* Brand hero: Big headline */}
        <div className="login-brand-hero">
          <h2 className="login-big-headline">
            Dari buku tulis penuh coretan, jadi{" "}
            <span className="accent">dashboard yang rapi.</span>
          </h2>
        </div>

        {/* Brand bottom: Stats + Footer */}
        <div className="login-brand-bottom">
          <div className="login-stat-row">
            <div className="login-stat-chip">
              <b>11</b>
              <span>PINTU KOST</span>
            </div>
            <div className="login-stat-chip">
              <b>1</b>
              <span>LOKASI</span>
            </div>
            <div className="login-stat-chip">
              <b>24/7</b>
              <span>AKSES</span>
            </div>
          </div>
          <p className="login-footer-note">
            Area <b>Pulo Jahe, Cakung</b> — dekat Pabrik Yamaha &amp; Stasiun
            Buaran.
          </p>
        </div>
      </aside>
    </div>
  );
}
