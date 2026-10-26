"use client";

import { useState } from "react";
import { Megaphone, Send, CheckSquare, Square, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { sendAnnouncementAction } from "@/features/notifications/actions";
import { toast } from "sonner";

interface TenantItem {
  id: string; // userId
  tenantProfile?: {
    fullName: string;
  } | null;
  phoneNumber?: string | null;
  leases?: Array<{
    isActive: boolean;
    room?: {
      number: string;
    } | null;
  }>;
}

interface SendAnnouncementDialogProps {
  tenants: TenantItem[];
}

export function SendAnnouncementDialog({ tenants }: SendAnnouncementDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil hanya tenant yang memiliki profile / aktif
  const validTenants = tenants.map((t) => {
    const activeLease = t.leases?.find((l) => l.isActive);
    const roomNumber = activeLease?.room?.number;
    return {
      userId: t.id,
      name: t.tenantProfile?.fullName || t.phoneNumber || "Penyewa",
      roomNumber: roomNumber ? `Kamar ${roomNumber}` : "Tanpa Kamar",
    };
  });

  const isAllSelected =
    validTenants.length > 0 && selectedUserIds.length === validTenants.length;

  function toggleSelectAll() {
    if (isAllSelected) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(validTenants.map((t) => t.userId));
    }
  }

  function toggleTenant(userId: string) {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (selectedUserIds.length === 0) {
      toast.error("Pilih minimal 1 penyewa penerima!");
      return;
    }
    if (!title.trim()) {
      toast.error("Judul pengumuman harus diisi!");
      return;
    }
    if (!message.trim()) {
      toast.error("Pesan pengumuman harus diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendAnnouncementAction({
        userIds: selectedUserIds,
        title: title.trim(),
        message: message.trim(),
      });

      if (res.success) {
        toast.success(res.message || "Pengumuman berhasil dikirim!");
        setOpen(false);
        setTitle("");
        setMessage("");
        setSelectedUserIds([]);
      } else {
        toast.error(res.error || "Gagal mengirim pengumuman.");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem saat mengirim pengumuman.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-[#2C2825]/15 bg-white text-[#714A23] hover:bg-[#FAF2EA] hover:border-[#714A23]/30 transition-all font-semibold h-11 px-4 rounded-xl shadow-xs text-sm"
        >
          <Megaphone className="size-4" />
          Kirim Pengumuman
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl bg-white border border-[#2C2825]/15 text-[#1E1B18] p-6 sm:p-7 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FAF2EA] text-[#714A23] border border-[#714A23]/20 shadow-2xs">
              <Megaphone className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-[#1E1B18]">
                Kirim Pengumuman ke Penghuni
              </DialogTitle>
              <DialogDescription className="text-[#7A7A7A] text-xs mt-0.5">
                Kirimkan informasi atau pengumuman yang akan langsung muncul sebagai Banner & Notifikasi Push di HP penyewa.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1">
          {/* Pilih Penerima */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold tracking-wider text-[#1E1B18] uppercase flex items-center gap-1.5">
                <Users className="size-4 text-[#714A23]" />
                Pilih Penerima ({selectedUserIds.length}/{validTenants.length})
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleSelectAll}
                className="h-7 text-xs text-[#714A23] hover:text-[#5C3B1A] hover:bg-[#FAF2EA] px-2 rounded-lg font-semibold"
              >
                {isAllSelected ? (
                  <>
                    <CheckSquare className="size-3.5 mr-1" /> Batal Semua
                  </>
                ) : (
                  <>
                    <Square className="size-3.5 mr-1" /> Pilih Semua
                  </>
                )}
              </Button>
            </div>

            {/* List Tenant Checkboxes */}
            <div className="max-h-40 overflow-y-auto rounded-xl border border-[#2C2825]/10 bg-[#FAF8F5] p-2 space-y-1 divide-y divide-[#2C2825]/8">
              {validTenants.length === 0 ? (
                <p className="text-xs text-[#7A7A7A] text-center py-4">
                  Belum ada penyewa terdaftar.
                </p>
              ) : (
                validTenants.map((tenant) => {
                  const isChecked = selectedUserIds.includes(tenant.userId);
                  return (
                    <div
                      key={tenant.userId}
                      onClick={() => toggleTenant(tenant.userId)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                        isChecked
                          ? "bg-[#FAF2EA] text-[#714A23] font-semibold border border-[#714A23]/20"
                          : "hover:bg-[#F4EDE4] text-[#1E1B18]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleTenant(tenant.userId)}
                          className="border-[#2C2825]/30 data-[state=checked]:bg-[#714A23] data-[state=checked]:border-[#714A23]"
                        />
                        <span className="truncate">{tenant.name}</span>
                      </div>
                      <span className="text-[11px] text-[#714A23] font-semibold px-2 py-0.5 rounded-full bg-white border border-[#2C2825]/10 shrink-0">
                        {tenant.roomNumber}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Form Input Judul */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
              Judul Pengumuman <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Contoh: Paket Datang / Pemadaman Listrik"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] placeholder:text-[#7A7A7A] focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs text-sm"
              maxLength={100}
            />
          </div>

          {/* Form Input Pesan */}
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-xs font-bold text-[#1E1B18] uppercase tracking-wider">
              Isi Pesan / Informasi <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Tuliskan informasi lengkap yang ingin disampaikan ke penyewa..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-xl border-[#2C2825]/15 bg-white text-[#1E1B18] placeholder:text-[#7A7A7A] focus-visible:border-[#714A23] focus-visible:ring-[#714A23]/20 shadow-2xs min-h-[95px] text-sm resize-none p-3"
              maxLength={500}
            />
            <p className="text-[11px] text-[#7A7A7A] text-right">
              {message.length}/500 karakter
            </p>
          </div>

          <DialogFooter className="pt-3 border-t border-[#2C2825]/10 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl border-[#2C2825]/15 text-[#4A453F] hover:bg-[#F4EDE4]"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedUserIds.length === 0}
              className="rounded-xl bg-[#714A23] hover:bg-[#5C3B1A] text-white font-bold shadow-xs gap-2 px-6"
            >
              <Send className="size-4" />
              {isSubmitting ? "Mengirim..." : `Kirim (${selectedUserIds.length})`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
