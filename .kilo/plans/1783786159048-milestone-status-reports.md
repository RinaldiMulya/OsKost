# Rencana Implementasi: Laporan Keluhan & Maintenance (Admin Dashboard & PWA Tenant Enhancement)

Rencana ini menggambarkan langkah-langkah untuk mengimplementasikan fitur manajemen laporan keluhan dan maintenance dari sisi admin dashboard, serta peningkatan pada sisi PWA tenant jika diperlukan, berdasarkan item-item yang baru diaktifkan dalam milestone.md.

## 🎯 Tujuan
Membangun sistem manajemen laporan keluhan & maintenance yang lengkap sehingga:
1. Admin dapat melihat semua laporan dari semua tenant dengan filter status
2. Admin dapat membuat laporan baru atas nama tenant (untuk masalah yang diamati langsung)
3. Admin dapat memperbarui status laporan (OPEN → IN_PROGRESS → RESOLVED)
4. Admin dapat menambahkan catatan atau memperbarui foto pada laporan
5. Sistem menggunakan pola yang sama dengan implementasi tenant-pwa yang sudah ada

## 📂 Struktur Folder dan File yang Perlu Dibuat
Berikut struktur yang perlu ditambahkan mengikuti pola Feature-Sliced Design:

```
src/
├── features/
│   └── reports/                    # Fitur baru: laporan keluhan & maintenance
│       ├── report-service.ts       # Data access layer (query/mutasi dengan cache)
│       ├── actions.ts              # Server Actions
│       ├── components/             # Komponen UI khusus fitur ini
│       │   ├── ReportTable.tsx     # Tabel laporan dengan filter/paginasi
│       │   ├── ReportFilter.tsx    # Komponen filter status
│       │   ├── ReportForm.tsx      # Form buat/edit laporan (untuk admin)
│       │   └── ReportUpload.tsx    # Komponen unggah foto khusus laporan
│       └── index.ts                # Barrel export (opsional)
├── app/
│   └── (dashboard)/
│       └── admin/
│           └── reports/            # Halaman admin manajemen laporan
│               ├── layout.tsx      # Layout khusus halaman laporan (opsional)
│               └── page.tsx        # Halaman utama: /admin/reports
└── lib/
    └── cache-tags.ts               # Tambah tag cache untuk laporan
```

## 🗄️ Modifikasi Database Schema (Prisma)
Periksa apakah perlu menambahkan model `ReportImage` untuk mendukung多图片 per laporan:

```prisma
// Tambahkan ke prisma/schema.prisma jika diperlukan
model ReportImage {
  id        String   @id @default(cuid())
  url       String   // URL dari Supabase Storage
  reportId  String
  report    Report   @relation(fields: [reportId], references: [id])
  uploadedAt DateTime @default(now())
}

// Atau jika cukup dengan satu foto per laporan, kolom `photoUrl` pada model Report sudah cukup
```

## 🔧 Layanan Layanan (Service Layer)
Buat `src/features/reports/report-service.ts` dengan pola yang sama seperti `tenant-pwa-service.ts`:

```typescript
"use server";

import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache-tags";

// Zod Schemas untuk validasi
export const reportFormSchema = z.object({
  title: z.string().min(1, "Judul laporan wajib diisi"),
  description: z.string().min(5, "Deskripsi laporan minimal 5 karakter"),
  photoUrl: z.string().url().optional().or(z.literal("")), // Optional for now
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).default("OPEN"),
  leaseId: z.string(), // Akan diisi otomatis dari lease aktif tenant
});

// Untuk form admin yang mungkin perlu pilih tenant/lease
export const adminReportFormSchema = reportFormSchema.extend({
  tenantId: z.string().min(1, "Pilih tenant"),
});

// Service Queries (Cached)
export const getAllReports = cache(async () => {
  return unstable_cache(
    async () => {
      return prisma.report.findMany({
        include: {
          lease: {
            include: {
              user: {
                include: {
                  tenantProfile: true,
                },
              },
              room: {
                include: {
                  property: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    },
    ["reports-all"],
    { tags: [CACHE_TAGS.REPORTS_ALL] } // Akan ditambahkan ke cache-tags.ts
  )();
});

export const getReportsByStatus = cache(async (status: "OPEN" | "IN_PROGRESS" | "RESOLVED") => {
  return unstable_cache(
    async () => {
      return prisma.report.findMany({
        where: { status },
        include: {
          lease: {
            include: {
              user: {
                include: {
                  tenantProfile: true,
                },
              },
              room: {
                include: {
                  property: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    },
    [`reports-status-${status}`],
    { tags: CACHE_TAGS.REPORTS_BY_STATUS(status) } // Fixed: langsung pakai array dari CACHE_TAGS, bukan bungkus array lagi
  )();
});

export const getReportById = cache(async (id: string) => {
  return unstable_cache(
    async () => {
      return prisma.report.findUnique({
        where: { id },
        include: {
          lease: {
            include: {
              user: {
                include: {
                  tenantProfile: true,
                },
              },
              room: {
                include: {
                  property: true,
                },
              },
            },
          },
        },
      });
    },
    [`report-${id}`],
    { tags: [CACHE_TAGS.REPORT_BY_ID(id)] }
  )();
});

// Service Mutations
export const updateReportStatus = async (
  id: string,
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
) => {
  return prisma.report.update({
    where: { id },
    data: { status },
  });
};

export const createAdminReport = async (
  data: z.infer<typeof adminReportFormSchema>
) => {
  // Validasi lease aktif untuk tenant
  const activeLease = await prisma.lease.findFirst({
    where: {
      userId: data.tenantId,
      isActive: true,
    },
  });

  if (!activeLease) {
    throw new Error("Tenant tidak memiliki sewa aktif");
  }

  return prisma.report.create({
    data: {
      title: data.title,
      description: data.description,
      photoUrl: data.photoUrl || null,
      status: data.status,
      leaseId: activeLease.id,
    },
  });
};

export const updateReportPhoto = async (
  reportId: string,
  photoUrl: string
) => {
  return prisma.report.update({
    where: { id: reportId },
    data: { photoUrl },
  });
};
```

## ⚡ Server Actions
Buat `src/features/reports/actions.ts`:

```typescript
"use server";

import { auth } from "@/auth";
import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  reportFormSchema,
  adminReportFormSchema,
  getAllReports,
  getReportsByStatus,
  getReportById,
  updateReportStatus,
  createAdminReport,
  updateReportPhoto,
} from "./report-service";
import { z } from "zod";

// Helper untuk mendapatkan session dan memastikan role ADMIN
const getAdminSession = async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
};

// Action: Dapatkan semua laporan dengan optional filter status
export const getReportsAction = async (
  status?: "OPEN" | "IN_PROGRESS" | "RESOLVED"
) => {
  try {
    await getAdminSession(); // Hanya admin yang boleh akses

    let reports;
    if (status) {
      reports = await getReportsByStatus(status);
    } else {
      reports = await getAllReports();
    }

    return { success: true, data: reports };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memuat laporan",
    };
  }
};

// Action: Dapatkan detail laporan berdasarkan ID
export const getReportByIdAction = async (id: string) => {
  try {
    await getAdminSession();

    const report = await getReportById(id);
    if (!report) {
      return { success: false, error: "Laporan tidak ditemukan" };
    }

    return { success: true, data: report };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memuat detail laporan",
    };
  }
};

// Action: Perbarui status laporan
export const updateReportStatusAction = async (
  formData: FormData
) => {
  try {
    const session = await getAdminSession();

    const rawData = {
      id: formData.get("id") as string,
      status: formData.get("status") as
        | "OPEN"
        | "IN_PROGRESS"
        | "RESOLVED",
    };

    // Validasi sederhana (bisa ditambahkan Zod jika diperlukan)
    if (!rawData.id || !rawData.status) {
      return { success: false, error: "ID dan status harus diisi" };
    }

    await updateReportStatus(rawData.id, rawData.status);

    // Invalidate cache
    updateTag(CACHE_TAGS.REPORTS_ALL);
    updateTag(CACHE_TAGS.REPORTS_BY_STATUS(rawData.status)); // Fixed: invalidate per-status cache juga
    updateTag(CACHE_TAGS.DASHBOARD_STATS); // Karena jumlah laporan terbuka berubah

    return {
      success: true,
      message: "Status laporan berhasil diperbarui",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memperbarui status laporan",
    };
  }
};

// Action: Buat laporan baru oleh admin
export const createAdminReportAction = async (
  formData: FormData
) => {
  try {
    const session = await getAdminSession();

    const rawData = Object.fromEntries(formData.entries());
    const parsed = adminReportFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0].message,
      };
    }

    await createAdminReport(parsed.data);

    // Invalidate cache
    updateTag(CACHE_TAGS.REPORTS_ALL);
    updateTag(CACHE_TAGS.DASHBOARD_STATS);

    return {
      success: true,
      message: "Laporan baru berhasil dibuat",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal membuat laporan",
    };
  }
};

// Action: Perbarui foto laporan
export const updateReportPhotoAction = async (
  formData: FormData
) => {
  try {
    const session = await getAdminSession();

    const reportId = formData.get("reportId") as string;
    const photoUrl = formData.get("photoUrl") as string;

    if (!reportId || !photoUrl) {
      return {
        success: false,
        error: "ID laporan dan URL foto harus diisi",
      };
    }

    await updateReportPhoto(reportId, photoUrl);

    // Invalidate cache
    updateTag(CACHE_TAGS.REPORT_BY_ID(reportId));
    updateTag(CACHE_TAGS.REPORTS_ALL);
    updateTag(CACHE_TAGS.DASHBOARD_STATS);

    return {
      success: true,
      message: "Foto laporan berhasil diperbarui",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memperbarui foto laporan",
    };
  }
};
```

## 🎨 Komponen UI (Shadcn UI)
Buat komponen di `src/features/reports/components/`:

### ReportFilter.tsx
```typescript
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown } from "lucide-react";

export function ReportFilter({
  onStatusChange,
}: {
  onStatusChange: (status: "ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED") => void;
}) {
  const [activeStatus, setActiveStatus] = useState<"ALL">("ALL");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-[200px]">
        <span className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-md border border-muted">
          {activeStatus === "ALL"
            ? "Semua Status"
            : `${activeStatus}`}
          <ChevronDown className="h-4 w-4 ms-auto" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuCheckboxItem
          onClick={() => {
            setActiveStatus("ALL");
            onStatusChange("ALL");
          }}
          checked={activeStatus === "ALL"}
        >
          Semua Status
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          onClick={() => {
            setActiveStatus("OPEN");
            onStatusChange("OPEN");
          }}
          checked={activeStatus === "OPEN"}
        >
          Open
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          onClick={() => {
            setActiveStatus("IN_PROGRESS");
            onStatusChange("IN_PROGRESS");
          }}
          checked={activeStatus === "IN_PROGRESS"}
        >
          In Progress
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          onClick={() => {
            setActiveStatus("RESOLVED");
            onStatusChange("RESOLVED");
          }}
          checked={activeStatus === "RESOLVED"}
        >
          Resolved
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### ReportTable.tsx
```typescript
import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/ui/menu";
import { MoreHorizontal, Edit, CheckCircle2, XCircle } from "lucide-react";
import { formatRelative } from "date-fns";

interface Report {
  id: string;
  title: string;
  description: string;
  photoUrl?: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: Date;
  lease: {
    user: {
      tenantProfile: {
        fullName: string;
        ktpNumber?: string;
      };
    };
    room: {
      number: string;
      name: string;
      property: {
        name: string;
      };
    };
  };
}

export function ReportTable({
  reports,
  onStatusChange,
  onEdit,
}: {
  reports: Report[];
  onStatusChange: (id: string, status: "OPEN" | "IN_PROGRESS" | "RESOLVED") => Promise<void>;
  onEdit: (id: string) => void;
}) {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

const handleStatusChange = async (
    id: string,
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
  ) => {
    await onStatusChange(id, status); // FIXED: was onCostChange
  };

  return (
    <div className="space-y-4">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Judul</TableHead>
            <TableHead className="w-20">Penghuni</TableHead>
            <TableHead className="w-20">Kamar</TableHead>
            <TableHead className="w-16">Status</TableHead>
            <TableHead className="w-12">Dibuat</TableHead>
            <TableHead className="w-16">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id} className="hover:bg-muted/50">
              <TableCell className="font-medium truncate max-w-32">
                {report.title}
              </TableCell>
              <TableCell className="truncate max-w-32">
                {report.lease.user.tenantProfile.fullName}
                {report.lease.user.tenantProfile.ktpNumber && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({report.lease.user.tenantProfile.ktpNumber})
                  </span>
                )}
              </TableCell>
              <TableCell className="truncate max-w-32">
                {report.lease.room.number} - {report.lease.room.name}
                <br />
                <span className="text-xs text-muted-foreground">
                  {report.lease.room.property.name}
                </span>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  report.status === "OPEN"
                    ? "bg-red-500/20 text-red-500"
                    : report.status === "IN_PROGRESS"
                    ? "bg-yellow-500/20 text-yellow-500"
                    : "bg-green-500/20 text-green-500"
                }`}>
                  {report.status}
                </span>
              </TableCell>
              <TableCell className="text-xs">
                {formatRelative(new Date(report.createdAt), new Date())}
              </TableCell>
              <TableCell>
                <Menu>
                  <MenuTrigger className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </MenuTrigger>
                  <MenuContent className="w-56">
                    <MenuItem
                      onClick={() => {
                        onEdit(report.id);
                      }}
                    >
                      Edit
                    </MenuItem>
                    <MenuItem
                      disabled
                    >
                      Status: {report.status}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleStatusChange(report.id, "IN_PROGRESS");
                      }}
                    >
                      Status: In Progress
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleStatusChange(report.id, "RESOLVED");
                      }}
                    >
                      Status: Resolved
                    </MenuItem>
                  </MenuContent>
                </Menu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### ReportForm.tsx (untuk admin membuat/mengedit laporan)
```typescript
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { adminReportFormSchema } from "../report-service";
import { Select } from "@/components/ui/select";
import { useSearchParams } from "next/navigation"; // Untuk opsi tenant jika diperlukan

interface Props {
  onSubmit: (data: z.infer<typeof adminReportFormSchema>) => Promise<void>;
  onClose: () => void;
  initialData?: Partial<z.infer<typeof adminReportFormSchema>>;
}

export function ReportForm({
  onSubmit,
  onClose,
  initialData,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof adminReportFormSchema>>({
    resolver: zodResolver(adminReportFormSchema),
    defaultValues: initialData,
  });

  const onFormSubmit = async (data: z.infer<typeof adminReportFormSchema>) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error: any) {
      // Error handling akan ditangani oleh onSubmit yang mengembalikan objek {success, error}
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="title">Judul Laporan</Label>
        <Input
          id="title"
          placeholder="Contoh: AC Bocor di Kamar 3"
          {...register("title")}
          className={`
            block w-full rounded-md border-border px-3 py-2 text-sm
            ring-offset-background placeholder:text-muted-foreground
            focus:border-primary focus:ring-primary disabled:cursor-not-allowed
            disabled:opacity-50
            ${errors.title ? "border-destructive" : ""}
          `}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Deskripsi Detail</Label>
        <Textarea
          id="description"
          placeholder="Jelaskan masalahnya secara lengkap..."
          rows={4}
          {...register("description")}
          className={`
            block w-full rounded-md border-border px-3 py-2 text-sm
            ring-offset-background placeholder:text-muted-foreground
            focus:border-primary focus:ring-primary disabled:cursor-not-allowed
            disabled:opacity-50
            ${errors.description ? "border-destructive" : ""}
          `}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Pilih Tenant (hanya untuk form admin membuat laporan baru) */}
      <div className="space-y-1">
        <Label htmlFor="tenantId">Pilih Tenant</Label>
        <Select
          id="tenantId"
          {...register("tenantId")}
          className={`
            w-full flex h-10 items-center justify-between rounded-md border-border
            px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground
            focus:border-primary focus:ring-primary disabled:cursor-not-allowed
            disabled:opacity-50
            ${errors.tenantId ? "border-destructive" : ""}
          `}
        >
          <select>
            <option value="">Pilih tenant...</option>
            // Opsi akan diisi dari props atau fetch dari server
            // Untuk contoh, asumsi diinisialisasi dari luar
          </select>
        </Select>
        {errors.tenantId && (
          <p className="text-sm text-destructive">{errors.tenantId.message}</p>
        )}
      </div>

      {/* Status (hanya untuk edit) */}
      {initialData && (
        <div className="space-y-1">
          <Label htmlFor="status">Status Laporan</Label>
          <Select
            id="status"
            {...register("status")}
            className={`
              w-full flex h-10 items-center justify-between rounded-md border-border
              px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground
              focus:border-primary focus:ring-primary disabled:cursor-not-allowed
              disabled:opacity-50
              ${errors.status ? "border-destructive" : ""}
            `}
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </Select>
          {errors.status && (
            <p className="text-sm text-destructive">{errors.status.message}</p>
          )}
        </div>
      )}

      {/* Foto (opsional) - bisa menggunakan komponen upload terpisah */}
      <div className="space-y-1">
        <Label htmlFor="photoUrl">Foto Laporan (URL)</Label>
        <Input
          id="photoId"
          placeholder="https://example.com/photo.jpg"
          type="url"
          {...register("photoUrl")}
          className={`
            block w-full rounded-md border-border px-3 py-2 text-sm
            ring-offset-background placeholder:text-muted-foreground
            focus:border-primary focus:ring-primary disabled:cursor-not-allowed
            disabled:opacity-50
            ${errors.photoUrl ? "border-destructive" : ""}
          `}
        />
        {errors.photoUrl && (
          <p className="text-sm text-destructive">{errors.photoUrl.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? "Menyimpan..." : "Simpan Laporan"}
        </Button>
      </div>
    </form>
  );
}
```

## 📄 Halaman Admin: Laporan Keluhan & Maintenance
Buat `src/app/(dashboard)/admin/reports/page.tsx`:

```typescript
import { revalidatePath } from "next/cache";
import { getReportsAction, getReportByIdAction, updateReportStatusAction } from "@/features/reports/actions";
import { ReportFilter } from "@/features/reports/components/ReportFilter";
import { ReportTable } from "@/features/reports/components/ReportTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, Description, Footer, Header, Title, Trigger } from "@/components/ui/dialog";
import { ReportForm } from "@/features/reports/components/ReportForm";
import { Plus, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED">("ALL");
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formErrors, setFormErrors] = useState<any>(null);

  // Muat laporan awal
  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const result = await getReportsAction(
        filterStatus === "ALL" ? undefined : filterStatus
      );
      if (result.success) {
        setReports(result.data);
      } else {
        // Handle error (misalnya toast)
        console.error(result.error);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
  ) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("status", status);
      
      const result = await updateReportStatusAction(formData);
      if (result.success) {
        await fetchReports(); // Refresh daftar
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReport = async (id: string) => {
    setEditMode(true);
    setDialogOpen(true);
    try {
      const result = await getReportByIdAction(id);
      if (result.success) {
        setSelectedReport(result.data);
      } else {
        console.error(result.error);
        setDialogOpen(false);
      }
    } catch (error) {
      console.error("Error fetching report for edit:", error);
      setDialogOpen(false);
    }
  };

  const handleCreateReport = () => {
    setEditMode(false);
    setSelectedReport(null); // Reset untuk form baru
    setDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    // Implementasi lengkap: panggil createAdminReportAction dengan FormData
    // Untuk sekarang placeholder - implementasi nyata membutuhkan FormData
    setDialogOpen(false);
    await fetchReports();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Manajemen Laporan Keluhan</h1>
        <div className="flex items-center gap-3">
          <Button onClick={handleCreateReport} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah Laporan Baru
          </Button>
          <Button
            variant="outline"
            onClick={fetchReports}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Segarkan
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <ReportFilter onStatusChange={setFilterStatus} />
        <div className="flex-1 min-w-0">
          {/* Jumlah laporan */}
          <p className="text-sm text-muted-foreground">
            {reports.length} laporan ditampilkan
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full border-4 border-primary/50
            border-t-primary h-8 w-8"></div>
        </div>
      ) : reports.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Tidak ada laporan yang ditemukan.
        </p>
      ) : (
        <ReportTable
          reports={reports}
          onStatusChange={handleStatusChange}
          onEdit={handleEditReport}
        />
      )}

      {/* Dialog untuk membuat/mengedit laporan */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          {/* Trigger dihandle secara internal, tidak perlu ditampilkan */}
          <div />
        </DialogTrigger>
        <DialogContent className="w-full max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Laporan" : "Tambah Laporan Baru"}
            </DialogTitle>
            <Description>
              {editMode
                ? "Ubah detail laporan yang sudah ada"
                : "Buat laporan keluhan baru atas nama tenant"}
            </Description>
          </DialogHeader>
          <ReportForm
            initialData={editMode ? selectedReport : undefined}
            onSubmit={handleFormSubmit}
            onClose={() => setDialogOpen(false)}
          />
          <DialogFooter>
            {/* Tombol sudah ada di dalam ReportForm */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

## 🏷️ Konfigurasi Cache Tags
Update `src/lib/cache-tags.ts`:

```typescript
// Tambahkan ke bagian atas file
export const CACHE_TAGS = {
  // ... existing tags
  REPORTS_ALL: "reports-all" as const,
  REPORTS_BY_STATUS: (status: string) => [`reports-${status}`] as const,
  REPORT_BY_ID: (id: string) => [`report-${id}`] as const,
} as const;

// Tambahkan ke tipe jika menggunakan TypeScript dengan strict
// type CacheTag = typeof CACHE_DEPS[keyof typeof CACHE_DEPS];
// Dalam praktiknya, biasanya tidak perlu jika hanya digunakan dengan updateTag
```

## 📋 Langkah-langkah Implementasi
Berikut adalah urutan pekerjaan yang disarankan:

1. **Persiapan**
   - Pastikan dependencies terkait sudah terinstall (zod, @hookform/resolvers, dll)
   - Buat direktori `src/features/reports/` dan subdirektori `components/`

2. **Implementasi Service Layer**
   - Buat `report-service.ts` dengan fungsi query dan mutasi
   - Implemenasikan validasi dengan Zod
   - Ikuti pola caching yang sama seperti fitur lain

3. **Implementasi Server Actions**
   - Buat `actions.ts` dengan semua server action yang diperlukan
   - Pastikan setiap action memvalidasi role ADMIN
   - Implementasikan invalidate cache yang tepat menggunakan `updateTag()`

4. **Buat Komponen UI**
   - Implementasikan `ReportFilter.tsx`, `ReportTable.tsx`, dan `ReportForm.tsx`
   - Gunakan komponen Shadcn UI yang sudah ada (`@/components/ui/`)
   - Ikuti pola styling dan komponen yang konsisten dengan aplikasi

5. **Buat Halaman Admin**
   - Buat `src/app/(dashboard)/admin/reports/page.tsx`
   - Implementasikan logika untuk memuat data, filter status, dan menangani interaksi

6. **Update Cache Tags**
   - Tambahkan tag cache yang diperlukan ke `src/lib/cache-tags.ts`

7. **Testing dan Validasi**
   - Uji semua fungsi: membuat laporan, mengubah status, mengedit laporan
   - Verifikasi bahwa cache diinvalidate dengan benar setelah mutasi
   - Pastikan hanya pengguna dengan role ADMIN yang dapat mengakses halaman ini

8. **Dokumentasi**
   - Perbarui `milestone.md` untuk mencerminkan progres implementasi
   - Pastikan commit message jelas dan mengikuti konvensi

## ✅ Kriteria Penerimaan
Fitur akan dianggap selesai ketika:
1. Admin dapat mengakses halaman `/admin/reports` dan melihat daftar laporan
2. Admin dapat memfilter laporan berdasarkan status (OPEN, IN_PROGRESS, RESOLVED)
3. Admin dapat mengubah status laporan melalui dropdown/aksi di tabel
4. Admin dapat membuat laporan baru atas nama tenant tertentu
5. Admin dapat mengedit laporan yang sudah ada (mengubah judul, deskripsi, status, foto)
6. Semua perubahan data memicu pembaruan UI secara real-time melalui cache invalidation
7. Hanya pengguna dengan role ADMIN yang dapat mengakses fitur ini
8. Validasi input menggunakan Zod berfungsi dengan benar (pesan error yang sesuai)
9. Upload foto menggunakan mekanisme yang sama seperti di PWA tenant (Supabase Storage)
10. Halaman memfollow pola desain dan komponen yang konsisten dengan sisa aplikasi

## 🔗 Catatan Integrasi dengan PWA Tenant
- Fitur ini akan menggunakan mekanisme upload Supabase Storage yang sama seperti yang ada di `tenant-pwa-service.ts`
- Tidak perlu mengubah implementasi tenant-side karena sudah bekerja dengan baik
- Jika diperlukan, dapat menambahkan notifikasi ke tenant ketika status berubah (masih dalam fitur lain yang belum diimplementasikan)

---

**Catatan untuk Implementor:**
- Ikuti ketat pedoman kode yang tercantum di `AGENTS.md`
- Gunakan komponen Shadcn UI dari `@/components/ui/` sebagai blok konstruksi
- Pastikan semua query di service layer menggunakan `React.cache()` + `unstable_cache()`
- Setelah setiap mutation di server action, panggil `updateTag()` untuk tag yang relevan
- Validasi semua input dengan Zod sebelum memproses
- Hanya izinkan akses ke route `(dashboard)/admin/reports/*` untuk role `ADMIN`