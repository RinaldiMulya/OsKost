// ============================================================
// OsKost Housing Intelligence — OsFund Mock Data & Calculator
// Model Pembiayaan Renovasi Kost Berbasis Revenue-Sharing Auto-Split
// Terintegrasi dengan Ekosistem Pemenang BTN Housingpreneur
// ============================================================

export interface EcosystemPackage {
  id: string;
  category: "Architecture" | "Green Material" | "Certified Builder" | "IoT Enforcer";
  title: string;
  partnerName: string;
  winnerAward: string; // Penghargaan juara di BTN Housingpreneur
  description: string;
  costEstimate: number; // Dalam IDR
  features: string[];
  icon: string;
  isSelectedDefault: boolean;
}

export const ECOSYSTEM_PACKAGES: EcosystemPackage[] = [
  {
    id: "pkg-arch",
    category: "Architecture",
    title: "Desain Ekspansi Modular (+5 Kamar Vertikal)",
    partnerName: "Aparthouse & KOTA[K] TUMBUH",
    winnerAward: "Juara 1 & 3 House Design BTN 2025",
    description:
      "Desain arsitektur mikro-vertikal hemat lahan, pencahayaan alami optimal, dan sistem modular siap bangun bertahap.",
    costEstimate: 10000000,
    features: [
      "Gambar Kerja Arsitektur & Struktur Siap IMB/PBG",
      "Optimalisasi Ventilasi Silang & Pencahayaan Alami",
      "RAB Transparan Berstandar Konstruksi Nasional",
    ],
    icon: "📐",
    isSelectedDefault: true,
  },
  {
    id: "pkg-material",
    category: "Green Material",
    title: "Material Daur Ulang & Cat Ramah Lingkungan",
    partnerName: "RR Board (Waste4Change) & Jelanpaint",
    winnerAward: "Juara Inovasi Material Sirkular BTN 2025",
    description:
      "Papan partisi dinding daur ulang plastik bernilai akustik tinggi dan cat emisi rendah dari minyak jelantah terolah.",
    costEstimate: 45000000,
    features: [
      "Partisi Dinding Tahan Api & Kedap Suara",
      "Cat Emisi Rendah (Low-VOC) Bersertifikasi Hijau",
      "Memenuhi Kriteria Green Financing Bank BTN",
    ],
    icon: "🌱",
    isSelectedDefault: true,
  },
  {
    id: "pkg-builder",
    category: "Certified Builder",
    title: "Eksekutor Lapangan & Tukang Tersertifikasi",
    partnerName: "Paktukang.com & TRAIN-O",
    winnerAward: "Juara 1 & 2 House Tech BTN 2024–2025",
    description:
      "Penyedia tenaga tukang bangunan tersertifikasi digital, terikat standar K3, dengan pengawasan progres real-time.",
    costEstimate: 35000000,
    features: [
      "Tenaga Kerja Konstruksi Bersertifikat BNSP",
      "Garansi Pekerjaan 60 Hari Pasca-Serah Terima",
      "Monitoring Progres Renovasi via Dashboard Digital",
    ],
    icon: "👷",
    isSelectedDefault: true,
  },
  {
    id: "pkg-iot",
    category: "IoT Enforcer",
    title: "OsNode IoT Smart Enforcer (Perangkat Kunci & Arus)",
    partnerName: "OsNode IoT × myECO Sensor",
    winnerAward: "Inovasi Hardware & Penghemat Energi BTN",
    description:
      "Perangkat pengunci kepatuhan: listrik kamar & akses e-KTP sinkron otomatis dengan status pembayaran sewa resmi.",
    costEstimate: 10000000,
    features: [
      "Reader e-KTP / NFC PN532 untuk Akses Kamar",
      "Relay Pemutus Arus Otomatis Berbasis Status Server",
      "Sensor Monitoring Arus Daya Listrik Real-Time",
    ],
    icon: "⚡",
    isSelectedDefault: true,
  },
];

export interface AutoSplitSimulationInput {
  totalLoanAmount: number; // Total biaya renovasi (RAB)
  newRoomsCount: number; // Jumlah kamar baru hasil renovasi
  rentPricePerRoom: number; // Harga sewa per kamar per bulan
  occupancyRatePct: number; // Estimasi keterisian (default: 90%)
  splitPercentageBtn: number; // Porsi pemotongan BTN (default: 25%)
}

export interface AutoSplitSimulationResult {
  monthlyGrossRevenue: number; // Total omzet bulanan dari kamar baru
  monthlyBtnRepayment: number; // Potongan yang otomatis mengalir ke BTN
  monthlyOwnerNetIncome: number; // Pendapatan bersih yang masuk ke rekening pemilik kost
  estimatedPayoffMonths: number; // Estimasi waktu pelunasan dalam bulan
  annualOwnerExtraRevenue: number; // Tambahan omzet tahunan bersih untuk pemilik kost
}

export function calculateAutoSplit(
  input: AutoSplitSimulationInput
): AutoSplitSimulationResult {
  const effectiveRooms = (input.newRoomsCount * input.occupancyRatePct) / 100;
  const monthlyGrossRevenue = effectiveRooms * input.rentPricePerRoom;

  const monthlyBtnRepayment =
    (monthlyGrossRevenue * input.splitPercentageBtn) / 100;
  const monthlyOwnerNetIncome = monthlyGrossRevenue - monthlyBtnRepayment;

  const estimatedPayoffMonths =
    monthlyBtnRepayment > 0
      ? Math.ceil(input.totalLoanAmount / monthlyBtnRepayment)
      : 0;

  const annualOwnerExtraRevenue = monthlyOwnerNetIncome * 12;

  return {
    monthlyGrossRevenue,
    monthlyBtnRepayment,
    monthlyOwnerNetIncome,
    estimatedPayoffMonths,
    annualOwnerExtraRevenue,
  };
}

