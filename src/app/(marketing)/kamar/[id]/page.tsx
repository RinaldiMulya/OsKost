import { redirect } from "next/navigation";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function KamarDetailPage({ params }: Props) {
    const { id } = await params;
    redirect(`/rooms/${id}`);
}
