import { getSaaSPricingPlans } from "@/features/super-admin/actions/plans-actions";
import { PricingPlansClient } from "@/features/super-admin/components/plans/pricing-plans-client";

export const metadata = {
    title: "Kelola Paket Harga SaaS | OsKost Super Admin",
    description: "Pusat pengaturan tarif paket langganan dan matriks fitur SaaS OsKost.",
};

export default async function SuperAdminPlansPage() {
    const plans = await getSaaSPricingPlans();

    return <PricingPlansClient initialPlans={plans} />;
}
