"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Search,
  HelpCircle,
  CreditCard,
  AlertTriangle,
  ClipboardList,
  Phone,
  ChevronDown,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: any;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    id: "payment",
    title: "Pembayaran & Tagihan",
    icon: CreditCard,
    items: [
      {
        id: "pay-1",
        question: "Bagaimana cara membayar tagihan bulanan?",
        answer: (
          <ol className="list-decimal list-inside space-y-2 text-zinc-400">
            <li>Buka menu <span className="text-white font-semibold">Tagihan</span> di navigasi bawah.</li>
            <li>Lihat nominal tagihan aktif pada bulan berjalan.</li>
            <li>Lakukan transfer ke rekening bank resmi OSkost yang tertera di halaman tersebut.</li>
            <li>Ambil tangkapan layar (screenshot) atau foto bukti transaksi pembayaran.</li>
            <li>Klik tombol <span className="text-white font-semibold">Bayar Sekarang</span>, unggah bukti bayar Anda, lalu kirim.</li>
            <li>Admin akan memverifikasi dan memperbarui status menjadi <span className="text-secondary font-semibold">Lunas</span> dalam waktu maksimal 1x24 jam.</li>
          </ol>
        ),
      },
      {
        id: "pay-2",
        question: "Kapan tanggal jatuh tempo pembayaran sewa?",
        answer: (
          <p className="text-zinc-400 leading-relaxed">
            Jatuh tempo pembayaran adalah setiap <span className="text-white font-semibold">tanggal sesuai check-in pertama Anda</span> setiap bulannya. Harap melunasi tagihan tepat waktu sebelum tanggal tersebut untuk menghindari pembekuan akses sementara.
          </p>
        ),
      },
      {
        id: "pay-3",
        question: "Apakah saya bisa mencicil pembayaran sewa kost?",
        answer: (
          <p className="text-zinc-400 leading-relaxed">
            Pembayaran sewa kost harus dilakukan secara penuh sesuai tagihan bulanan yang terbit. Kami belum mendukung metode cicilan untuk saat ini.
          </p>
        ),
      },
    ],
  },
  {
    id: "maintenance",
    title: "Laporan & Kerusakan",
    icon: AlertTriangle,
    items: [
      {
        id: "maint-1",
        question: "Bagaimana cara melaporkan fasilitas kamar yang rusak?",
        answer: (
          <ol className="list-decimal list-inside space-y-2 text-zinc-400">
            <li>Pilih menu <span className="text-white font-semibold">Laporan</span> di navigasi bawah.</li>
            <li>Klik tombol <span className="text-white font-semibold">Buat Laporan Baru</span>.</li>
            <li>Tulis judul laporan (misal: AC Kamar Tidak Dingin) dan deskripsikan kerusakannya secara jelas.</li>
            <li>Ambil foto kerusakan secara langsung menggunakan kamera HP atau pilih dari galeri.</li>
            <li>Klik <span className="text-white font-semibold">Kirim Laporan</span>. Anda akan menerima notifikasi otomatis ketika status laporan diperbarui oleh pengelola.</li>
          </ol>
        ),
      },
      {
        id: "maint-2",
        question: "Berapa lama perbaikan laporan kerusakan dilakukan?",
        answer: (
          <p className="text-zinc-400 leading-relaxed">
            Waktu pengerjaan tergantung pada tingkat kerusakan:
            <br />
            • <span className="text-white font-semibold">Kategori Ringan (Lampu mati, kran bocor):</span> Diperbaiki dalam 1x24 jam.
            <br />
            • <span className="text-white font-semibold">Kategori Berat (AC rusak, listrik padam total):</span> Diperbaiki dalam 2-3 hari kerja karena memerlukan teknisi ahli.
          </p>
        ),
      },
    ],
  },
  {
    id: "rules",
    title: "Aturan Umum Kost",
    icon: ClipboardList,
    items: [
      {
        id: "rule-1",
        question: "Bagaimana aturan jam berkunjung tamu?",
        answer: (
          <ul className="list-disc list-inside space-y-2 text-zinc-400">
            <li>Tamu diperbolehkan berkunjung maksimal hingga pukul <span className="text-white font-semibold">22:00 WIB</span>.</li>
            <li>Tamu lawan jenis dilarang keras masuk ke dalam kamar privat demi kenyamanan bersama.</li>
            <li>Tamu yang menginap wajib melaporkan diri kepada admin/pengelola kost minimal 1x24 jam sebelumnya.</li>
          </ul>
        ),
      },
      {
        id: "rule-2",
        question: "Bagaimana aturan pembuangan sampah & kebersihan?",
        answer: (
          <p className="text-zinc-400 leading-relaxed">
            Setiap penghuni wajib menjaga kebersihan kamar masing-masing. Sampah rumah tangga harus diikat dalam kantong plastik rapat dan diletakkan di tempat sampah utama yang berada di area parkir luar setiap pagi hari sebelum jam pengambilan sampah.
          </p>
        ),
      },
      {
        id: "rule-3",
        question: "Apakah diperbolehkan membawa hewan peliharaan?",
        answer: (
          <p className="text-zinc-400 leading-relaxed">
            Untuk menjaga kenyamanan, ketertiban, dan kebersihan lingkungan kost, seluruh penghuni <span className="text-red-400 font-semibold">dilarang keras membawa hewan peliharaan</span> jenis apa pun ke dalam area kost.
          </p>
        ),
      },
    ],
  },
  {
    id: "contact",
    title: "Kontak & Operasional",
    icon: Phone,
    items: [
      {
        id: "contact-1",
        question: "Bagaimana menghubungi pengelola jika ada keadaan darurat?",
        answer: (
          <div className="space-y-3 text-zinc-400 leading-relaxed">
            <p>Untuk kebutuhan mendesak di luar jam operasional, Anda dapat menghubungi:</p>
            <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-3 text-xs space-y-2">
              <div>
                <span className="text-[10px] text-zinc-500 block">Nomor Darurat Pengelola</span>
                <a href="tel:+6281234567890" className="font-bold text-secondary text-sm hover:underline block mt-0.5">
                  +62 812-3456-7890
                </a>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Jam Operasional Admin</span>
                <span className="font-bold text-zinc-300">Setiap Hari (08:00 - 20:00 WIB)</span>
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (itemId: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Filter FAQs based on search query
  const filteredCategories = faqData
    .map((category) => {
      const filteredItems = category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof item.answer === "string" &&
            item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      return { ...category, items: filteredItems };
    })
    .filter((category) => category.items.length > 0);

  return (
    <div className="space-y-6 pb-6">
      {/* Header and Back Button */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/profile"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-900/20 text-zinc-400 hover:text-white transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold text-white tracking-tight">Bantuan &amp; FAQ</h1>
          <p className="text-[10px] text-zinc-400">Pusat informasi dan panduan kost Anda.</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Cari bantuan atau aturan kost..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-900 bg-zinc-950/40 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-secondary transition-all"
        />
      </div>

      {/* FAQs List */}
      <div className="space-y-6">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <HelpCircle className="h-8 w-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-500">Tidak ada hasil untuk &quot;{searchQuery}&quot;</p>
          </div>
        ) : (
          filteredCategories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs px-1">
                  <CategoryIcon className="h-4 w-4 text-secondary shrink-0" />
                  <span>{category.title}</span>
                </div>

                <div className="space-y-2">
                  {category.items.map((item) => {
                    const isOpen = !!openItems[item.id];
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-zinc-900 bg-zinc-950/20 overflow-hidden transition-all duration-200"
                      >
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-zinc-900/10 transition-colors"
                        >
                          <span className="text-xs font-semibold text-zinc-200 leading-snug">
                            {item.question}
                          </span>
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-zinc-500 shrink-0"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden border-t border-zinc-950/50"
                            >
                              <div className="px-4 py-3.5 text-xs text-zinc-400 bg-zinc-950/30">
                                {item.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info Badge */}
      <div className="flex gap-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-blue-400 text-[10px] leading-relaxed">
        <Info className="h-4 w-4 shrink-0" />
        <p>
          Ada hal lain yang ingin ditanyakan tetapi tidak ada di atas? Hubungi Admin kost langsung melalui WhatsApp Chat dengan menekan tombol CTA WhatsApp pada Landing Page OSkost.
        </p>
      </div>
    </div>
  );
}
