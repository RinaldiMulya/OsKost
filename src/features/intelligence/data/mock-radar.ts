// ============================================================
// OsKost Housing Intelligence — Mock Data Layer
// File ini berisi seluruh data simulasi untuk OsRadar demo.
// Mode A: Preset Showcase (3 lokasi tervalidasi)
// Mode B: Dynamic Simulator (input alamat sembarang → kalkulasi dinamis)
// ============================================================

export type FloodRiskLevel = "LOW" | "MODERATE" | "HIGH";
export type RingKey = "ring1" | "ring2" | "ring3";

export interface AmenityItem {
  name: string;
  type: string;
  distance_m: number;
  icon: string;
}

export interface WhitespaceGap {
  missing_service: string;
  resident_density: string;
  opportunity_index: "SANGAT TINGGI" | "TINGGI" | "SEDANG";
  actionable_insight: string;
  btn_product: string;
}

export interface Ring1Data {
  radius_m: 500;
  score: number;
  label: string;
  color: string; // hex
  amenities: AmenityItem[];
  whitespace: WhitespaceGap | null;
}

export interface Ring2Data {
  radius_m: 1500;
  score: number;
  label: string;
  color: string;
  nodes: AmenityItem[];
  mobility_verdict: string;
  rent_premium_pct: number; // estimasi kenaikan nilai sewa karena transit
}

export interface Ring3Data {
  radius_m: 5000;
  score: number;
  label: string;
  color: string;
  anchors: (AmenityItem & { estimated_population?: string })[];
  demand_verdict: string;
  occupancy_projection_pct: number;
}

export interface FloodIntelligence {
  risk_level: FloodRiskLevel;
  status: string;
  color_code: string;
  historical_risk_pct: number;
  elevation_masl: number;
  notes: string;
}

export interface RadarLocation {
  id: string;
  name: string;
  short_name: string;
  address: string;
  city: string;
  coordinates: { lat: number; lng: number };
  is_real_data: boolean; // true = data riil, false = simulasi
  segment: "industrial" | "campus" | "suburban";
  overall_score: number;
  score_grade: string;
  bank_recommendation: string;
  flood: FloodIntelligence;
  rings: {
    ring1: Ring1Data;
    ring2: Ring2Data;
    ring3: Ring3Data;
  };
}

// ============================================================
// PRESET LOCATIONS — Mode A (Data Terverifikasi)
// ============================================================
export const PRESET_LOCATIONS: RadarLocation[] = [
  // ---------------------------------------------------------
  // 1. OsKost Pulo Jahe — DATA RIIL (Lokasi operasional aktif)
  // ---------------------------------------------------------
  {
    id: "pulo-jahe-cakung",
    name: "OsKost Smart Living — Pulo Jahe, Cakung",
    short_name: "Pulo Jahe, Jakarta Timur",
    address: "Jl. Kp. Pulo Jahe No.104b, Cakung, Jakarta Timur, 13930",
    city: "Jakarta Timur",
    coordinates: { lat: -6.1952196, lng: 106.92452 },
    is_real_data: true,
    segment: "industrial",
    overall_score: 88,
    score_grade: "A — Sangat Strategis",
    bank_recommendation: "LAYAK DANA TALANG RENOVASI & KPR MIKRO BTN",
    flood: {
      risk_level: "LOW",
      status: "ZONA AMAN BANJIR (10-Year Safe Zone)",
      color_code: "#10B981",
      historical_risk_pct: 4,
      elevation_masl: 14,
      notes:
        "Topografi datar berstabilisasi. Jarak 850 m dari Kali Buaran dengan tanggul terawat Pemda DKI.",
    },
    rings: {
      ring1: {
        radius_m: 500,
        score: 85,
        label: "Ring 1 — Mikro-Walkable Tropis (< 500 m)",
        color: "#10B981",
        amenities: [
          { name: "Pasar Pulo Jahe", type: "market", distance_m: 45, icon: "🏪" },
          { name: "Toko Sembako 24 Jam Monicha Jaya", type: "grocery", distance_m: 100, icon: "🛒" },
          { name: "Toko Embun Via (Kebutuhan Harian)", type: "grocery", distance_m: 85, icon: "🛒" },
          { name: "Klinik Pratama Sumber Waluyo Medika", type: "clinic", distance_m: 450, icon: "🏥" },
        ],
        whitespace: {
          missing_service: "Laundry Kiloan & Dry Clean",
          resident_density: "1.400+ jiwa dalam radius 500 m",
          opportunity_index: "SANGAT TINGGI",
          actionable_insight:
            "Ketimpangan fasilitas primer: Terdapat 1.400+ penghuni/buruh pabrik namun nihil layanan laundry kiloan dalam radius jalan kaki tropis (<500m). Potensi omzet Rp 12–15 jt/bln.",
          btn_product: "KUR Mikro Ekosistem Perumahan BTN (Maks. Rp 100 Juta, Bunga 6%)",
        },
      },
      ring2: {
        radius_m: 1500,
        score: 82,
        label: "Ring 2 — Feeder Transit & Roda Dua (1 – 1,5 km)",
        color: "#00529C",
        nodes: [
          { name: "Halte TransJakarta Pengarengan", type: "bus_rapid", distance_m: 850, icon: "🚌" },
          { name: "Halte TransJakarta JIEP", type: "bus_rapid", distance_m: 1000, icon: "🚌" },
          { name: "SPBU Pertamina 34-13901", type: "fuel", distance_m: 700, icon: "⛽" },
          { name: "ATM Center Kawasan Industri", type: "atm", distance_m: 950, icon: "🏧" },
        ],
        mobility_verdict:
          "Integrasi first-mile roda dua: 3 menit motor ke Halte TJ & SPBU, menekan ongkos komuter harian warga ke koridor kerja.",
        rent_premium_pct: 15,
      },
      ring3: {
        radius_m: 5000,
        score: 95,
        label: "Ring 3 — Generator Ekonomi & Penyangga Sprawl (3 – 5 km)",
        color: "#7C3AED",
        anchors: [
          {
            name: "Kawasan Industri Pulo Gadung (PT JIEP)",
            type: "industrial_hub",
            distance_m: 1400,
            icon: "🏭",
            estimated_population: "45.000+ pekerja aktif",
          },
          {
            name: "Universitas Negeri Jakarta (Kampus B)",
            type: "university",
            distance_m: 3800,
            icon: "🎓",
            estimated_population: "12.000+ mahasiswa",
          },
          {
            name: "RS Harapan Jayakarta",
            type: "hospital",
            distance_m: 4700,
            icon: "🏥",
            estimated_population: "Rujukan 150+ pasien/hari",
          },
          {
            name: "PT Yamaha Motor Parts Mfg Indonesia",
            type: "factory",
            distance_m: 1200,
            icon: "⚙️",
            estimated_population: "5.000+ karyawan",
          },
        ],
        demand_verdict:
          "Penjamin permintaan masif dari 3 sektor berbeda. Risiko kamar kosong jangka panjang sangat rendah (<8%).",
        occupancy_projection_pct: 92,
      },
    },
  },

  // ---------------------------------------------------------
  // 2. Pogung, Sleman — Segmen Kampus (UGM) — Simulasi
  // ---------------------------------------------------------
  {
    id: "pogung-sleman-ugm",
    name: "Kost Kawasan Kampus — Pogung, Sleman",
    short_name: "Pogung, Sleman (Dekat UGM)",
    address: "Jl. Pogung Rejo, Sinduadi, Sleman, D.I. Yogyakarta, 55284",
    city: "Sleman, Yogyakarta",
    coordinates: { lat: -7.7676, lng: 110.3728 },
    is_real_data: false,
    segment: "campus",
    overall_score: 91,
    score_grade: "A+ — Premium Kampus",
    bank_recommendation: "LAYAK KPR MIKRO & INVESTASI PROPERTI BTN",
    flood: {
      risk_level: "LOW",
      status: "ZONA AMAN BANJIR (Dataran Tinggi Lereng Merapi)",
      color_code: "#10B981",
      historical_risk_pct: 2,
      elevation_masl: 112,
      notes:
        "Elevasi tinggi 112 mdpl, drainase lereng alami optimal. Tidak tercatat genangan signifikan dalam 10 tahun terakhir.",
    },
    rings: {
      ring1: {
        radius_m: 500,
        score: 95,
        label: "Ring 1 — Mikro-Walkable (< 500 m)",
        color: "#10B981",
        amenities: [
          { name: "Warung Makan & Angkringan Pogung", type: "food", distance_m: 60, icon: "🍚" },
          { name: "Indomaret Pogung", type: "minimarket", distance_m: 150, icon: "🛒" },
          { name: "Laundry Kiloan FreshClean", type: "laundry", distance_m: 200, icon: "🧺" },
          { name: "Apotek Kimia Farma Pogung", type: "pharmacy", distance_m: 350, icon: "💊" },
        ],
        whitespace: {
          missing_service: "Co-Working Space & Print Center",
          resident_density: "3.200+ mahasiswa dalam radius 500 m",
          opportunity_index: "TINGGI",
          actionable_insight:
            "Potensi bisnis co-working Rp 20–35 jt/bulan. Demand mahasiswa UGM & UNY sangat tinggi.",
          btn_product: "KUR Usaha Produktif BTN (Maks. Rp 500 Juta)",
        },
      },
      ring2: {
        radius_m: 1500,
        score: 88,
        label: "Ring 2 — Akses Transit (1 – 1,5 km)",
        color: "#00529C",
        nodes: [
          { name: "Halte Trans Jogja Pogung", type: "bus_rapid", distance_m: 400, icon: "🚌" },
          { name: "Stasiun KRL Maguwo (8 km via tol)", type: "train_station", distance_m: 8000, icon: "🚆" },
          { name: "SPBU Pogung Rejo", type: "fuel", distance_m: 600, icon: "⛽" },
        ],
        mobility_verdict:
          "Halte Trans Jogja 400 m, akses ke seluruh kota. Kampus UGM bisa jalan kaki 15 menit.",
        rent_premium_pct: 18,
      },
      ring3: {
        radius_m: 5000,
        score: 97,
        label: "Ring 3 — Tarikan Ekonomi (3 – 5 km)",
        color: "#7C3AED",
        anchors: [
          {
            name: "Universitas Gadjah Mada (UGM)",
            type: "university",
            distance_m: 1500,
            icon: "🎓",
            estimated_population: "55.000+ mahasiswa & staf",
          },
          {
            name: "Universitas Negeri Yogyakarta (UNY)",
            type: "university",
            distance_m: 3000,
            icon: "🎓",
            estimated_population: "22.000+ mahasiswa",
          },
          {
            name: "RS Sardjito (Rumah Sakit Pusat UGM)",
            type: "hospital",
            distance_m: 2000,
            icon: "🏥",
            estimated_population: "Rujukan regional DIY",
          },
        ],
        demand_verdict:
          "Generator permintaan terkuat di DIY. 2 universitas besar memastikan okupansi kost hampir tak pernah turun di bawah 90%.",
        occupancy_projection_pct: 97,
      },
    },
  },

  // ---------------------------------------------------------
  // 3. BSD City, Tangerang Selatan — Segmen Komuter Suburban
  // ---------------------------------------------------------
  {
    id: "bsd-tangsel-komuter",
    name: "Hunian Pekerja Sub-Urban — BSD City, Tangsel",
    short_name: "BSD City, Tangerang Selatan",
    address: "Jl. BSD Raya Utama, Pagedangan, Tangerang Selatan, 15339",
    city: "Tangerang Selatan, Banten",
    coordinates: { lat: -6.3014, lng: 106.6534 },
    is_real_data: false,
    segment: "suburban",
    overall_score: 79,
    score_grade: "B+ — Potensial Berkembang",
    bank_recommendation: "LAYAK KPR SUBSIDI MBR & EKSPANSI BTN",
    flood: {
      risk_level: "LOW",
      status: "ZONA AMAN BANJIR (Perencanaan Kawasan Modern)",
      color_code: "#10B981",
      historical_risk_pct: 6,
      elevation_masl: 48,
      notes:
        "Kawasan BSD direncanakan dengan drainase terpadu. Elevasi 48 mdpl, risiko minor hanya di titik-titik rendah tertentu.",
    },
    rings: {
      ring1: {
        radius_m: 500,
        score: 72,
        label: "Ring 1 — Mikro-Walkable (< 500 m)",
        color: "#F59E0B",
        amenities: [
          { name: "Food Court Intermoda BSD", type: "food", distance_m: 350, icon: "🍔" },
          { name: "Superindo BSD", type: "grocery", distance_m: 450, icon: "🛒" },
        ],
        whitespace: {
          missing_service: "Warteg / Warung Makan Murah & Apotek 24 Jam",
          resident_density: "8.500+ pekerja kantoran dalam radius 1 km",
          opportunity_index: "SANGAT TINGGI",
          actionable_insight:
            "Pasar makanan murah 24 jam sangat kurang. Pekerja shift malam BSD butuh opsi makan terjangkau.",
          btn_product: "KUR Kuliner & Retail BTN (Maks. Rp 100 Juta, Bunga Subsidi)",
        },
      },
      ring2: {
        radius_m: 1500,
        score: 85,
        label: "Ring 2 — Akses Transit (1 – 1,5 km)",
        color: "#00529C",
        nodes: [
          { name: "Stasiun KRL/LRT BSD City (Sudimara)", type: "train_station", distance_m: 1200, icon: "🚆" },
          { name: "Terminal Bus Intermoda BSD", type: "bus_terminal", distance_m: 400, icon: "🚌" },
          { name: "SPBU Shell BSD", type: "fuel", distance_m: 600, icon: "⛽" },
          { name: "ATM Center Mall BSD", type: "atm", distance_m: 800, icon: "🏧" },
        ],
        mobility_verdict:
          "Stasiun KRL Sudimara 1,2 km. Akses langsung ke Jakarta Pusat 45 menit. Terminal Intermoda untuk bus AKAP.",
        rent_premium_pct: 20,
      },
      ring3: {
        radius_m: 5000,
        score: 82,
        label: "Ring 3 — Tarikan Ekonomi (3 – 5 km)",
        color: "#7C3AED",
        anchors: [
          {
            name: "Kawasan Perkantoran BSD (Foresta Business Loft)",
            type: "office_complex",
            distance_m: 1500,
            icon: "🏢",
            estimated_population: "35.000+ pekerja kantoran",
          },
          {
            name: "Universitas Multimedia Nusantara (UMN)",
            type: "university",
            distance_m: 3000,
            icon: "🎓",
            estimated_population: "8.000+ mahasiswa",
          },
          {
            name: "RS Eka Hospital BSD",
            type: "hospital",
            distance_m: 2500,
            icon: "🏥",
            estimated_population: "Spesialis modern 300+ TT",
          },
        ],
        demand_verdict:
          "Kawasan berkembang pesat. Pekerja kantoran BSD menjadi segmen utama. Potensi nilai properti naik 12–20% dalam 3 tahun.",
        occupancy_projection_pct: 85,
      },
    },
  },
];

// ============================================================
// DYNAMIC SIMULATOR DATA — Mode B
// Data generatif yang dipakai saat user input alamat sembarang.
// Sistem akan menghitung berdasarkan koordinat klik/input.
// ============================================================

export interface DynamicScanResult {
  score: number;
  grade: string;
  flood_risk: FloodRiskLevel;
  flood_note: string;
  ring1_score: number;
  ring2_score: number;
  ring3_score: number;
  whitespace_alert: string | null;
  occupancy_projection: number;
}

/**
 * Fungsi simulasi scoring dinamis.
 * Pada implementasi nyata, ini akan memanggil Google Places API.
 * Saat ini: menghasilkan skor pseudo-random namun terasa "nyata"
 * berdasarkan koordinat yang diberikan agar demo terasa live.
 */
export function simulateDynamicScan(lat: number, lng: number): DynamicScanResult {
  // Seed angka dari koordinat agar konsisten per lokasi
  const seed = Math.abs(Math.round((lat * 1000 + lng * 1000) % 100));
  const normalize = (val: number, min: number, max: number) =>
    Math.min(max, Math.max(min, val));

  const r1 = normalize(55 + (seed % 35), 55, 95);
  const r2 = normalize(50 + ((seed * 3) % 40), 50, 92);
  const r3 = normalize(45 + ((seed * 7) % 48), 45, 95);
  const overall = Math.round(r1 * 0.4 + r2 * 0.3 + r3 * 0.3);

  const floodRisk: FloodRiskLevel =
    overall >= 80 ? "LOW" : overall >= 65 ? "MODERATE" : "HIGH";

  const whitespaceOptions = [
    "Laundry Kiloan & Dry Clean",
    "Warung Makan Murah 24 Jam",
    "Co-Working Space & Printer",
    "Apotek / Klinik 24 Jam",
    "ATM Center & Mobile Banking",
  ];
  const whitespace =
    r1 < 85 ? whitespaceOptions[seed % whitespaceOptions.length] : null;

  const grade =
    overall >= 85
      ? "A — Sangat Strategis"
      : overall >= 75
        ? "B+ — Strategis"
        : overall >= 65
          ? "B — Layak"
          : "C — Perlu Evaluasi";

  return {
    score: overall,
    grade,
    flood_risk: floodRisk,
    flood_note:
      floodRisk === "LOW"
        ? "Topografi aman, risiko historis rendah (<10%)."
        : floodRisk === "MODERATE"
          ? "Waspada genangan saat hujan ekstrem >3 jam. Cek drainase."
          : "Area berisiko luapan. Disarankan penguatan struktur & asuransi.",
    ring1_score: r1,
    ring2_score: r2,
    ring3_score: r3,
    whitespace_alert: whitespace,
    occupancy_projection: normalize(70 + Math.round(overall * 0.3), 70, 98),
  };
}

