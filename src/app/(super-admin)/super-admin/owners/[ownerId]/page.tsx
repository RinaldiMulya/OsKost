import { notFound } from "next/navigation";
import { getOwnerDetails } from "@/features/super-admin/actions/owners-actions";
import { OwnerDetailClient } from "@/features/super-admin/components/owners/owner-detail-client";

interface OwnerDetailPageProps {
    params: Promise<{
        ownerId: string;
    }>;
}

export async function generateMetadata({ params }: OwnerDetailPageProps) {
    const { ownerId } = await params;
    const owner = await getOwnerDetails(ownerId);

    return {
        title: owner ? `Detail Owner: ${owner.email || owner.phoneNumber}` : "Detail Pemilik Kost",
    };
}

export default async function SuperAdminOwnerDetailPage({ params }: OwnerDetailPageProps) {
    const { ownerId } = await params;
    const owner = await getOwnerDetails(ownerId);

    if (!owner) {
        notFound();
    }

    return <OwnerDetailClient owner={owner} />;
}
