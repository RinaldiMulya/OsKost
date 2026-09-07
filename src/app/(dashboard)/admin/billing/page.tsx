import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAdminBillingOverview } from "@/features/tenants/admin-billing-service";
import { AdminBillingView } from "@/features/tenants/components/admin-billing-view";

export const metadata = {
  title: "Tagihan & Keuangan | Admin Smartkost",
};

export default async function AdminBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; status?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const data = await getAdminBillingOverview(
    resolvedParams.query,
    resolvedParams.status
  );

  return <AdminBillingView data={data} />;
}
