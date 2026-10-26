import "dotenv/config";
import { prisma } from "../src/lib/db";
import bcryptjs from "bcryptjs";

async function main() {
    try {
        const users = await prisma.user.findMany({
            include: {
                tenantProfile: true,
                leases: {
                    include: {
                        room: true
                    }
                }
            }
        });
        
        console.log("=== ALL USERS IN DATABASE ===");
        for (const u of users) {
            const isOskost123 = await bcryptjs.compare("oskost123", u.passwordHash);
            const isSuperAdminPass = await bcryptjs.compare("PasswordSuperAdmin123!", u.passwordHash);
            const isAdminPass = await bcryptjs.compare("adminpassword123!", u.passwordHash);
            console.log({
                id: u.id,
                email: u.email,
                phone: u.phoneNumber,
                role: u.role,
                name: u.tenantProfile?.fullName,
                leases: u.leases.map(l => ({ id: l.id, isActive: l.isActive, startDate: l.startDate, endDate: l.endDate, roomId: l.roomId })),
            });
        }

        const { getDashboardStats } = await import("../src/features/dashboard/dashboard-service");
        const stats = await getDashboardStats();
        console.log("=== GET DASHBOARD STATS OUTPUT ===");
        console.log(stats);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
