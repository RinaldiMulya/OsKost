"use client";

import Image from "next/image";
import type { TenantDetailForAdmin } from "../../tenant-service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar, MessageSquare, Wrench } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { deleteReportAction } from "@/features/reports/actions";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { ImageViewer } from "@/components/shared/image-viewer";

interface TenantReportsTabProps {
    tenant: TenantDetailForAdmin;
}

export function TenantReportsTab({ tenant }: TenantReportsTabProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Kumpulkan semua report dari semua lease yang pernah ada, urutkan terbaru
    const allReports = tenant.leases
        .flatMap(l => l.reports)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    function formatDate(dateStr: Date | string) {
        if (!dateStr) return "—";
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }).format(new Date(dateStr));
    }

    const handleDeletePrompt = (reportId: string) => {
        setReportToDelete(reportId);
        setDeleteDialogOpen(true);
    };

    const executeDelete = () => {
        if (!reportToDelete) return;
        
        startTransition(async () => {
            try {
                const result = await deleteReportAction(reportToDelete);
                if (result.success) {
                    toast.success(result.message);
                } else {
                    toast.error(result.error || "Gagal menghapus laporan");
                }
            } catch (error) {
                toast.error("Terjadi kesalahan saat menghapus laporan");
            } finally {
                setDeleteDialogOpen(false);
                setReportToDelete(null);
            }
        });
    };

    return (
        <Card className="bg-zinc-900/60 border-zinc-800">
            <CardHeader className="pb-3 border-b border-zinc-800/80">
                <CardTitle className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
                    <Wrench className="size-5 text-amber-400" />
                    Laporan Kerusakan & Keluhan
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                {allReports.length > 0 ? (
                    <div className="space-y-4">
                        {allReports.map((report) => (
                            <div key={report.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative overflow-hidden transition-colors hover:border-zinc-700/80 hover:bg-zinc-800/30">
                                <div className="absolute top-0 right-0">
                                    <Badge className={`rounded-none rounded-bl-lg font-bold uppercase tracking-wider text-[10px] px-3 py-1 ${
                                        report.status === 'OPEN' ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/20 border-rose-500/30' :
                                        report.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/20 border-amber-500/30' :
                                        'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30'
                                    }`}>
                                        {report.status.replace("_", " ")}
                                    </Badge>
                                </div>
                                
                                <div className="pr-20 mb-3 flex items-start justify-between">
                                    <div>
                                        <h4 className="text-zinc-100 font-semibold text-lg">{report.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1.5">
                                            <Calendar className="size-3.5" />
                                            <span>Dilaporkan pada {formatDate(report.createdAt)}</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeletePrompt(report.id)}
                                        className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 mt-1 mr-[-60px]"
                                        title="Hapus Laporan"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                
                                <div className="flex items-start gap-3 mt-4">
                                    <MessageSquare className="size-4 text-zinc-500 mt-0.5 shrink-0" />
                                    <p className="text-zinc-300 text-sm leading-relaxed bg-zinc-950/50 p-3 rounded-lg flex-1 border border-zinc-800/50">
                                        {report.description}
                                    </p>
                                </div>

                                {report.photoUrl && (
                                    <div className="mt-4 pl-7">
                                        <ImageViewer
                                            src={report.photoUrl}
                                            alt={report.title}
                                            className="w-48 h-32 bg-zinc-950/50 rounded-lg border border-zinc-800/50"
                                            imageClassName="object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                        <AlertCircle className="size-12 mb-3 opacity-20" />
                        <p>Penghuni belum pernah membuat laporan kerusakan.</p>
                    </div>
                )}
            </CardContent>

            {/* Alert Dialog: Konfirmasi Hapus */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="border-zinc-800 bg-zinc-950 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Laporan?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isPending}
                            className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                executeDelete();
                            }}
                            disabled={isPending}
                            className="bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
                        >
                            {isPending ? "Menghapus..." : "Ya, Hapus"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
