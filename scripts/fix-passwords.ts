import "dotenv/config";
import bcryptjs from "bcryptjs";
import { prisma } from "../src/lib/db";

async function main() {
    console.log("=== FIXING USER PASSWORDS IN DATABASE ===");

    const superAdminPassword = "PasswordSuperAdmin123!";
    const adminPassword = "adminpassword123!";

    const hashedSuperAdmin = await bcryptjs.hash(superAdminPassword, 10);
    const hashedAdmin = await bcryptjs.hash(adminPassword, 10);

    console.log("Super Admin Hash sample:", hashedSuperAdmin.slice(0, 15) + "...");
    console.log("Admin Hash sample:", hashedAdmin.slice(0, 15) + "...");

    // 1. Update via Prisma
    try {
        const updatedSuperAdmin = await prisma.user.update({
            where: { email: "superadmin@oskost.id" },
            data: { passwordHash: hashedSuperAdmin },
        });
        console.log("✅ Super Admin password updated via Prisma:", updatedSuperAdmin.email);
    } catch (e: any) {
        console.error("Prisma update Super Admin failed:", e.message);
    }

    try {
        const updatedAdmin = await prisma.user.update({
            where: { email: "admin@oskost.com" },
            data: { passwordHash: hashedAdmin },
        });
        console.log("✅ Admin password updated via Prisma:", updatedAdmin.email);
    } catch (e: any) {
        console.error("Prisma update Admin failed:", e.message);
    }

    // 2. Fallback / direct update via Supabase REST API (in case pooler is blocked)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) {
        const headers = {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
        };

        try {
            const resSuper = await fetch(
                `${supabaseUrl}/rest/v1/User?email=eq.superadmin@oskost.id`,
                {
                    method: "PATCH",
                    headers,
                    body: JSON.stringify({ passwordHash: hashedSuperAdmin }),
                }
            );
            const dataSuper = await resSuper.json();
            console.log("✅ REST API Super Admin updated:", dataSuper[0]?.email, "Hash length:", dataSuper[0]?.passwordHash?.length);

            const resAdmin = await fetch(
                `${supabaseUrl}/rest/v1/User?email=eq.admin@oskost.com`,
                {
                    method: "PATCH",
                    headers,
                    body: JSON.stringify({ passwordHash: hashedAdmin }),
                }
            );
            const dataAdmin = await resAdmin.json();
            console.log("✅ REST API Admin updated:", dataAdmin[0]?.email, "Hash length:", dataAdmin[0]?.passwordHash?.length);
        } catch (err: any) {
            console.error("REST API update failed:", err.message);
        }
    }

    // 3. Verification Test
    console.log("\n=== TESTING AUTH VERIFICATION ===");
    const testSuper = await bcryptjs.compare(superAdminPassword, hashedSuperAdmin);
    const testAdmin = await bcryptjs.compare(adminPassword, hashedAdmin);
    console.log(`Verify 'PasswordSuperAdmin123!' -> ${testSuper ? "MATCH ✅" : "FAILED ❌"}`);
    console.log(`Verify 'adminpassword123!' -> ${testAdmin ? "MATCH ✅" : "FAILED ❌"}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
