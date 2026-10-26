// scripts/migrate-pulojahe-payment.ts
import "dotenv/config";
import { prisma } from "../src/lib/db";
import { encryptPaymentKey, decryptPaymentKey, isEncryptedPaymentKey, maskApiKey } from "../src/lib/security/payment-crypto";

async function main() {
  console.log("=== MIGRATING PULO JAHE PAYMENT CREDENTIALS TO TIER PRO ===");

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
  const merchantId = process.env.MIDTRANS_MERCHANT_ID;

  if (!serverKey || !clientKey) {
    throw new Error("MIDTRANS_SERVER_KEY atau NEXT_PUBLIC_MIDTRANS_CLIENT_KEY belum diset di .env");
  }

  // Cari properti pilot Pulo Jahe
  let property = await prisma.property.findUnique({
    where: { slug: "pulo-jahe" },
    include: { subscription: true },
  });

  if (!property) {
    // Cari properti pertama jika slug belum pulo-jahe
    const all = await prisma.property.findMany({ take: 1, include: { subscription: true } });
    if (all.length > 0) {
      property = all[0];
    }
  }

  if (!property) {
    console.error("Tidak ada properti ditemukan di database.");
    return;
  }

  console.log(`Found Property: ${property.name} (ID: ${property.id}, Slug: ${property.slug})`);

  // Enkripsi server key dengan property.id sebagai AAD
  const encryptedServerKey = encryptPaymentKey(serverKey, property.id);
  console.log(`Encrypted Server Key generated: ${encryptedServerKey.slice(0, 30)}...`);

  // Update properti dengan konfigurasi Tier Pro + Tier Starter fallback
  const updated = await prisma.property.update({
    where: { id: property.id },
    data: {
      midtransMerchantId: merchantId || "M392756841",
      midtransServerKey: encryptedServerKey,
      midtransClientKey: clientKey,
      isMidtransActive: true,
      bankName: property.bankName || "BCA",
      bankAccountNumber: property.bankAccountNumber || "1234567890",
      bankAccountHolder: property.bankAccountHolder || "Ahmad Rinaldi",
      bankAccountInfo: property.bankAccountInfo || "Harap sertakan nama penghuni dan nomor kamar pada berita transfer.",
    },
  });

  // Pastikan SaaSSubscription ada dan tier-nya PRO
  if (property.subscription) {
    await prisma.saaSSubscription.update({
      where: { id: property.subscription.id },
      data: { planTier: "PRO", status: "ACTIVE" },
    });
    console.log("SaaS Subscription diupdate ke PRO.");
  } else {
    await prisma.saaSSubscription.create({
      data: {
        propertyId: property.id,
        planTier: "PRO",
        status: "ACTIVE",
        maxRooms: 20,
        monthlyPrice: 199000,
      },
    });
    console.log("SaaS Subscription PRO baru dibuat.");
  }

  // Verifikasi pembacaan & dekripsi ulang
  const verifyProp = await prisma.property.findUnique({ where: { id: property.id } });
  if (!verifyProp || !verifyProp.midtransServerKey) {
    throw new Error("Gagal verifikasi data properti.");
  }

  console.log("Is Encrypted in DB:", isEncryptedPaymentKey(verifyProp.midtransServerKey));
  const decrypted = decryptPaymentKey(verifyProp.midtransServerKey, verifyProp.id);
  console.log("Decryption Test:", decrypted === serverKey ? "SUCCESS (Matched!)" : "FAILED (Mismatch!)");
  console.log("Masked Server Key:", maskApiKey(decrypted));
  console.log("Public Client Key:", verifyProp.midtransClientKey);
  console.log("Is Midtrans Active:", verifyProp.isMidtransActive);
  console.log("=== MIGRATION COMPLETE ===");
}

main()
  .catch((err) => {
    console.error("Migration Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
