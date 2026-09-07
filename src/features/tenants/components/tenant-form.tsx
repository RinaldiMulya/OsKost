"use client";

import { useActionState, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { ImageUploadStandard } from "@/components/ui/image-upload-standard";
import type { TenantForAdmin } from "../tenant-service";
import type { ActionResult } from "../actions";

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
  const [rentAmount, setRentAmount] = useState<number | "">("");
  const [ktpUrl, setKtpUrl] = useState(
    tenant?.tenantProfile?.ktpPhotoUrl ?? "",
  );

  // Default dates
  const todayStr = new Date().toISOString().split("T")[0];

  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
    const room = availableRooms.find((r) => r.id === roomId);
    if (room) {
      setRentAmount(room.price);
    } else {
      setRentAmount("");
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden ID for edit mode */}
      {tenant && <input type="hidden" name="id" value={tenant.id} />}

      {state?.error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT COLUMN — Personal Info */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-base text-white">
              Informasi Pribadi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-zinc-300">
                Nama Lengkap
              </Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Nama sesuai KTP"
                defaultValue={tenant?.tenantProfile?.fullName ?? ""}
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-zinc-300">
                  Nomor HP (Username)
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="08xxxxxxxxxx"
                  defaultValue={tenant?.phoneNumber ?? ""}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">
                  Email{" "}
                  <span className="text-zinc-500 text-xs">(opsional)</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@contoh.com"
                  defaultValue={tenant?.email ?? ""}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ktpNumber" className="text-zinc-300">
                Nomor KTP
              </Label>
              <Input
                id="ktpNumber"
                name="ktpNumber"
                placeholder="3175xxxxxxxxxxxx"
                defaultValue={tenant?.tenantProfile?.ktpNumber ?? ""}
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="ktpPhotoUrl" className="text-zinc-300">
                Foto KTP
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
          </CardContent>
        </Card>

        {/* RIGHT COLUMN — Additional Info & Room Assignment */}
        <Card className="border-zinc-800 bg-zinc-900/50 flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle className="text-base text-white mb-6">
                Kontak Darurat & Alamat Asal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-zinc-300">
                  Alamat Asal (KTP)
                </Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Jl. Raya Diponegoro No..."
                  defaultValue={tenant?.tenantProfile?.address ?? ""}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="emergencyContactName"
                    className="text-zinc-300"
                  >
                    Nama Kontak Darurat
                  </Label>
                  <Input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    placeholder="Contoh: Siti (Ibu)"
                    defaultValue={
                      tenant?.tenantProfile?.emergencyContactName ?? ""
                    }
                    className="bg-zinc-950 border-zinc-800 text-zinc-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="emergencyContactNumber"
                    className="text-zinc-300"
                  >
                    Nomor Kontak Darurat
                  </Label>
                  <Input
                    id="emergencyContactNumber"
                    name="emergencyContactNumber"
                    placeholder="08xxxxxxxxxx"
                    defaultValue={
                      tenant?.tenantProfile?.emergencyContactNumber ?? ""
                    }
                    className="bg-zinc-950 border-zinc-800 text-zinc-100"
                  />
                </div>
              </div>

              {/* Room Assignment (Always visible, support reassignments in edit mode) */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                <Label htmlFor="roomId" className="text-zinc-300">
                  {tenant ? "Pindahkan Kamar Sewa" : "Pilih Kamar Kost"}
                </Label>
                <select
                  id="roomId"
                  name="roomId"
                  value={selectedRoomId}
                  onChange={(e) => handleRoomChange(e.target.value)}
                  required
                  className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1 text-sm shadow-sm transition-colors text-zinc-100 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300"
                >
                  <option value="">-- Pilih Kamar --</option>
                  {availableRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.number} - {room.name} (Rp{" "}
                      {room.price.toLocaleString("id-ID")}/bln)
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* CHECK-IN & INITIAL BILLING (Only displayed in Creation/Check-in Mode) */}
      {!tenant && (
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-base text-white">
              Detail Sewa & Pembayaran Awal (Check-in)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Lease Dates */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-zinc-300">
                  Tanggal Mulai Sewa (Check-in)
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={todayStr}
                  className="bg-zinc-500 border-zinc-800 text-zinc-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-zinc-300">
                  Tanggal Berakhir Sewa{" "}
                  <span className="text-zinc-500 text-xs">(opsional)</span>
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  className="bg-zinc-500 border-zinc-800 text-zinc-100"
                />
              </div>
            </div>

            {/* Financial Amounts */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="rentAmount" className="text-zinc-300">
                  Harga Sewa per Bulan
                </Label>
                <Input
                  id="rentAmount"
                  name="rentAmount"
                  type="number"
                  placeholder="0"
                  value={rentAmount}
                  onChange={(e) =>
                    setRentAmount(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="bg-zinc-950 border-zinc-800 text-zinc-100"
                  required
                />
              </div>


              <div className="space-y-2">
                <Label htmlFor="utilityAmount" className="text-zinc-300">
                  Biaya Listrik & Air{" "}
                  <span className="text-zinc-500 text-xs">(opsional)</span>
                </Label>
                <Input
                  id="utilityAmount"
                  name="utilityAmount"
                  type="number"
                  placeholder="0"
                  defaultValue={0}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherAmount" className="text-zinc-300">
                  Biaya Sampah & Keamanan{" "}
                  <span className="text-zinc-500 text-xs">(opsional)</span>
                </Label>
                <Input
                  id="otherAmount"
                  name="otherAmount"
                  type="number"
                  placeholder="0"
                  defaultValue={0}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100"
                />
              </div>
            </div>

            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
              <p className="text-xs text-blue-400">
                💡 **Akun & Invoice**: Mendaftarkan tenant akan secara otomatis
                membuat akun login dengan **password default:**{" "}
                <code className="rounded bg-blue-500/10 px-1.5 font-mono text-zinc-200">
                  oskost + 4 digit terakhir No. HP (misal: oskost7890)
                </code>{" "}
                dan melampirkan invoice tagihan **belum lunas** pertamanya di
                sistem.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={isPending}
          className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold h-10 px-6 transition-all active:scale-[0.98]"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isPending ? "Menyimpan..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
