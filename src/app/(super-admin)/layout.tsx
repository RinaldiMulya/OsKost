import { requireSuperAdmin } from "@/lib/auth-guard";
import { SuperAdminSidebar } from "@/features/super-admin/components/super-admin-sidebar";
import { SuperAdminHeader } from "@/features/super-admin/components/super-admin-header";

export const metadata = {
    title: {
        default: "Super Admin Console | OsKost SaaS",
        template: "%s | OsKost Super Admin",
    },
    description: "Pusat Kendali Eksekutif OsKost SaaS Multi-Tenant Platform",
};

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Defense-in-depth: Validate SUPER_ADMIN privileges on server
    const user = await requireSuperAdmin();

    return (
        <div className="flex h-screen w-full bg-[#FAF7F2] text-[#2D2D2D] overflow-hidden antialiased">
            {/* Dark Japandi Sidebar */}
            <SuperAdminSidebar userEmail={user.email ?? "superadmin@oskost.id"} />

            {/* Main Stage Area */}
            <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
                <SuperAdminHeader userEmail={user.email ?? "superadmin@oskost.id"} />
                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FAF7F2]">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
