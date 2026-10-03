// src/lib/security/ktp-crypto.ts
// Enkripsi berkas KTP (AES-256-GCM) + Blind Index NIK (HMAC-SHA256).
// HANYA untuk server (Node.js runtime, BUKAN Edge runtime).
//
// Env yang dibutuhkan:
//   KTP_ENCRYPTION_KEY  64 karakter hex (32 byte)  -> openssl rand -hex 32
//   KTP_HMAC_SALT       string acak rahasia >= 32 karakter -> openssl rand -base64 48
// Gunakan nilai BERBEDA untuk keduanya, dan simpan di secret manager / env server,
// jangan di database atau bucket yang sama dengan datanya.

import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from "node:crypto";

const ALGO = "aes-256-gcm";
const VERSION = 0x01; // untuk rotasi kunci di masa depan
const IV_LENGTH = 12; // rekomendasi NIST untuk GCM
const TAG_LENGTH = 16;
const HEADER_LENGTH = 1 + IV_LENGTH + TAG_LENGTH;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB, enkripsi dilakukan di memori

let cachedKey: Buffer | null = null;
let cachedSalt: Buffer | null = null;

function getEncryptionKey(): Buffer {
  if (cachedKey) return cachedKey;
  const hex = process.env.KTP_ENCRYPTION_KEY;
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error("KTP_ENCRYPTION_KEY harus 64 karakter hex (32 byte).");
  }
  cachedKey = Buffer.from(hex, "hex");
  return cachedKey;
}

function getHmacSalt(): Buffer {
  if (cachedSalt) return cachedSalt;
  const salt = process.env.KTP_HMAC_SALT;
  if (!salt || salt.length < 32) {
    throw new Error("KTP_HMAC_SALT wajib ada dan minimal 32 karakter.");
  }
  cachedSalt = Buffer.from(salt, "utf8");
  return cachedSalt;
}

/**
 * Enkripsi bytes (mis. file KTP).
 * Format output: [version 1B][iv 12B][authTag 16B][ciphertext]
 * `aad` (additional authenticated data) mengikat ciphertext ke konteks tertentu
 * (mis. id penghuni), sehingga file tidak bisa ditukar ke record lain.
 */
export function encryptBytes(plaintext: Buffer, aad: string): Buffer {
  if (plaintext.length === 0) throw new Error("Data kosong.");
  if (plaintext.length > MAX_FILE_BYTES) {
    throw new Error("Ukuran berkas melebihi batas.");
  }

  const iv = randomBytes(IV_LENGTH); // IV baru untuk SETIAP enkripsi
  const cipher = createCipheriv(ALGO, getEncryptionKey(), iv, {
    authTagLength: TAG_LENGTH,
  });
  cipher.setAAD(Buffer.from(aad, "utf8"));

  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([Buffer.from([VERSION]), iv, tag, ciphertext]);
}

/** Dekripsi hasil `encryptBytes`. Melempar error generik jika dimanipulasi / aad salah. */
export function decryptBytes(payload: Buffer, aad: string): Buffer {
  if (payload.length <= HEADER_LENGTH || payload[0] !== VERSION) {
    throw new Error("Data terenkripsi tidak valid.");
  }

  const iv = payload.subarray(1, 1 + IV_LENGTH);
  const tag = payload.subarray(1 + IV_LENGTH, HEADER_LENGTH);
  const ciphertext = payload.subarray(HEADER_LENGTH);

  try {
    const decipher = createDecipheriv(ALGO, getEncryptionKey(), iv, {
      authTagLength: TAG_LENGTH,
    });
    decipher.setAAD(Buffer.from(aad, "utf8"));
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    // Jangan bocorkan detail kegagalan
    throw new Error("Gagal mendekripsi data.");
  }
}

/** Enkripsi teks (mis. NIK) -> string base64 untuk disimpan di kolom DB. */
export function encryptText(text: string, aad: string): string {
  return encryptBytes(Buffer.from(text, "utf8"), aad).toString("base64");
}

export function decryptText(encoded: string, aad: string): string {
  return decryptBytes(Buffer.from(encoded, "base64"), aad).toString("utf8");
}

/** NIK harus 16 digit. Hilangkan spasi/tanda baca sebelum diproses. */
export function normalizeNik(nik: string): string {
  const digits = nik.replace(/\D/g, "");
  if (digits.length !== 16) throw new Error("NIK harus 16 digit.");
  return digits;
}

/**
 * Blind index NIK: HMAC-SHA256 deterministik (hex 64 karakter).
 * Dipakai untuk pencarian kecocokan persis / cek duplikat tanpa menyimpan NIK plaintext.
 * Tidak bisa dipakai untuk pencarian parsial (LIKE).
 */
export function nikBlindIndex(nik: string): string {
  return createHmac("sha256", getHmacSalt())
    .update(`ktp-nik:v1:${normalizeNik(nik)}`, "utf8") // domain separation
    .digest("hex");
}
