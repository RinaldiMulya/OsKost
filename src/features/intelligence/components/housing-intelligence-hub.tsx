"use client";

import { useState } from "react";
import { OsRadarScannerView } from "./os-radar-scanner-view";
import { OsFundView } from "./os-fund-view";
import { Compass, Coins, Sparkles, ArrowRight } from "lucide-react";

export function HousingIntelligenceHub() {
  const [activeTab, setActiveTab] = useState<"radar" | "fund">("radar");

  return (
    <div className="w-full space-y-6">
      {/* ── Top Segmented Tab Switcher (Radar vs Fund) ── */}
      <div className="p-2 bg-[#E5E7EB] rounded-2xl border-2 border-[#1E1B18]/15 flex items-center max-w-xl mx-auto shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab("radar")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 border-2 ${
            activeTab === "radar"
              ? "bg-[#00529C] text-white border-[#00529C] shadow-md scale-102"
              : "bg-transparent text-[#374151] border-transparent hover:bg-white/50"
          }`}
        >
          <Compass className="w-4 h-4 shrink-0" />
          <span>OsRadar (Spatial ROI)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("fund")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 border-2 ${
            activeTab === "fund"
              ? "bg-[#00529C] text-white border-[#00529C] shadow-md scale-102"
              : "bg-transparent text-[#374151] border-transparent hover:bg-white/50"
          }`}
        >
          <Coins className="w-4 h-4 shrink-0" />
          <span>OsFund (Dana Talang)</span>
          <span className="text-[10px] bg-[#10B981] text-white px-2 py-0.2 rounded-full font-black uppercase hidden sm:inline-block">
            Baru
          </span>
        </button>
      </div>

      {/* ── Active Module View ── */}
      {activeTab === "radar" ? (
        <OsRadarScannerView onNavigateToFund={() => setActiveTab("fund")} />
      ) : (
        <OsFundView />
      )}
    </div>
  );
}

