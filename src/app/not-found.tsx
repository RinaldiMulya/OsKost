import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-red-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        {/* 404 Number */}
        <h1 className="text-[120px] sm:text-[160px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-red-600 to-zinc-900">
          404
        </h1>

        {/* Message */}
        <h2 className="text-xl sm:text-2xl font-bold text-white mt-2 mb-3">
          Kamar atau Halaman Tidak Ditemukan
        </h2>
        <p className="text-sm text-zinc-500 mb-8">
          Sepertinya halaman yang kamu cari sudah pindah atau tidak ada.
        </p>

        {/* CTA */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-400 to-cyan-400 text-black font-bold text-sm uppercase tracking-wider hover:shadow-[0_0_30px_rgba(0,204,64,0.3)] transition-all duration-300"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
