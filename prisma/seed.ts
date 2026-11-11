import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, SaaSPlanTier } from "@prisma/client";
import bcryptjs from "bcryptjs";

type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

interface SeedRoom {
  number: string;
  name: string;
  price: number;
  status: RoomStatus;
  description: string;
  facilities: string[];
  images: string[];
}

// 11 Kamar Asli OSkost Pulo Jahe (Semua Status Awal: AVAILABLE)
const seedRooms: SeedRoom[] = [
  {
    number: "001",
    name: "Standard A",
    price: 850000,
    status: "AVAILABLE",
    description: "Kamar mandi luar, sirkulasi udara lancar, nyaman & tenang.",
    facilities: ["Basic Wifi", "3x4 Area", "Kasur Single", "Lemari"],
    images: ["/images/rooms/room-1.webp"],
  },
  {
    number: "002",
    name: "Standard B",
    price: 1250000,
    status: "AVAILABLE",
    description: "Kamar mandi dalam, lebih privat dan nyaman.",
    facilities: ["AC", "Wifi High Speed", "3x4 Area", "Kamar Mandi Dalam"],
    images: ["/images/rooms/room-2.webp"],
  },
  {
    number: "003",
    name: "Premium A",
    price: 1500000,
    status: "AVAILABLE",
    description: "Fully furnished, tinggal bawa badan.",
    facilities: [
      "AC",
      "Wifi High Speed",
      "4x4 Area",
      "Water Heater",
      "Smart TV",
    ],
    images: ["/images/rooms/room-3.webp"],
  },
  {
    number: "004",
    name: "Premium B",
    price: 1800000,
    status: "AVAILABLE",
    description: "Space lebih luas dengan meja kerja & balkon pribadi.",
    facilities: [
      "AC",
      "Private Balcony",
      "King Size Bed",
      "Work Desk",
      "Water Heater",
    ],
    images: ["/images/rooms/room-2.webp"],
  },
  {
    number: "005",
    name: "VIP Suite",
    price: 2500000,
    status: "AVAILABLE",
    description: "Kamar tipe suite dengan fasilitas terlengkap.",
    facilities: [
      "AC",
      "Kitchenette",
      "Water Heater",
      "Smart TV",
      "Living Area",
    ],
    images: ["/images/rooms/room-1.webp"],
  },
  {
    number: "006",
    name: "Standard C",
    price: 900000,
    status: "AVAILABLE",
    description:
      "Budget friendly dengan pencahayaan alami & token listrik mandiri.",
    facilities: [
      "Basic Wifi",
      "Natural Light",
      "Token Listrik Sendiri",
      "Kasur Single",
    ],
    images: ["/images/rooms/room-3.webp"],
  },
  {
    number: "007",
    name: "Premium B",
    price: 1800000,
    status: "AVAILABLE",
    description: "Space lebih luas dengan balkon pribadi.",
    facilities: ["AC", "Private Balcony", "King Size Bed", "Work Desk"],
    images: ["/images/rooms/room-2.webp"],
  },
  {
    number: "008",
    name: "VIP Suite",
    price: 2500000,
    status: "AVAILABLE",
    description: "Kamar eksklusif lantai atas dengan ventilasi maksimal.",
    facilities: ["AC", "Water Heater", "Smart TV", "Work Desk", "Balkon"],
    images: ["/images/rooms/room-1.webp"],
  },
  {
    number: "009",
    name: "Standard C",
    price: 900000,
    status: "AVAILABLE",
    description: "Budget friendly dengan jendela besar & udara sejuk.",
    facilities: ["Basic Wifi", "Natural Light", "Token Listrik Sendiri"],
    images: ["/images/rooms/room-3.webp"],
  },
  {
    number: "010",
    name: "VIP Suite",
    price: 2500000,
    status: "AVAILABLE",
    description: "Kamar luas dengan peredam suara & tempat tidur premium.",
    facilities: ["AC", "Water Heater", "Smart TV", "Mini Refrigerator"],
    images: ["/images/rooms/room-1.webp"],
  },
  {
    number: "011",
    name: "Standard C",
    price: 900000,
    status: "AVAILABLE",
    description: "Budget friendly, simpel dan tenang untuk istirahat.",
    facilities: ["Basic Wifi", "Natural Light", "Token Listrik Sendiri"],
    images: ["/images/rooms/room-3.webp"],
  },
];

const connectionString = (process.env.DATABASE_URL || "").split("?")[0];
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("==================================================");
  console.log("🧹 OSKOST PRODUCTION-READY CLEAN SEED");
  console.log("Mempersiapkan data riil OSkost Pulo Jahe (11 Kamar)");
  console.log("==================================================");

  // 1. Pembersihan total data dummy & transaksi sebelumnya
  console.log("Step 1: Membersihkan seluruh data dummy & log lama...");
  await prisma.webhookLog.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.saaSTransaction.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.discountClaim.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.lease.deleteMany({});
  await prisma.panoramaImage.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.tenantProfile.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.pushSubscription.deleteMany({});
  await prisma.saaSSubscription.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("✅ Seluruh data dummy berhasil dibersihkan.");

  // 2. Seed Metode Pembayaran Resmi Midtrans
  console.log("Step 2: Menyiapkan Master Metode Pembayaran...");
  const paymentMethods = [
    {
      methodCode: "BCA_VA",
      methodName: "BCA Virtual Account",
      feeType: "FLAT",
      feeAmount: 4000,
      tenantFeePercentage: 50,
      ownerFeePercentage: 50,
    },
    {
      methodCode: "MANDIRI_VA",
      methodName: "Mandiri Virtual Account",
      feeType: "FLAT",
      feeAmount: 4000,
      tenantFeePercentage: 50,
      ownerFeePercentage: 50,
    },
    {
      methodCode: "BNI_VA",
      methodName: "BNI Virtual Account",
      feeType: "FLAT",
      feeAmount: 4000,
      tenantFeePercentage: 50,
      ownerFeePercentage: 50,
    },
    {
      methodCode: "BRI_VA",
      methodName: "BRI Virtual Account",
      feeType: "FLAT",
      feeAmount: 4000,
      tenantFeePercentage: 50,
      ownerFeePercentage: 50,
    },
    {
      methodCode: "QRIS",
      methodName: "QRIS (GoPay, ShopeePay, Dana, dll)",
      feeType: "PERCENTAGE",
      feeAmount: 30, // 0.3% untuk UMI
      tenantFeePercentage: 50,
      ownerFeePercentage: 50,
    },
  ];

  for (const pm of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { methodCode: pm.methodCode },
      update: pm,
      create: pm,
    });
  }

  // 3. Seed Preset Diskon Sewa
  console.log("Step 3: Menyiapkan Preset Diskon Promosi...");
  const discountPresets = [
    {
      code: "GOOGLE_REVIEW",
      label: "Bebas Biaya Admin (Review Google Maps Bintang 5)",
      description:
        "Gratis biaya admin sewa bulan ini setelah memberikan rating Bintang 5 di Google Maps OsKost.",
      type: "FIXED",
      amount: 2000,
    },
    {
      code: "EARLY_BIRD",
      label: "Diskon Bayar Tepat Waktu (H-3)",
      description:
        "Potongan Rp 10.000 jika melunasi sewa minimal 3 hari sebelum tanggal jatuh tempo.",
      type: "FIXED",
      amount: 10000,
    },
  ];

  for (const dp of discountPresets) {
    await prisma.discountPreset.upsert({
      where: { code: dp.code },
      update: dp,
      create: dp,
    });
  }

  // 4. Seed SaaS Plan Tiers (Katalog Paket Harga B2B SaaS)
  console.log("Step 4: Menyiapkan Katalog Paket SaaS (SaaSPlan)...");
  const planSeeds = [
    {
      tier: "FREE" as SaaSPlanTier,
      name: "Starter Trial / Free",
      description:
        "Cocok untuk kost mini pemula 1-5 kamar tanpa biaya berlangganan.",
      monthlyPrice: 0,
      annualPrice: 0,
      maxRooms: 5,
      maxProperties: 1,
      isPopular: false,
      features: {
        adminDashboard: true,
        midtransGateway: false,
        photo360Tour: false,
        smartLock: false,
        customDomain: false,
        exportReports: false,
        dedicatedSupport: false,
      },
    },
    {
      tier: "STARTER" as SaaSPlanTier,
      name: "Starter Juragan",
      description:
        "Pilihan pas untuk kost berkembang 6-15 unit kamar dengan pembukuan rapi.",
      monthlyPrice: 69000,
      annualPrice: 690000,
      maxRooms: 15,
      maxProperties: 1,
      isPopular: false,
      features: {
        adminDashboard: true,
        midtransGateway: true,
        photo360Tour: false,
        smartLock: false,
        customDomain: false,
        exportReports: true,
        dedicatedSupport: false,
      },
    },
    {
      tier: "GROWTH" as SaaSPlanTier,
      name: "Growth Residence",
      description:
        "Solusi lengkap kost 16-40 unit dengan fitur Virtual Tour 360 & multi-staff.",
      monthlyPrice: 179000,
      annualPrice: 1790000,
      maxRooms: 40,
      maxProperties: 2,
      isPopular: true,
      features: {
        adminDashboard: true,
        midtransGateway: true,
        photo360Tour: true,
        smartLock: false,
        customDomain: false,
        exportReports: true,
        dedicatedSupport: false,
      },
    },
    {
      tier: "PRO" as SaaSPlanTier,
      name: "Pro Scale",
      description:
        "Solusi profesional skala 41-100 kamar dengan dukungan IoT Smart Lock.",
      monthlyPrice: 349000,
      annualPrice: 3490000,
      maxRooms: 100,
      maxProperties: 5,
      isPopular: false,
      features: {
        adminDashboard: true,
        midtransGateway: true,
        photo360Tour: true,
        smartLock: true,
        customDomain: true,
        exportReports: true,
        dedicatedSupport: true,
      },
    },
    {
      tier: "ENTERPRISE" as SaaSPlanTier,
      name: "Enterprise Multi-Branch",
      description:
        "Paket kustom jaringan kost besar >100 kamar dengan SLA & integrasi kustom.",
      monthlyPrice: 1000000,
      annualPrice: 10000000,
      maxRooms: 250,
      maxProperties: 10,
      isPopular: false,
      features: {
        adminDashboard: true,
        midtransGateway: true,
        photo360Tour: true,
        smartLock: true,
        customDomain: true,
        exportReports: true,
        dedicatedSupport: true,
      },
    },
  ];

  for (const p of planSeeds) {
    await prisma.saaSPlan.upsert({
      where: { tier: p.tier },
      update: p,
      create: p,
    });
  }

  // 5. Seed Super Admin (Pengelola Platform OsKost)
  console.log("Step 5: Menyiapkan Akun Super Admin...");
  const hashedSuperAdminPassword = await bcryptjs.hash(
    "PasswordSuperAdmin123!",
    10,
  );
  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@oskost.id",
      phoneNumber: "081199001122",
      passwordHash: hashedSuperAdminPassword,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });
  console.log(`✅ Super Admin created: ${superAdmin.email}`);

  // 6. Seed Admin / Owner Asli OSkost Pulo Jahe
  console.log("Step 6: Menyiapkan Akun Pemilik OSkost Pulo Jahe...");
  const hashedAdminPassword = await bcryptjs.hash("adminpassword123!", 10);
  const adminOwner = await prisma.user.create({
    data: {
      email: "admin@oskost.com",
      phoneNumber: "081234567890",
      passwordHash: hashedAdminPassword,
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log(`✅ Admin OSkost Pulo Jahe created: ${adminOwner.email}`);

  // 7. Setup Properti Riil OSkost Pulo Jahe
  console.log("Step 7: Mendaftarkan Properti OSkost Pulo Jahe...");
  const propertyPuloJahe = await prisma.property.create({
    data: {
      name: "OSkost Pulo Jahe",
      slug: "pulo-jahe",
      address:
        "Jl. Kp. Pulo Jahe No.104b, RT.03/RW.05, Jatinegara, Kec. Cakung, Jakarta Timur 13930",
      mapsLink: "https://maps.google.com/?q=-6.1952196,106.92452",
      ownerId: adminOwner.id,
      primaryColorHex: "#8C6239", // Wabi-Sabi Terracotta
      accentColorHex: "#5D6654", // Koke Moss
      managerPhone: "087890976782", // Ibu Ayu (Pengelola)
      guardPhone: "08123456789", // Pos Jaga
      emergencyPhone: "112",
      features: {
        hasSmartLock: false,
        hasSosButton: true,
        hasTechnician: true,
        whiteLabelEnabled: true,
      },
    },
  });
  console.log(
    `✅ Property created: ${propertyPuloJahe.name} (${propertyPuloJahe.id})`,
  );

  // 8. Setup SaaS Subscription Aktif untuk Pulo Jahe
  console.log("Step 8: Mengaktifkan Paket SaaS OSkost Pulo Jahe...");
  await prisma.saaSSubscription.create({
    data: {
      propertyId: propertyPuloJahe.id,
      planTier: "GROWTH",
      status: "ACTIVE",
      monthlyPrice: 179000,
      maxRooms: 40,
      currentPeriodStart: new Date(),
      notes: "Properti Pilot #1 - OSkost Pulo Jahe (Tier Growth + White-Labeling Mobile)",
    },
  });
  console.log("✅ SaaS Subscription aktif (Tier: GROWTH, Kuota: 40 Kamar).");

  // 9. Setup 11 Kamar Asli OSkost Pulo Jahe
  console.log("Step 9: Menyiapkan 11 Kamar OSkost Pulo Jahe...");
  for (const room of seedRooms) {
    await prisma.room.create({
      data: {
        number: room.number,
        name: room.name,
        price: room.price,
        status: room.status, // AVAILABLE
        description: room.description,
        facilities: room.facilities,
        images: room.images,
        propertyId: propertyPuloJahe.id,
      },
    });
    console.log(
      `   - Kamar ${room.number}: ${room.name} (Rp ${room.price.toLocaleString("id-ID")}) -> AVAILABLE`,
    );
  }

  console.log("==================================================");
  console.log("🎉 SEEDING SELESAI!");
  console.log("1. Super Admin: superadmin@oskost.id / PasswordSuperAdmin123!");
  console.log("2. Admin Pulo Jahe: admin@oskost.com / adminpassword123!");
  console.log("3. Properti: OSkost Pulo Jahe (11 Kamar Siap Huni)");
  console.log("4. Penghuni: KOSONG BERSIH (0 Dummy Tenants/Invoices)");
  console.log("==================================================");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error("❌ Error saat seeding:", e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
