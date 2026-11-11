import { requireOwnerSession } from "@/lib/auth-guard";
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
  const user = await requireOwnerSession();

  const resolvedParams = await searchParams;
  const data = await getAdminBillingOverview(
    resolvedParams.query,
    resolvedParams.status,
    user.propertyId
  );

  return <AdminBillingView data={data} />;
}
