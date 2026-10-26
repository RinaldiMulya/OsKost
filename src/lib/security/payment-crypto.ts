// src/lib/security/payment-crypto.ts
// Enkripsi Kunci Pembayaran Midtrans Server Key (AES-256-GCM) terikat ke Property ID.
// HANYA untuk server (Node.js runtime, BUKAN Edge runtime).

import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const ALGO = "aes-256-gcm";
const VERSION = "v1";
const IV_LENGTH = 12; // 12-byte IV untuk NIST SP 800-38D GCM
const TAG_LENGTH = 16; // 128-bit authentication tag

let cachedKey: Buffer | null = null;

function getPaymentEncryptionKey(): Buffer {
  if (cachedKey) return cachedKey;
  const hex = process.env.PAYMENT_ENCRYPTION_KEY;
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error(
      "PAYMENT_ENCRYPTION_KEY tidak valid atau belum diset. Wajib 64 karakter hex (32 byte)."
    );
  }
  cachedKey = Buffer.from(hex, "hex");
  return cachedKey;
}

/**
 * Enkripsi Midtrans Server Key dengan AES-256-GCM.
 * AAD (Additional Authenticated Data) mengikat ciphertext ke propertyId,
 * mencegah serangan key-swapping antar-properti kost.
 * 
 * Format output: v1:iv_hex:tag_hex:ciphertext_hex
 */
export function encryptPaymentKey(plainKey: string, propertyId: string): string {
  if (!plainKey || plainKey.trim().length === 0) {
    throw new Error("Plaintext key tidak boleh kosong.");
  }
  if (!propertyId || propertyId.trim().length === 0) {
    throw new Error("propertyId wajib disertakan sebagai AAD.");
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, getPaymentEncryptionKey(), iv, {
    authTagLength: TAG_LENGTH,
  });

  cipher.setAAD(Buffer.from(propertyId, "utf8"));

  const ciphertext = Buffer.concat([
    cipher.update(Buffer.from(plainKey.trim(), "utf8")),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${VERSION}:${iv.toString("hex")}:${tag.toString("hex")}:${ciphertext.toString("hex")}`;
}

/**
 * Dekripsi Midtrans Server Key dari format v1:iv_hex:tag_hex:ciphertext_hex.
 * Melempar error jika manipulasi terdeteksi atau propertyId tidak cocok.
 */
export function decryptPaymentKey(encryptedPayload: string, propertyId: string): string {
  if (!encryptedPayload || encryptedPayload.trim().length === 0) {
    throw new Error("Payload terenkripsi tidak boleh kosong.");
  }
  if (!propertyId || propertyId.trim().length === 0) {
    throw new Error("propertyId wajib disertakan untuk verifikasi AAD.");
  }

  const parts = encryptedPayload.split(":");
  if (parts.length !== 4 || parts[0] !== VERSION) {
    // Jika format bukan v1 tapi sudah terlanjur plain (misal data legacy pra-migrasi),
    // kita cek apakah ini format kunci Midtrans raw agar tidak crash mendadak saat migrasi
    if (encryptedPayload.startsWith("Mid-server-") || encryptedPayload.startsWith("SB-Mid-server-")) {
      return encryptedPayload;
    }
    throw new Error("Format payload terenkripsi tidak valid.");
  }

  const [, ivHex, tagHex, cipherHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const ciphertext = Buffer.from(cipherHex, "hex");

  if (iv.length !== IV_LENGTH || tag.length !== TAG_LENGTH) {
    throw new Error("Panjang IV atau Tag terenkripsi tidak valid.");
  }

  try {
    const decipher = createDecipheriv(ALGO, getPaymentEncryptionKey(), iv, {
      authTagLength: TAG_LENGTH,
    });

    decipher.setAAD(Buffer.from(propertyId, "utf8"));
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    throw new Error("Gagal mendekripsi payment key. Autentikasi integritas data atau propertyId gagal.");
  }
}

/**
 * Memeriksa apakah string adalah format terenkripsi v1
 */
export function isEncryptedPaymentKey(val: string | null | undefined): boolean {
  if (!val) return false;
  const parts = val.split(":");
  return parts.length === 4 && parts[0] === VERSION;
}

/**
 * Masking API Key untuk tampilan aman di UI Web Admin.
 * Contoh: "Mid-server-yZ5bPECsP77XORDI7d_BKkU3" -> "Mid-server-••••••••••••KkU3"
 */
export function maskApiKey(key: string | null | undefined): string {
  if (!key) return "";
  const trimmed = key.trim();
  if (trimmed.length <= 8) return "••••••••";

  // Deteksi prefix umum Midtrans
  let prefix = "";
  let remainder = trimmed;
  if (trimmed.startsWith("SB-Mid-server-")) {
    prefix = "SB-Mid-server-";
    remainder = trimmed.slice(prefix.length);
  } else if (trimmed.startsWith("Mid-server-")) {
    prefix = "Mid-server-";
    remainder = trimmed.slice(prefix.length);
  } else if (trimmed.startsWith("SB-Mid-client-")) {
    prefix = "SB-Mid-client-";
    remainder = trimmed.slice(prefix.length);
  } else if (trimmed.startsWith("Mid-client-")) {
    prefix = "Mid-client-";
    remainder = trimmed.slice(prefix.length);
  }

  if (remainder.length <= 6) {
    return `${prefix}••••••••`;
  }

  const suffix = remainder.slice(-4);
  return `${prefix}••••••••••••${suffix}`;
}
