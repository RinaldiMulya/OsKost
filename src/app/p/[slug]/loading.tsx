import { Loader2 } from "lucide-react";

export default function PropertyLoading() {
  return (
    <div className="w-full min-h-screen bg-[#F8F6F1] flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#8C6239]" />
        <div>
          <h2 className="text-lg font-bold text-[#1E1B18]">Memuat Website Resmi Kost...</h2>
          <p className="text-xs text-[#757069] mt-1">Menyiapkan informasi unit kamar, fasilitas, dan tur 360°</p>
        </div>
      </div>
    </div>
  );
}

