import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

const log = logger.child({ module: "cron-cleanup-reports" });

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        // Basic security to ensure this is called by Vercel Cron
        const authHeader = request.headers.get("authorization");
        if (
            process.env.CRON_SECRET &&
            authHeader !== `Bearer ${process.env.CRON_SECRET}`
        ) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Hitung tanggal 14 hari yang lalu
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        // Cari laporan yang lebih lama dari 14 hari
        const oldReports = await prisma.report.findMany({
            where: {
                createdAt: {
                    lt: fourteenDaysAgo,
                },
            },
            select: { id: true, photoUrl: true }
        });

        // (Opsional) Jika menggunakan Supabase Storage, kita bisa menghapus foto di storage secara terpisah
        // menggunakan Supabase Admin Client. Untuk saat ini kita hapus record databasenya.

        const deletedReports = await prisma.report.deleteMany({
            where: {
                createdAt: {
                    lt: fourteenDaysAgo,
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: `Berhasil menghapus ${deletedReports.count} laporan lama.`,
            deletedCount: deletedReports.count,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        log.error({ err: error }, "Cron job error: Cleanup Reports");
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
