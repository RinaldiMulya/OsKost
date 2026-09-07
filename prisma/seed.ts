import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
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

const seedRooms: SeedRoom[] = [
  {
    number: "001",
    name: "Standard A",
    price: 850000,
    status: "AVAILABLE",
    description: "Kamar mandi luar, cocok untuk yang simple.",
    facilities: ["Basic Wifi", "3x4 Area", "Kasur Single"],
    images: ["/images/rooms/room-1.webp"],
  },
  {
    number: "002",
    name: "Standard B",
    price: 1250000,
    status: "OCCUPIED",
    description: "Kamar mandi dalam, lebih privat dan nyaman.",
    facilities: ["AC", "Wifi", "3x4 Area", "Kamar Mandi Dalam"],
    images: ["/images/rooms/room-2.webp"],
  },
  {
    number: "003",
    name: "Premium A",
    price: 1500000,
    status: "OCCUPIED",
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
    status: "OCCUPIED",
    description: "Space lebih luas dengan balkon pribadi.",
    facilities: ["AC", "Private Balcony", "King Size Bed", "Work Desk"],
    images: ["/images/rooms/room-2.webp"],
  },
  {
    number: "005",
    name: "VIP Suite",
    price: 2500000,
    status: "MAINTENANCE",
    description: "Experience kemewahan anak kost sultan.",
    facilities: ["Full Kitchen", "Living Room", "Bathtub", "Garage"],
    images: ["/images/rooms/room-1.webp"],
  },
  {
    number: "006",
    name: "Standard C",
    price: 900000,
    status: "AVAILABLE",
    description: "Budget friendly dengan jendela besar.",
    facilities: ["Basic Wifi", "Natural Light", "Token Listrik Sendiri"],
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
    status: "MAINTENANCE",
    description: "Experience kemewahan anak kost sultan.",
    facilities: ["Full Kitchen", "Living Room", "Bathtub", "Garage"],
    images: ["/images/rooms/room-1.webp"],
  },
  {
    number: "009",
    name: "Standard C",
    price: 900000,
    status: "AVAILABLE",
    description: "Budget friendly dengan jendela besar.",
    facilities: ["Basic Wifi", "Natural Light", "Token Listrik Sendiri"],
    images: ["/images/rooms/room-3.webp"],
  },
  {
    number: "010",
    name: "VIP Suite",
    price: 2500000,
    status: "MAINTENANCE",
    description: "Experience kemewahan anak kost sultan.",
    facilities: ["Full Kitchen", "Living Room", "Bathtub", "Garage"],
    images: ["/images/rooms/room-1.webp"],
  },
  {
    number: "011",
    name: "Standard C",
    price: 900000,
    status: "AVAILABLE",
    description: "Budget friendly dengan jendela besar.",
    facilities: ["Basic Wifi", "Natural Light", "Token Listrik Sendiri"],
    images: ["/images/rooms/room-3.webp"],
  },
];

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Start seeding...");

  console.log("Cleaning up database...");
  await prisma.webhookLog.deleteMany({});
  await prisma.paymentMethod.deleteMany({});
  await prisma.discountPreset.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.panoramaImage.deleteMany({});
  await prisma.lease.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.tenantProfile.deleteMany({});
  await prisma.user.deleteMany({ where: { role: "TENANT" } });

  // 00. Seed Default Payment Methods & Discount Presets
  console.log("Seeding Payment Methods & Discount Presets...");
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

  const discountPresets = [
    {
      code: "GOOGLE_REVIEW",
      label: "Bebas Biaya Admin (Review Google Maps Bintang 5)",
      description: "Gratis biaya admin sewa bulan ini setelah memberikan rating Bintang 5 di Google Maps OsKost.",
      type: "FIXED",
      amount: 2000,
    },
    {
      code: "EARLY_BIRD",
      label: "Diskon Bayar Tepat Waktu (H-3)",
      description: "Potongan Rp 10.000 jika melunasi sewa minimal 3 hari sebelum tanggal jatuh tempo.",
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

  // 0. Seed Admin User
  const adminPassword = "adminpassword123!"; // Default admin password
  const hashedPassword = await bcryptjs.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@oskost.com" },
    update: {},
    create: {
      email: "admin@oskost.com",
      passwordHash: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log(`Admin user created/found with id: ${adminUser.id}`);

  // 1. Setup Property
  const property = await prisma.property.upsert({
    where: { name: "OSkost Pulo Jahe" },
    update: {},
    create: {
      name: "OSkost Pulo Jahe",
      address: "Jl. Pulo Jahe, Jakarta Timur",
    },
  });
  console.log(`Property created/found with id: ${property.id}`);

  // 2. Insert Rooms
  const dbRooms: Record<string, any> = {};
  for (const room of seedRooms) {
    const createdRoom = await prisma.room.upsert({
      where: {
        number_propertyId: {
          number: room.number,
          propertyId: property.id,
        },
      },
      update: {
        name: room.name,
        price: room.price,
        status: room.status,
        description: room.description,
        facilities: room.facilities,
        images: room.images,
      },
      create: {
        number: room.number,
        name: room.name,
        price: room.price,
        status: room.status,
        description: room.description,
        facilities: room.facilities,
        images: room.images,
        propertyId: property.id,
      },
    });
    dbRooms[room.number] = createdRoom;
    console.log(`Seeded room ${room.number} (${room.name})`);
  }

  // 3. Seed Tenants
  const tenantPassword = await bcryptjs.hash("oskost123", 10);

  // Tenant 1: Sarah Wijaya (Paid active lease)
  console.log("Seeding Sarah Wijaya...");
  const userSarah = await prisma.user.create({
    data: {
      email: "sarah.wijaya@gmail.com",
      phoneNumber: "081234567890",
      passwordHash: tenantPassword,
      role: "TENANT",
      tenantProfile: {
        create: {
          fullName: "Sarah Wijaya",
          ktpNumber: "3175012345670001",
          address: "Jl. Diponegoro No. 12, Bandung",
          emergencyContactName: "Hendra Wijaya (Father)",
          emergencyContactNumber: "+62 812-1111-2222",
        },
      },
    },
  });

  const leaseSarah = await prisma.lease.create({
    data: {
      userId: userSarah.id,
      roomId: dbRooms["002"].id,
      startDate: new Date("2025-08-01T00:00:00Z"),
      endDate: new Date("2026-08-01T00:00:00Z"),
      isActive: true,
    },
  });

  // Invoices for Sarah: Aug 2025 - Jun 2026 (Paid)
  for (let month = 8; month <= 12; month++) {
    await prisma.invoice.create({
      data: {
        leaseId: leaseSarah.id,
        dueDate: new Date(
          `2025-${month.toString().padStart(2, "0")}-01T00:00:00Z`,
        ),
        amount: 1250000,
        rentAmount: 1250000,
        status: "PAID",
        paidAt: new Date(
          `2025-${month.toString().padStart(2, "0")}-02T00:00:00Z`,
        ),
      },
    });
  }
  for (let month = 1; month <= 6; month++) {
    await prisma.invoice.create({
      data: {
        leaseId: leaseSarah.id,
        dueDate: new Date(
          `2026-${month.toString().padStart(2, "0")}-01T00:00:00Z`,
        ),
        amount: 1250000,
        rentAmount: 1250000,
        status: "PAID",
        paidAt: new Date(
          `2026-${month.toString().padStart(2, "0")}-02T00:00:00Z`,
        ),
      },
    });
  }

  // Tenant 2: Budi Santoso (Unpaid active lease)
  console.log("Seeding Budi Santoso...");
  const userBudi = await prisma.user.create({
    data: {
      email: "budi.santoso@gmail.com",
      phoneNumber: "081298765432",
      passwordHash: tenantPassword,
      role: "TENANT",
      tenantProfile: {
        create: {
          fullName: "Budi Santoso",
          ktpNumber: "3175012345670002",
          address: "Jl. Merdeka No. 45, Jakarta",
          emergencyContactName: "Siti Santoso (Mother)",
          emergencyContactNumber: "+62 812-9876-5432",
        },
      },
    },
  });

  const leaseBudi = await prisma.lease.create({
    data: {
      userId: userBudi.id,
      roomId: dbRooms["003"].id,
      startDate: new Date("2025-09-01T00:00:00Z"),
      endDate: new Date("2026-09-01T00:00:00Z"),
      isActive: true,
    },
  });

  // Invoices for Budi: Sep 2025 - Apr 2026 (Paid)
  for (let month = 9; month <= 12; month++) {
    await prisma.invoice.create({
      data: {
        leaseId: leaseBudi.id,
        dueDate: new Date(
          `2025-${month.toString().padStart(2, "0")}-01T00:00:00Z`,
        ),
        amount: 1500000,
        rentAmount: 1500000,
        status: "PAID",
        paidAt: new Date(
          `2025-${month.toString().padStart(2, "0")}-02T00:00:00Z`,
        ),
      },
    });
  }
  for (let month = 1; month <= 4; month++) {
    await prisma.invoice.create({
      data: {
        leaseId: leaseBudi.id,
        dueDate: new Date(
          `2026-${month.toString().padStart(2, "0")}-01T00:00:00Z`,
        ),
        amount: 1500000,
        rentAmount: 1500000,
        status: "PAID",
        paidAt: new Date(
          `2026-${month.toString().padStart(2, "0")}-02T00:00:00Z`,
        ),
      },
    });
  }
  // Unpaid Invoices: May 2026, Jun 2026
  await prisma.invoice.create({
    data: {
      leaseId: leaseBudi.id,
      dueDate: new Date("2026-05-01T00:00:00Z"),
      amount: 1800000,
      rentAmount: 1500000,
      utilityAmount: 200000,
      otherAmount: 100000,
      status: "UNPAID",
    },
  });
  await prisma.invoice.create({
    data: {
      leaseId: leaseBudi.id,
      dueDate: new Date("2026-06-01T00:00:00Z"),
      amount: 1800000,
      rentAmount: 1500000,
      utilityAmount: 200000,
      otherAmount: 100000,
      status: "UNPAID",
    },
  });

  // Tenant 3: Andi Pratama (Active lease expiring soon)
  console.log("Seeding Andi Pratama...");
  const userAndi = await prisma.user.create({
    data: {
      email: "andi.pratama@gmail.com",
      phoneNumber: "081255554444",
      passwordHash: tenantPassword,
      role: "TENANT",
      tenantProfile: {
        create: {
          fullName: "Andi Pratama",
          ktpNumber: "3175012345670003",
          address: "Jl. Sudirman No. 88, Surabaya",
          emergencyContactName: "Rudi Pratama (Brother)",
          emergencyContactNumber: "+62 812-7777-8888",
        },
      },
    },
  });

  // Expires on July 5, 2026 (29 days from June 6, 2026)
  const leaseAndi = await prisma.lease.create({
    data: {
      userId: userAndi.id,
      roomId: dbRooms["004"].id,
      startDate: new Date("2025-07-06T00:00:00Z"),
      endDate: new Date("2026-07-05T00:00:00Z"),
      isActive: true,
    },
  });

  // Invoices for Andi: Jul 2025 - Jun 2026 (Paid)
  for (let month = 7; month <= 12; month++) {
    await prisma.invoice.create({
      data: {
        leaseId: leaseAndi.id,
        dueDate: new Date(
          `2025-${month.toString().padStart(2, "0")}-06T00:00:00Z`,
        ),
        amount: 1800000,
        rentAmount: 1800000,
        status: "PAID",
        paidAt: new Date(
          `2025-${month.toString().padStart(2, "0")}-07T00:00:00Z`,
        ),
      },
    });
  }
  for (let month = 1; month <= 6; month++) {
    await prisma.invoice.create({
      data: {
        leaseId: leaseAndi.id,
        dueDate: new Date(
          `2026-${month.toString().padStart(2, "0")}-06T00:00:00Z`,
        ),
        amount: 1800000,
        rentAmount: 1800000,
        status: "PAID",
        paidAt: new Date(
          `2026-${month.toString().padStart(2, "0")}-07T00:00:00Z`,
        ),
      },
    });
  }

  // Tenant 4: Siti Rahma (Inactive / Checked-out Tenant)
  console.log("Seeding Siti Rahma...");
  const userSiti = await prisma.user.create({
    data: {
      email: "siti.rahma@gmail.com",
      phoneNumber: "081211112222",
      passwordHash: tenantPassword,
      role: "TENANT",
      tenantProfile: {
        create: {
          fullName: "Siti Rahma",
          ktpNumber: "3175012345670004",
          address: "Jl. Kartini No. 3, Semarang",
          emergencyContactName: "Ahmad (Husband)",
          emergencyContactNumber: "+62 812-4444-5555",
        },
      },
    },
  });

  const leaseSiti = await prisma.lease.create({
    data: {
      userId: userSiti.id,
      roomId: dbRooms["001"].id,
      startDate: new Date("2024-01-01T00:00:00Z"),
      endDate: new Date("2025-01-01T00:00:00Z"),
      isActive: false,
      exitReason: "Selesai Kontrak",
    },
  });

  // Invoices for Siti (All Paid)
  for (let month = 1; month <= 12; month++) {
    await prisma.invoice.create({
      data: {
        leaseId: leaseSiti.id,
        dueDate: new Date(
          `2024-${month.toString().padStart(2, "0")}-01T00:00:00Z`,
        ),
        amount: 850000,
        rentAmount: 850000,
        status: "PAID",
        paidAt: new Date(
          `2024-${month.toString().padStart(2, "0")}-02T00:00:00Z`,
        ),
      },
    });
  }

  console.log("Seeding finished successfully.");
}
/*
AnthropicPunyaRenal11#
*/

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
