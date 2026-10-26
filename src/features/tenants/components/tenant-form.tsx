"use client";

import { useActionState, useState, useMemo } from "react";
import Link from "next/link";
import {
  format,
  addMonths,
  differenceInDays,
  parseISO,
  isValid,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  ShieldAlert,
  BedDouble,
  Calendar,
  Banknote,
  Receipt,
  Info,
  Loader2,
  Save,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploadStandard } from "@/components/ui/image-upload-standard";
import { WheelDatePicker } from "@/components/ui/wheel-date-picker";
import type { TenantForAdmin } from "../tenant-service";
import type { ActionResult } from "../actions";

const DURATION_PRESETS = [
  { label: "1 Bulan", months: 1 },
  { label: "2 Bulan", months: 2 },
  { label: "3 Bulan", months: 3 },
  { label: "6 Bulan", months: 6 },
  { label: "12 Bulan (1 Thn)", months: 12 },
  { label: "Fleksibel", months: null },
];

interface TenantFormProps {
  tenant?: TenantForAdmin;
  action: (
    prevState: ActionResult | null,
    formData: FormData,
  ) => Promise<ActionResult>;
  submitLabel: string;
  availableRooms?: {
    id: string;
    number: string;
    name: string;
    price: number;
  }[];
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function TenantForm({
  tenant,
  action,
  submitLabel,
  availableRooms = [],
}: TenantFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);

  // Active lease room init
  const activeLease = tenant?.leases?.find((l: any) => l.isActive);
  const initialRoomId = activeLease?.roomId ?? "";

  // Controlled states for room-based pricing autofill (Check-in Mode)
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId);
  const [rentAmount, setRentAmount] = useState<number>(
    activeLease?.room?.price ?? 0,
  );
  const [deposit, setDeposit] = useState<number>(0);
  const [utilityAmount, setUtilityAmount] = useState<number>(0);
  const [otherAmount, setOtherAmount] = useState<number>(0);
  const [ktpUrl, setKtpUrl] = useState(
    tenant?.tenantProfile?.ktpPhotoUrl ?? "",
  );

  // Default dates
  const todayStr = new Date().toISOString().split("T")[0];

  // Controlled dates & duration presets for check-in
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>("");
  const [selectedPresetMonths, setSelectedPresetMonths] = useState<
    number | null
  >(null);

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    if (selectedPresetMonths !== null && newStart) {
      const parsedStart = parseISO(newStart);
      if (isValid(parsedStart)) {
        const calculatedEnd = addMonths(parsedStart, selectedPresetMonths);
        setEndDate(format(calculatedEnd, "yyyy-MM-dd"));
      }
    }
  };

  const handlePresetClick = (months: number | null) => {
    if (months === null) {
      setSelectedPresetMonths(null);
      setEndDate("");
    } else {
      setSelectedPresetMonths(months);
      const parsedStart = parseISO(startDate || todayStr);
      if (isValid(parsedStart)) {
        const calculatedEnd = addMonths(parsedStart, months);
        setEndDate(format(calculatedEnd, "yyyy-MM-dd"));
      }
    }
  };

  const handleEndDateChange = (newEnd: string) => {
    setEndDate(newEnd);
    setSelectedPresetMonths(null); // Custom selection via wheel date picker
  };

  const dateRangeSummary = useMemo(() => {
    if (!endDate) {
      return {
        type: "flexible" as const,
        text: "Sewa berjalan bulanan tanpa batas tanggal kontrak awal (fleksibel).",
      };
    }
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (isValid(start) && isValid(end)) {
      if (end < start) {
        return {
          type: "error" as const,
          text: "Peringatan: Tanggal akhir sewa tidak boleh mendahului tanggal mulai sewa.",
        };
      }
      const days = differenceInDays(end, start);
      return {
        type: "fixed" as const,
        text: `${days} hari masa sewa (${format(start, "d MMM yyyy", { locale: localeId })} s/d ${format(end, "d MMM yyyy", { locale: localeId })})`,
      };
    }
    return null;
  }, [startDate, endDate]);

  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
    const room = availableRooms.find((r) => r.id === roomId);
    if (room) {
      setRentAmount(room.price);
    }
  };

  const totalFirstInvoice =
    (Number(rentAmount) || 0) +
    (Number(deposit) || 0) +
    (Number(utilityAmount) || 0) +
    (Number(otherAmount) || 0);

  return (
    <form action={formAction} className="space-y-8">
      {/* Hidden ID for edit mode */}
      {tenant && <input type="hidden" name="id" value={tenant.id} />}

      {/* Error Banner */}
      {state?.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5 text-sm text-red-800 flex items-start gap-3 shadow-xs animate-in fade-in-50 duration-200">
          <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-red-900">Perhatian</div>
            <div className="mt-0.5">{state.error}</div>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* LEFT COLUMN — Personal Info */}
        <div className="bg-white border border-[#2C2825]/30 rounded-2xl shadow-xs overflow-hidden">
          <div className="bg-[#FAF8F5] border-b border-[#2C2825]/8 px-6 py-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white border border-[#2C2825]/10 text-[#714A23] shadow-2xs">
              <User className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1E1B18]">
                Informasi Pribadi & Identitas
              </h2>
              <p className="text-xs text-[#7A7A7A]">
                Data diri calon penghuni sesuai dokumen KTP resmi.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-7 space-y-5">
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider flex items-center gap-1.5"
              >
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Contoh: Rian Pratama"
                defaultValue={tenant?.tenantProfile?.fullName ?? ""}
                required
                className="h-11 rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] font-medium px-4 focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs"
              />
            </div>

            {/* Nomor HP & Email */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="phoneNumber"
                  className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider flex items-center gap-1.5"
                >
                  Nomor HP (Username) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="081234567890"
                    defaultValue={tenant?.phoneNumber ?? ""}
                    required
                    className="h-11 rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] font-medium pl-4 pr-4 focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs"
                  />
                </div>
                <p className="text-[11px] text-[#7A7A7A]">
                  Digunakan sebagai akun Oskost Mobile.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="email"
                    className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider"
                  >
                    Email
                  </Label>
                  <span className="text-[11px] text-[#7A7A7A]">Opsional</span>
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="penyewa@email.com"
                  defaultValue={tenant?.email ?? ""}
                  className="h-11 rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] font-medium px-4 focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs"
                />
                <p className="text-[11px] text-[#7A7A7A]">
                  Untuk pengiriman kuitansi digital.
                </p>
              </div>
            </div>

            {/* Nomor KTP */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="ktpNumber"
                  className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider"
                >
                  Nomor Induk Kependudukan (NIK / KTP)
                </Label>
                <span className="text-[11px] text-[#7A7A7A]">16 Digit</span>
              </div>
              <Input
                id="ktpNumber"
                name="ktpNumber"
                placeholder="3175xxxxxxxxxxxx"
                maxLength={16}
                defaultValue={tenant?.tenantProfile?.ktpNumber ?? ""}
                className="h-11 rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] font-mono tracking-wider px-4 focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs"
              />
            </div>

            {/* Upload KTP */}
            <div className="space-y-2 pt-2 border-t border-[#2C2825]/8">
              <Label
                htmlFor="ktpPhotoUrl"
                className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider block"
              >
                Foto Identitas KTP (Privat & Terenkripsi)
              </Label>
              <input type="hidden" name="ktpPhotoUrl" value={ktpUrl} />
              <ImageUploadStandard
                folderPath="ktp-photos"
                bucket="Oskost-Data-Private"
                defaultImageUrl={ktpUrl}
                onUploadComplete={(url) => setKtpUrl(url)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Emergency Contact & Room Assignment */}
        <div className="space-y-8">
          {/* Card 2: Kontak Darurat & Alamat */}
          <div className="bg-white border border-[#2C2825]/30 rounded-2xl shadow-xs overflow-hidden">
            <div className="bg-[#FAF8F5] border-b border-[#2C2825]/8 px-6 py-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white border border-[#2C2825]/10 text-[#714A23] shadow-2xs">
                <ShieldAlert className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1E1B18]">
                  Kontak Darurat & Alamat Asal
                </h2>
                <p className="text-xs text-[#7A7A7A]">
                  Dihubungi jika terjadi keadaan mendesak di kost.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-5">
              {/* Alamat Asal */}
              <div className="space-y-2">
                <Label
                  htmlFor="address"
                  className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider"
                >
                  Alamat Asal (Sesuai KTP)
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Jl. Melati No. 12, RT 01/RW 04, Kelurahan..., Kota..."
                  rows={2}
                  defaultValue={tenant?.tenantProfile?.address ?? ""}
                  className="rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] p-3.5 focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs text-sm"
                />
              </div>

              {/* Kontak Darurat */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="emergencyContactName"
                    className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider"
                  >
                    Nama Kontak Darurat
                  </Label>
                  <Input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    placeholder="Contoh: Ibu Siti (Ibu Kandung)"
                    defaultValue={
                      tenant?.tenantProfile?.emergencyContactName ?? ""
                    }
                    className="h-11 rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] px-4 focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="emergencyContactNumber"
                    className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider"
                  >
                    Nomor Kontak Darurat
                  </Label>
                  <Input
                    id="emergencyContactNumber"
                    name="emergencyContactNumber"
                    placeholder="081987654321"
                    defaultValue={
                      tenant?.tenantProfile?.emergencyContactNumber ?? ""
                    }
                    className="h-11 rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] px-4 focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Pemilihan Kamar */}
          <div className="bg-white border border-[#2C2825]/30 rounded-2xl shadow-xs overflow-hidden">
            <div className="bg-[#FAF8F5] border-b border-[#2C2825]/8 px-6 py-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white border border-[#2C2825]/10 text-[#714A23] shadow-2xs">
                <BedDouble className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1E1B18]">
                  {tenant ? "Pindahkan Unit Kamar" : "Pilih Kamar Kost"}
                </h2>
                <p className="text-xs text-[#7A7A7A]">
                  Tentukan unit kamar yang disewa penghuni.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="roomId-select"
                  className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider flex items-center gap-1.5"
                >
                  Unit Kamar <span className="text-red-500">*</span>
                </Label>
                <input type="hidden" name="roomId" value={selectedRoomId} />
                <Select value={selectedRoomId} onValueChange={handleRoomChange}>
                  <SelectTrigger
                    id="roomId-select"
                    className="h-12 w-full rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] font-medium px-4 focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs"
                  >
                    <SelectValue placeholder="-- Pilih Kamar Tersedia --" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#2C2825]/15 text-[#1E1B18] rounded-xl shadow-md p-1 max-h-60">
                    {availableRooms.length === 0 ? (
                      <div className="p-4 text-xs text-[#7A7A7A] text-center">
                        Tidak ada kamar dengan status &apos;Tersedia&apos;.
                      </div>
                    ) : (
                      availableRooms.map((room) => (
                        <SelectItem
                          key={room.id}
                          value={room.id}
                          className="rounded-lg cursor-pointer py-2.5 focus:bg-[#FAF2EA]"
                        >
                          <div className="flex items-center justify-between w-full gap-4">
                            <span className="font-bold text-[#1E1B18]">
                              Kamar {room.number}{" "}
                              <span className="font-normal text-[#7A7A7A]">
                                ({room.name})
                              </span>
                            </span>
                            <span className="text-xs font-bold text-[#714A23] bg-[#FAF2EA] px-2.5 py-0.5 rounded-full border border-[#714A23]/20 shrink-0">
                              {formatRupiah(room.price)}/bln
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-[#7A7A7A]">
                  Harga sewa per bulan otomatis terisi sesuai tarif kamar yang
                  dipilih.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHECK-IN & INITIAL BILLING (Only displayed in Creation/Check-in Mode) */}
      {!tenant && (
        <div className="bg-white border border-[#2C2825]/30 rounded-2xl shadow-xs overflow-hidden">
          <div className="bg-[#FAF8F5] border-b border-[#2C2825]/8 px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white border border-[#2C2825]/10 text-[#714A23] shadow-2xs">
                <Receipt className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1E1B18]">
                  Detail Kontrak & Tagihan Awal (Invoice Perdana)
                </h2>
                <p className="text-xs text-[#7A7A7A]">
                  Tentukan tanggal sewa dan rincian biaya yang akan ditagihkan
                  ke tenant.
                </p>
              </div>
            </div>

            {/* Total Badge */}
            <div className="flex items-center gap-2 bg-[#FAF2EA] px-3.5 py-1.5 rounded-xl border border-[#714A23]/20">
              <span className="text-xs text-[#714A23] font-medium">
                Total Tagihan Pertama:
              </span>
              <span className="text-sm font-extrabold text-[#714A23]">
                {formatRupiah(totalFirstInvoice)}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-7 space-y-6">
            {/* Periode Sewa */}
            <div className="space-y-4">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Tanggal Mulai Sewa */}
                <div className="space-y-2">
                  <Label
                    htmlFor="startDate"
                    className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider flex items-center gap-1.5"
                  >
                    Tanggal Mulai Sewa (Check-in){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <WheelDatePicker
                    id="startDate"
                    name="startDate"
                    value={startDate}
                    onChange={handleStartDateChange}
                    required
                    placeholder="Pilih tanggal check-in..."
                  />
                  <p className="text-[11px] text-[#7A7A7A]">
                    Tanggal resmi masuk &amp; serah terima kunci kamar.
                  </p>
                </div>

                {/* Tanggal Berakhir Sewa */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="endDate"
                      className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider"
                    >
                      Tanggal Berakhir Sewa
                    </Label>
                    <span className="text-[11px] text-[#7A7A7A]">Opsional</span>
                  </div>
                  <WheelDatePicker
                    id="endDate"
                    name="endDate"
                    value={endDate}
                    onChange={handleEndDateChange}
                    allowClear
                    placeholder="Pilih tanggal berakhir..."
                  />
                  <p className="text-[11px] text-[#7A7A7A]">
                    Bisa dipilih via Roll atau tombol cepat di bawah.
                  </p>
                </div>
              </div>

              {/* Quick Choice Duration Chips (Diletakkan di bawah inputan tanggal) */}
              <div className="rounded-2xl border-2 border-[#2C2825]/12 bg-[#FAF8F5] p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#FAF2EA] border border-[#714A23]/20 text-[#714A23]">
                      <Sparkles className="size-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#1E1B18]">
                      Pilihan Cepat Durasi Kontrak:
                    </span>
                  </div>
                  <span className="text-[11px] text-[#7A7A7A]">
                    Klik untuk menghitung otomatis tanggal selesai
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {DURATION_PRESETS.map((preset) => {
                    const isActive =
                      preset.months === selectedPresetMonths ||
                      (preset.months === null &&
                        !endDate &&
                        selectedPresetMonths === null);

                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePresetClick(preset.months)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                          isActive
                            ? "bg-[#714A23] text-white shadow-xs border-2 border-[#714A23] scale-[1.02]"
                            : "bg-white text-[#4A453F] border-2 border-[#2C2825]/12 hover:border-[#714A23]/35 hover:bg-[#F4EDE4]/60"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Live Duration Feedback Banner */}
                {dateRangeSummary && (
                  <div
                    className={`text-xs font-medium px-3.5 py-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                      dateRangeSummary.type === "error"
                        ? "bg-red-50 text-red-800 border-red-200"
                        : dateRangeSummary.type === "fixed"
                          ? "bg-[#FAF2EA] text-[#714A23] border-[#714A23]/20 font-semibold"
                          : "bg-white text-[#4A453F] border-[#2C2825]/10"
                    }`}
                  >
                    <span className="font-bold shrink-0">
                      Ringkasan Masa Hunian:
                    </span>
                    <span className="truncate">{dateRangeSummary.text}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Rincian Komponen Biaya */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 pt-2 border-t border-[#2C2825]/8">
              {/* Harga Sewa */}
              <div className="space-y-2">
                <Label
                  htmlFor="rentAmount"
                  className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider flex items-center gap-1.5"
                >
                  Harga Sewa Pokok <span className="text-red-500">*</span>
                </Label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-xs font-bold text-[#714A23] pointer-events-none">
                    Rp
                  </div>
                  <Input
                    id="rentAmount"
                    name="rentAmount"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(Number(e.target.value) || 0)}
                    required
                    className="h-11 rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] font-bold pl-10 pr-3 focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs text-base"
                  />
                </div>
              </div>

              {/* Deposit */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="deposit"
                    className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider"
                  >
                    Uang Jaminan (Deposit)
                  </Label>
                  <span className="text-[11px] text-[#7A7A7A]">Opsional</span>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-xs font-bold text-[#7A7A7A] pointer-events-none">
                    Rp
                  </div>
                  <Input
                    id="deposit"
                    name="deposit"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value) || 0)}
                    className="h-11 rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] font-medium pl-10 pr-3 focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs"
                  />
                </div>
              </div>

              {/* Listrik & Air */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="utilityAmount"
                    className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider"
                  >
                    Biaya Listrik & Air
                  </Label>
                  <span className="text-[11px] text-[#7A7A7A]">Opsional</span>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-xs font-bold text-[#7A7A7A] pointer-events-none">
                    Rp
                  </div>
                  <Input
                    id="utilityAmount"
                    name="utilityAmount"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={utilityAmount}
                    onChange={(e) =>
                      setUtilityAmount(Number(e.target.value) || 0)
                    }
                    className="h-11 rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] font-medium pl-10 pr-3 focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs"
                  />
                </div>
              </div>

              {/* Sampah & Keamanan */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="otherAmount"
                    className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider"
                  >
                    Iuran Sampah & Keamanan
                  </Label>
                  <span className="text-[11px] text-[#7A7A7A]">Opsional</span>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-xs font-bold text-[#7A7A7A] pointer-events-none">
                    Rp
                  </div>
                  <Input
                    id="otherAmount"
                    name="otherAmount"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={otherAmount}
                    onChange={(e) =>
                      setOtherAmount(Number(e.target.value) || 0)
                    }
                    className="h-11 rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] font-medium pl-10 pr-3 focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Informational Callout */}
            <div className="rounded-2xl border border-[#C98A2C]/25 bg-[#FFF8F0] p-4 flex items-start gap-3 shadow-2xs">
              <div className="p-2 rounded-xl bg-white border border-[#C98A2C]/20 text-[#C98A2C] shrink-0 mt-0.5">
                <Sparkles className="size-4" />
              </div>
              <div className="text-xs text-[#4A453F] leading-relaxed">
                <span className="font-bold text-[#1E1B18] block mb-0.5">
                  Pembuatan Akun & Invoice Otomatis
                </span>
                Mendaftarkan penghuni baru akan otomatis membuat akun aplikasi
                penyewa dengan{" "}
                <strong className="text-[#1E1B18]">Username:</strong> No. HP dan{" "}
                <strong className="text-[#1E1B18]">Password default:</strong>{" "}
                <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[#714A23] border border-[#2C2825]/10 font-bold">
                  oskost + 4 digit terakhir No. HP
                </code>
                , serta otomatis menerbitkan invoice tagihan berstatus{" "}
                <strong className="text-amber-800">Belum Lunas</strong> di
                sistem.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-4 z-40 bg-white/95 backdrop-blur-md border border-[#2C2825]/15 rounded-2xl p-4 sm:px-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3 text-xs sm:text-sm text-[#4A453F]">
          <div className="size-2 rounded-full bg-[#714A23] animate-pulse" />
          <span>
            {tenant
              ? `Mengedit data profil ${tenant.tenantProfile?.fullName || tenant.phoneNumber}`
              : "Registrasi check-in penghuni baru & penugasan kamar"}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            asChild
            className="flex-1 sm:flex-none rounded-xl border-[#2C2825]/15 text-[#4A453F] hover:bg-[#F4EDE4] font-semibold h-11 px-5"
          >
            <Link href="/admin/tenants">Batal</Link>
          </Button>

          <Button
            type="submit"
            disabled={isPending}
            className="flex-1 sm:flex-none rounded-xl bg-[#714A23] hover:bg-[#5C3B1A] text-white font-bold h-11 px-7 shadow-xs hover:shadow-sm transition-all gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Save className="size-4" />
                <span>{submitLabel}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
