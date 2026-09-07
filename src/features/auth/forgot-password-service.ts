import "server-only";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import { z } from "zod";

// ============================================
// Schemas
// ============================================

export const requestResetSchema = z.object({
  identifier: z.string().min(1, "Email atau No. HP wajib diisi"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token tidak valid"),
    newPassword: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password baru dan konfirmasi tidak cocok",
    path: ["confirmPassword"],
  });

// ============================================
// Service Functions
// ============================================

/**
 * Buat token reset password dengan batasan kuota 2x sehari per user.
 * Token berlaku 5 menit.
 */
export async function requestPasswordReset(identifier: string) {
  const isEmail = identifier.includes("@");

  // Cari user berdasarkan email atau phoneNumber
  const user = await prisma.user.findFirst({
    where: isEmail
      ? { email: identifier }
      : { phoneNumber: identifier },
    include: {
      tenantProfile: true,
    },
  });

  if (!user) {
    // Keamanan: hindari user enumeration, tetapi untuk UX jika tidak ada email/user
    throw new Error("Akun dengan email atau No. HP tersebut tidak ditemukan.");
  }

  if (!user.email) {
    throw new Error("Akun Anda tidak memiliki email terdaftar untuk menerima magic link.");
  }

  // Cek rate limit: hitung berapa kali user membuat request reset hari ini (00:00:00 s/d sekarang)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const countToday = await prisma.passwordResetToken.count({
    where: {
      userId: user.id,
      createdAt: {
        gte: startOfDay,
      },
    },
  });

  if (countToday >= 2) {
    throw new Error(
      "Batas maksimal permintaan reset password adalah 2 kali sehari. Silakan coba lagi besok."
    );
  }

  // Buat random token (32 bytes hex = 64 char string)
  const rawToken = crypto.randomBytes(32).toString("hex");

  // Expire in 5 minutes
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Simpan token ke database
  await prisma.passwordResetToken.create({
    data: {
      token: rawToken,
      userId: user.id,
      expiresAt,
    },
  });

  // Susun URL reset password
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

  const recipientName = user.tenantProfile?.fullName || (user.role === "ADMIN" ? "Admin" : "Pengguna OSkost");

  // Kirim email via Resend
  const emailResult = await sendPasswordResetEmail({
    toEmail: user.email,
    resetUrl,
    recipientName,
  });

  if (!emailResult.success) {
    throw new Error(emailResult.error || "Gagal mengirim email reset password.");
  }

  return {
    email: user.email,
    remainingAttempts: 2 - (countToday + 1),
  };
}

/**
 * Verifikasi token reset password.
 */
export async function verifyResetToken(token: string) {
  const resetTokenRecord = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!resetTokenRecord) {
    return { valid: false, reason: "Tautan reset password tidak valid." };
  }

  if (resetTokenRecord.used) {
    return { valid: false, reason: "Tautan reset password ini sudah pernah digunakan." };
  }

  if (new Date() > resetTokenRecord.expiresAt) {
    return { valid: false, reason: "Tautan reset password telah kadaluwarsa (lebih dari 5 menit)." };
  }

  return { valid: true, tokenRecord: resetTokenRecord };
}

/**
 * Eksekusi reset password baru dengan token.
 */
export async function executePasswordReset(token: string, newPassword: string) {
  const verification = await verifyResetToken(token);

  if (!verification.valid || !verification.tokenRecord) {
    throw new Error(verification.reason || "Token tidak valid.");
  }

  const { tokenRecord } = verification;

  // Hash password baru
  const hashedPassword = await bcryptjs.hash(newPassword, 12);

  // Update password user & tandai token as used
  await prisma.$transaction([
    prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { passwordHash: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { used: true },
    }),
  ]);

  return { success: true };
}
