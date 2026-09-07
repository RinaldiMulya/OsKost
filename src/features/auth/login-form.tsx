"use client";

import { useActionState, useState, useCallback } from "react";
import { authenticate } from "./actions";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Check,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

// Konten kontekstual berdasarkan role — hanya cosmetic
const roleContent = {
  admin: {
    eyebrow: "Akses Pemilik / Admin",
    title: "Selamat Datang Kembali",
    sub: "Masuk untuk mengelola kamar, tagihan, dan laporan kost Anda.",
    idLabel: "Email atau No. HP",
    idPlaceholder: "admin@oskost.com / 08123...",
    btn: "Masuk ke Dashboard",
  },
  tenant: {
    eyebrow: "Akses Penghuni Kost",
    title: "Selamat Datang!",
    sub: "Masuk untuk cek tagihan, riwayat bayar, dan lapor kerusakan kamar.",
    idLabel: "No. HP atau Email",
    idPlaceholder: "08123... / nama@email.com",
    btn: "Masuk ke Akun Saya",
  },
} as const;

type Role = keyof typeof roleContent;

export function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("admin");
  const [rememberMe, setRememberMe] = useState(false);

  const content = roleContent[role];

  const handleRoleSwitch = useCallback((newRole: Role) => {
    setRole(newRole);
  }, []);

  return (
    <>
      {/* Status chip — pojok kanan atas panel form */}
      <div className="login-status-chip">
        <span className="login-status-dot" />
        SISTEM AKTIF
      </div>

      <div className="login-card">
        {/* === Role Switch === */}
        <div className="login-role-switch">
          <motion.div
            className="login-role-indicator"
            animate={{ left: role === "admin" ? 4 : "calc(50%)" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
          <button
            type="button"
            className={`login-role-btn ${role === "admin" ? "active" : ""}`}
            onClick={() => handleRoleSwitch("admin")}
            aria-selected={role === "admin"}
          >
            Admin
          </button>
          <button
            type="button"
            className={`login-role-btn ${role === "tenant" ? "active" : ""}`}
            onClick={() => handleRoleSwitch("tenant")}
            aria-selected={role === "tenant"}
          >
            Penghuni Kost
          </button>
        </div>

        {/* === Eyebrow + Title + Subtitle === */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            <div className="login-eyebrow">{content.eyebrow}</div>
            <h1 className="login-title">{content.title}</h1>
            <p className="login-subtitle">{content.sub}</p>
          </motion.div>
        </AnimatePresence>

        {/* === Form === */}
        <form action={formAction} autoComplete="off">
          {/* Identity field */}
          <div className="login-field">
            <label htmlFor="identifier" className="login-field-label">
              {content.idLabel}
            </label>
            <div className="login-input-group">
              <Mail size={18} className="login-input-icon" />
              <input
                id="identifier"
                name="identifier"
                type="text"
                placeholder={content.idPlaceholder}
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
                <span>{content.btn}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Trust line */}
        <p className="login-trust-line">
          <ShieldCheck size={13} />
          Koneksi aman &amp; data terenkripsi
        </p>
      </div>
    </>
  );
}
