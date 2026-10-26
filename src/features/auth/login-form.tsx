"use client";

import { useActionState, useState } from "react";
import { authenticate } from "./actions";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Check,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <>
      {/* Status chip — pojok kanan atas panel form */}
      <div className="login-status-chip">
        <span className="login-status-dot" />
        SISTEM SAAS AKTIF
      </div>

      <div className="login-card">
        {/* === Eyebrow + Title + Subtitle === */}
        <div className="login-header-group">
          <div className="login-eyebrow">PORTAL PENGELOLA OSKOST</div>
          <h1 className="login-title">Selamat Datang Kembali</h1>
          <p className="login-subtitle">
            Masuk untuk mengelola operasional kamar, pembukuan SaaS, dan tata kelola platform.
          </p>
        </div>

        {/* === Form === */}
        <form action={formAction} autoComplete="off">
          {/* Identity field */}
          <div className="login-field">
            <label htmlFor="identifier" className="login-field-label">
              Email atau No. Handphone
            </label>
            <div className="login-input-group">
              <Mail size={18} className="login-input-icon" />
              <input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="admin@oskost.com / superadmin@oskost.id"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="login-field">
            <div className="login-label-row">
              <label htmlFor="password" className="login-field-label">
                Kata Sandi
              </label>
              <Link href="/forgot-password" className="login-forgot-link">
                Lupa kata sandi?
              </Link>
            </div>
            <div className="login-input-group">
              <Lock size={18} className="login-input-icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? "Sembunyikan kata sandi"
                    : "Tampilkan kata sandi"
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div
            className="login-remember-row"
            onClick={() => setRememberMe(!rememberMe)}
          >
            <div className={`login-checkbox ${rememberMe ? "checked" : ""}`}>
              <Check size={11} strokeWidth={3} />
            </div>
            <span>Ingat saya di perangkat ini</span>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="login-error">
              <AlertCircle size={16} className="shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="login-btn-submit"
            disabled={isPending}
          >
            {isPending ? (
              <div className="login-spinner" />
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Tenant Mobile App Notice */}
        <div className="login-tenant-notice">
          <div className="login-tenant-icon-box">
            <Smartphone size={16} className="text-emerald-400" />
          </div>
          <div className="login-tenant-text">
            <p className="font-medium text-zinc-300">Penghuni Kost?</p>
            <p className="text-zinc-500 text-xs">
              Akses kamar &amp; tagihan Anda melalui aplikasi mobile <b>OsKost Sanctuary</b> di smartphone.
            </p>
          </div>
        </div>

        {/* Trust line */}
        <p className="login-trust-line">
          <ShieldCheck size={13} />
          Koneksi aman 256-bit TLS &amp; data terisolasi multi-tenant
        </p>
      </div>
    </>
  );
}
