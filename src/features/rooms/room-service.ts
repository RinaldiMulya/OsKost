import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { RoomStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { z } from "zod";

// ============================================
// Types
// ============================================

export interface RoomDetail {
    id: string;
    number: string;
    name: string;
    type?: string | null;
    price: number;
    facilities: string[];
    description: string | null;
    status: RoomStatus;
    images: string[];
    propertyId?: string;
    property?: {
        id: string;
        name: string;
        slug: string | null;
        address: string;
        managerPhone: string | null;
        guardPhone: string | null;
    } | null;
    panoramaImages?: {
        id: string;
        title: string;
        description: string | null;
        imageUrl: string;
    }[];
}

export interface RoomForAdmin extends RoomDetail {
    propertyId: string;
    _count?: { leases: number };
}

// ============================================
// Zod Schemas
// ============================================

const idSchema = z.string().min(1, "Room ID is required");

export const roomFormSchema = z.object({
    number: z.string().min(1, "Nomor kamar wajib diisi"),
    name: z.string().min(1, "Nama kamar wajib diisi"),
    price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
    status: z.enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE"]),
    description: z.string().optional().default(""),
    facilities: z.string().optional().default(""), // comma-separated in form, split to array
    images: z.string().optional().default(""), // comma-separated URLs
});

export type RoomFormValues = z.infer<typeof roomFormSchema>;

// ============================================
// READ - Landing Page (cached)
// ============================================

const getRoomsForLandingQuery = unstable_cache(
    async () => {
        const rooms = await prisma.room.findMany({
            take: 11,
            orderBy: { number: "asc" },
            select: {
                id: true,
                name: true,
                number: true,
                type: true,
                price: true,
                status: true,
                description: true,
                facilities: true,
                images: true,
                propertyId: true,
                property: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        address: true,
                        managerPhone: true,
                        guardPhone: true,
                    }
                },
                panoramaImages: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        imageUrl: true,
                    }
                },
            },
        });
        return rooms as RoomDetail[];
    },
    ["rooms-landing"],
    { revalidate: 300, tags: [CACHE_TAGS.ROOMS_LANDING] }
);

export async function getRoomsForLanding(): Promise<RoomDetail[]> {
    return getRoomsForLandingQuery();
}

// ============================================
// READ - Active Property Info & Statistics
// ============================================

export interface PropertyWithStats {
    id: string;
    name: string;
    slug: string | null;
    address: string;
    managerPhone: string | null;
    guardPhone: string | null;
    totalRooms: number;
    availableRooms: number;
    occupiedRooms: number;
    maintenanceRooms: number;
}

export async function getActivePropertyWithStats(): Promise<PropertyWithStats | null> {
    const property = await prisma.property.findFirst({
        where: { slug: "pulo-jahe" },
        include: {
            rooms: {
                select: { status: true }
            }
        }
    }) || await prisma.property.findFirst({
        include: {
            rooms: {
                select: { status: true }
            }
        }
    });

    if (!property) return null;

    const totalRooms = property.rooms.length;
    const availableRooms = property.rooms.filter(r => r.status === "AVAILABLE").length;
    const occupiedRooms = property.rooms.filter(r => r.status === "OCCUPIED").length;
    const maintenanceRooms = property.rooms.filter(r => r.status === "MAINTENANCE").length;

    return {
        id: property.id,
        name: property.name,
        slug: property.slug,
        address: property.address,
        managerPhone: property.managerPhone,
        guardPhone: property.guardPhone,
        totalRooms,
        availableRooms,
        occupiedRooms,
        maintenanceRooms
    };
}

// ============================================
// READ - Filtered Public Catalog Rooms
// ============================================

export interface PublicCatalogFilterParams {
    search?: string;
    type?: string;
    status?: string;
    priceRange?: string;
    propertySlug?: string;
}

export async function getPublicCatalogRooms(filters: PublicCatalogFilterParams): Promise<RoomDetail[]> {
    const where: any = {};

    // Filter Property
    if (filters.propertySlug && filters.propertySlug !== "all") {
        where.property = { slug: filters.propertySlug };
    }

    // Filter Search
    if (filters.search && filters.search.trim() !== "") {
        const query = filters.search.trim();
        where.OR = [
            { number: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
        ];
    }

    // Filter Tipe Kamar (1 Orang vs 2-3 Orang)
    if (filters.type && filters.type !== "all") {
        if (filters.type === "standar" || filters.type === "standard") {
            where.type = { contains: "Standar", mode: "insensitive" };
        } else if (filters.type === "besar" || filters.type === "large" || filters.type === "deluxe") {
            where.type = { contains: "Besar", mode: "insensitive" };
        } else {
            where.type = { contains: filters.type, mode: "insensitive" };
        }
    }

    // Filter Status (AVAILABLE, OCCUPIED, MAINTENANCE)
    if (filters.status && filters.status !== "all") {
        where.status = filters.status.toUpperCase();
    }

    // Filter Rentang Harga
    if (filters.priceRange && filters.priceRange !== "all") {
        if (filters.priceRange === "under_1500k" || filters.priceRange === "under-1.5m") {
            where.price = { lte: 1499999 };
        } else if (filters.priceRange === "1500k_2500k" || filters.priceRange === "1.5m-2.5m") {
            where.price = { gte: 1500000, lte: 2500000 };
        } else if (filters.priceRange === "above_2500k" || filters.priceRange === "above-2.5m") {
            where.price = { gte: 2500001 };
        }
    }

    const rooms = await prisma.room.findMany({
        where,
        orderBy: { number: "asc" },
        select: {
            id: true,
            name: true,
            number: true,
            type: true,
            price: true,
            status: true,
            description: true,
            facilities: true,
            images: true,
            propertyId: true,
            property: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    address: true,
                    managerPhone: true,
                    guardPhone: true,
                }
            },
            panoramaImages: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    imageUrl: true,
                }
            },
        },
    });

    return rooms as RoomDetail[];
}

// ============================================
// READ - Single Room (cached)
// ============================================

export async function getRoomById(id: string): Promise<RoomDetail | null> {
    const parsedId = idSchema.parse(id);

    const cachedQuery = unstable_cache(
        async (roomId: string) => {
            const room = await prisma.room.findUnique({
                where: { id: roomId },
                select: {
                    id: true,
                    name: true,
                    number: true,
                    type: true,
                    price: true,
                    status: true,
                    description: true,
                    facilities: true,
                    images: true,
                    propertyId: true,
                    property: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            address: true,
                            managerPhone: true,
                            guardPhone: true,
                        }
                    },
                    panoramaImages: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            imageUrl: true,
                        }
                    },
                },
            });
            return room as RoomDetail | null;
        },
        [`room-${parsedId}`],
        { revalidate: 300, tags: [CACHE_TAGS.roomDetail(parsedId)] }
    );

    return cachedQuery(parsedId);
}

// ============================================
// READ - All Rooms for Admin (no cache - always fresh)
// ============================================

export interface AdminRoomStats {
    totalRooms: number;
    availableRooms: number;
    occupiedRooms: number;
    maintenanceRooms: number;
    uniqueTypes: string[];
}

export const getAdminRoomStats = cache(async (): Promise<AdminRoomStats> => {
    return unstable_cache(
        async () => {
            const [total, available, occupied, maintenance, distinctNames] = await Promise.all([
                prisma.room.count(),
                prisma.room.count({ where: { status: "AVAILABLE" } }),
                prisma.room.count({ where: { status: "OCCUPIED" } }),
                prisma.room.count({ where: { status: "MAINTENANCE" } }),
                prisma.room.findMany({ distinct: ["name"], select: { name: true } })
            ]);

            return {
                totalRooms: total,
                availableRooms: available,
                occupiedRooms: occupied,
                maintenanceRooms: maintenance,
                uniqueTypes: distinctNames.map(r => r.name)
            };
        },
        ["admin-room-stats"],
        { tags: [CACHE_TAGS.ADMIN_ROOM_STATS], revalidate: 300 }
    )();
});

export const getRoomsForAdmin = cache(async (params: {
    search?: string;
    status?: string;
    type?: string;
    page: number;
    limit: number;
}): Promise<{ data: RoomForAdmin[]; totalCount: number }> => {
    const { search, status, type, page, limit } = params;

    // For search/filtered queries, use unstable_cache with params-specific key
    return unstable_cache(
        async () => {
            const skip = (page - 1) * limit;
            const where: any = {};
            if (search) {
                where.OR = [
                    { number: { contains: search, mode: "insensitive" } },
                    { name: { contains: search, mode: "insensitive" } },
                ];
            }
            if (status && status !== "ALL") {
                where.status = status;
            }
            if (type && type !== "ALL") {
                where.name = type;
            }

            const [rooms, totalCount] = await Promise.all([
                prisma.room.findMany({
                    where,
                    orderBy: { number: "asc" },
                    skip,
                    take: limit,
                    include: {
                        _count: { select: { leases: true } },
                    },
                }),
                prisma.room.count({ where }),
            ]);

            return { data: rooms as RoomForAdmin[], totalCount };
        },
        [`admin-rooms-${search || ""}-${status || "ALL"}-${type || "ALL"}-${page}-${limit}`],
        { tags: [CACHE_TAGS.ADMIN_ROOMS], revalidate: 120 }
    )();
});

// ============================================
// CREATE
// ============================================

export async function createRoom(data: {
    number: string;
    name: string;
    price: number;
    status: RoomStatus;
    description?: string;
    facilities: string[];
    images: string[];
    panoramaImages?: {
        title: string;
        description?: string;
        imageUrl: string;
        storagePath: string;
        userId: string;
    }[];
}) {
    // Get the default property
    const property = await prisma.property.findFirst();
    if (!property) {
        throw new Error("No property found. Please seed the database first.");
    }

    return prisma.room.create({
        data: {
            number: data.number,
            name: data.name,
            price: data.price,
            status: data.status,
            description: data.description || null,
            facilities: data.facilities,
            images: data.images,
            propertyId: property.id,
            panoramaImages: data.panoramaImages ? {
                create: data.panoramaImages.map(pano => ({
                    title: pano.title,
                    description: pano.description || null,
                    imageUrl: pano.imageUrl,
                    storagePath: pano.storagePath,
                    userId: pano.userId,
                }))
            } : undefined,
        },
    });
}

// ============================================
// UPDATE
// ============================================

export async function updateRoom(
    id: string,
    data: {
        number?: string;
        name?: string;
        price?: number;
        status?: RoomStatus;
        description?: string;
        facilities?: string[];
        images?: string[];
    }
) {
    const parsedId = idSchema.parse(id);

    return prisma.room.update({
        where: { id: parsedId },
        data: {
            ...(data.number !== undefined && { number: data.number }),
            ...(data.name !== undefined && { name: data.name }),
            ...(data.price !== undefined && { price: data.price }),
            ...(data.status !== undefined && { status: data.status }),
            ...(data.description !== undefined && { description: data.description || null }),
            ...(data.facilities !== undefined && { facilities: data.facilities }),
            ...(data.images !== undefined && { images: data.images }),
        },
    });
}

// ============================================
// DELETE
// ============================================

export async function deleteRoom(id: string) {
    const parsedId = idSchema.parse(id);

    // Check if room has active leases
    const room = await prisma.room.findUnique({
        where: { id: parsedId },
        include: { _count: { select: { leases: true } } },
    });

    if (room && room._count.leases > 0) {
        throw new Error(
            "Tidak bisa menghapus kamar yang memiliki data penyewa. Ubah status kamar ke MAINTENANCE sebagai alternatif."
        );
    }

    return prisma.room.delete({
        where: { id: parsedId },
    });
}

// ============================================
// BULK UPDATE STATUS
// ============================================

export async function bulkUpdateRoomStatus(ids: string[], status: RoomStatus) {
    if (!ids || ids.length === 0) return;

    return prisma.room.updateMany({
        where: {
            id: {
                in: ids,
            },
        },
        data: {
            status,
        },
    });
}


// ============================================
// PANORAMA 360° ACTIONS
// ============================================

export async function addPanoramaToRoom(data: {
    roomId: string;
    userId: string;
    title: string;
    description?: string;
    imageUrl: string;
    storagePath: string;
}) {
    const parsedRoomId = idSchema.parse(data.roomId);
    const parsedUserId = z.string().parse(data.userId);

    return prisma.panoramaImage.create({
        data: {
            title: data.title,
            description: data.description || null,
            imageUrl: data.imageUrl,
            storagePath: data.storagePath,
            roomId: parsedRoomId,
            userId: parsedUserId,
        },
    });
}

export async function deletePanoramaFromRoom(panoramaId: string) {
    const parsedId = z.string().parse(panoramaId);

    return prisma.panoramaImage.delete({
        where: { id: parsedId },
    });
}

/** Return type helpers for use in components */
export type RoomForLanding = NonNullable<
    Awaited<ReturnType<typeof getRoomsForLanding>>
>[number];
