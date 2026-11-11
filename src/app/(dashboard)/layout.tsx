import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminSidebar } from "@/features/dashboard/admin-sidebar";
import { AdminHeader } from "@/features/dashboard/admin-header";
import { getUserNotifications } from "@/features/notifications/notification-service";
import { getActiveImpersonation } from "@/features/super-admin/actions/impersonation-actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Guard: Must be logged in as ADMIN, PROPERTY_OWNER, or SUPER_ADMIN
  const allowedRoles = ["ADMIN", "PROPERTY_OWNER", "SUPER_ADMIN"];
  if (!session?.user || !allowedRoles.includes(session.user.role)) {
    redirect("/login");
  }

  const impersonation = await getActiveImpersonation();
  const notifications = await getUserNotifications(
    impersonation ? impersonation.ownerId : session.user.id
  );

  const displayEmail = impersonation
    ? `${impersonation.ownerEmail} (Impersonasi)`
    : (session.user.email ?? "Admin");

  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "13.75rem",
            "--sidebar-width-icon": "4rem",
          } as React.CSSProperties
        }
      >
        <div className="flex h-screen w-full bg-background overflow-hidden">
          <AdminSidebar
            userEmail={displayEmail}
            userRole={session.user.role}
          />

          {/* Main content area */}
          <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
            <AdminHeader
              notifications={notifications}
              impersonation={impersonation}
              isSuperAdmin={session.user.role === "SUPER_ADMIN"}
            />
            <main className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
