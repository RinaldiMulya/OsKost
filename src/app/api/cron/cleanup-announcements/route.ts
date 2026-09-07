import { NextResponse } from "next/server";
import { deleteExpiredAnnouncements } from "@/features/notifications/notification-service";
import logger from "@/lib/logger";

const log = logger.child({ module: "cron-cleanup-announcements" });

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Basic security header check (optional)
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const result = await deleteExpiredAnnouncements();

    return NextResponse.json({
      success: true,
      message: `Berhasil menghapus ${result.count} pengumuman yang lebih tua dari 3 hari.`,
      deletedCount: result.count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log.error({ err: error }, "Cron job error: Cleanup Announcements");
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
