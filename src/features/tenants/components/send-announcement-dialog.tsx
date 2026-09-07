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
    } catch (error) {
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
          className="gap-2 border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-all font-semibold h-10 px-4 rounded-xl text-base"
        >
          <Megaphone className="size-5" />
          Kirim Pengumuman
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg border-zinc-800 bg-zinc-950 text-white p-6 rounded-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="space-y-1.5 pb-2">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-amber-400">
            <Megaphone className="size-5" />
            Kirim Pengumuman ke Penghuni
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            Kirimkan informasi atau pengumuman yang akan langsung muncul sebagai Banner & Notifikasi Push di HP penyewa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1">
          {/* Pilih Penerima */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold tracking-wider text-zinc-300 uppercase flex items-center gap-1.5">
                <Users className="size-4 text-amber-400" />
                Pilih Penerima ({selectedUserIds.length}/{validTenants.length})
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleSelectAll}
                className="h-7 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 px-2 rounded-lg"
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
            <div className="max-h-40 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/60 p-2 space-y-1 divide-y divide-zinc-800/50">
              {validTenants.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">
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
                          ? "bg-amber-500/10 text-white font-medium"
                          : "hover:bg-zinc-800/50 text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleTenant(tenant.userId)}
                          className="border-zinc-700 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                        />
                        <span className="truncate">{tenant.name}</span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-semibold px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 shrink-0">
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
            <Label htmlFor="title" className="text-xs font-semibold text-zinc-300">
              Judul Pengumuman <span className="text-red-400">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Contoh: Paket Datang / Pemadaman Listrik"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-amber-500 rounded-xl text-sm"
              maxLength={100}
            />
          </div>

          {/* Form Input Pesan */}
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-xs font-semibold text-zinc-300">
              Isi Pesan / Informasi <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Tuliskan informasi lengkap yang ingin disampaikan ke penyewa..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-amber-500 rounded-xl min-h-[90px] text-sm resize-none"
              maxLength={500}
            />
            <p className="text-[11px] text-zinc-500 text-right">
              {message.length}/500 karakter
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-zinc-800 text-zinc-400 hover:bg-zinc-900 rounded-xl"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedUserIds.length === 0}
              className="bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition-all rounded-xl gap-2 shadow-[0_4px_12px_rgba(245,158,11,0.2)]"
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
