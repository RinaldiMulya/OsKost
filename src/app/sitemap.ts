import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Get all rooms to include in the sitemap
  const rooms = await prisma.room.findMany({
    select: { id: true },
  });

  const roomUrls = rooms.map((room) => ({
    url: `${baseUrl}/rooms/${room.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...roomUrls,
  ];
}
