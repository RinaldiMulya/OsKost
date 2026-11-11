"use client";

import { Phone } from "lucide-react";

interface FloatingWhatsAppProps {
  phoneNumber: string;
  propertyName: string;
}

export function FloatingWhatsApp({ phoneNumber, propertyName }: FloatingWhatsAppProps) {
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Halo Pengelola ${propertyName}, saya sedang melihat website resmi ${propertyName} dan ingin bertanya ketersediaan kamar serta info sewa.`
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp Pengelola"
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#25D366] text-white font-semibold text-sm shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:bg-[#1EBE5D] hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400"></span>
        </span>
        <Phone className="w-5 h-5 fill-white" />
        <span className="hidden sm:inline">Tanya Pengelola</span>
      </a>
    </div>
  );
}

