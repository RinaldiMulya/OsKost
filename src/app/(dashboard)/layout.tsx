import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminSidebar } from "@/features/dashboard/admin-sidebar";
import { AdminHeader } from "@/features/dashboard/admin-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Double-check: must be logged in as ADMIN
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AdminSidebar userEmail={session.user.email ?? "Admin"} />

          {/* Main content area */}
          <div className="flex flex-1 flex-col min-w-0 overflow-y-auto">
            <AdminHeader />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
