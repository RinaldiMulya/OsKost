import { notFound } from "next/navigation";
import {
  getTenantDetailById,
  getSignedKtpUrl,
} from "@/features/tenants/tenant-service";
import { TenantHeader } from "@/features/tenants/components/tenant-detail/tenant-header";
import { TenantTabs } from "@/features/tenants/components/tenant-detail/tenant-tabs";
import type { Metadata } from "next";

interface TenantDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TenantDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const tenant = await getTenantDetailById(id);
  return {
    title: tenant?.tenantProfile
      ? `Detail ${tenant.tenantProfile.fullName} | Admin Smartkost`
      : "Detail Penghuni | Admin Smartkost",
  };
}

export default async function TenantDetailPage({
  params,
}: TenantDetailPageProps) {
  const { id } = await params;
  const tenant = await getTenantDetailById(id);

  if (!tenant) {
    notFound();
  }

  // Generate signed URL untuk KTP jika ada
  let signedKtpUrl: string | null = null;
  if (tenant.tenantProfile?.ktpPhotoUrl) {
    signedKtpUrl = await getSignedKtpUrl(tenant.tenantProfile.ktpPhotoUrl);
  }

  return (
    <div className="space-y-2 lg:p-2 w-full lg:max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <TenantHeader tenant={tenant} />
      <TenantTabs tenant={tenant} signedKtpUrl={signedKtpUrl} />
    </div>
  );
}
