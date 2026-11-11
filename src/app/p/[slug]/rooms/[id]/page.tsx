import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string; id: string }>;
}

export default async function PropertyRoomDetailRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/rooms/${id}`);
}

