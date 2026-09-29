import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/api-auth";

const updateProfileSchema = z.object({
    fullName: z.string().min(2, "Nama lengkap minimal 2 karakter").optional(),
    avatarUrl: z.string().url("URL avatar tidak valid").optional().nullable(),
    address: z.string().max(255).optional().nullable(),
    emergencyContactName: z.string().max(100).optional().nullable(),
    emergencyContactNumber: z.string().max(30).optional().nullable(),
    emergencyContactRelation: z.string().max(50).optional().nullable(),
});

export async function GET(req: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(req);
        if (!authUser) {
            return apiError("UNAUTHORIZED", "Sesi login tidak valid atau kadaluarsa", 401);
        }

        const user = await prisma.user.findUnique({
            where: { id: authUser.id },
            include: {
                tenantProfile: true,
                leases: {
                    where: { isActive: true },
                    include: {
                        room: true,
                        property: true,
                    },
                    take: 1,
                },
            },
        });

        if (!user) {
            return apiError("NOT_FOUND", "Pengguna tidak ditemukan", 404);
        }

        const activeLease = user.leases[0] || null;

        return apiSuccess({
            id: user.id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            forceReset: user.forceReset,
            passwordChangedAt: user.passwordChangedAt,
            profile: user.tenantProfile,
            activeLease: activeLease
                ? {
                      id: activeLease.id,
                      startDate: activeLease.startDate,
                      endDate: activeLease.endDate,
                      agreementDocUrl: activeLease.agreementDocUrl,
                      room: {
                          id: activeLease.room.id,
                          number: activeLease.room.number,
                          name: activeLease.room.name,
                          type: activeLease.room.type,
                          price: activeLease.room.price,
                          facilities: activeLease.room.facilities,
                          images: activeLease.room.images,
                      },
                      property: activeLease.property
                          ? {
                                id: activeLease.property.id,
                                name: activeLease.property.name,
                                slug: activeLease.property.slug,
                                address: activeLease.property.address,
                                primaryColorHex: activeLease.property.primaryColorHex,
                                accentColorHex: activeLease.property.accentColorHex,
                                managerPhone: activeLease.property.managerPhone,
                                guardPhone: activeLease.property.guardPhone,
                                emergencyPhone: activeLease.property.emergencyPhone,
                            }
                          : null,
                  }
                : null,
        });
    } catch (error) {
        console.error("[API_ME_GET_ERROR]", error);
        return apiError("INTERNAL_ERROR", "Gagal memuat profil pengguna", 500);
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(req);
        if (!authUser) {
            return apiError("UNAUTHORIZED", "Sesi login tidak valid", 401);
        }

        const body = await req.json().catch(() => null);
        const parsed = updateProfileSchema.safeParse(body);

        if (!parsed.success) {
            return apiError(
                "VALIDATION_ERROR",
                parsed.error.issues[0]?.message || "Data profil tidak valid",
                400,
                parsed.error.format()
            );
        }

        const dataToUpdate = parsed.data;

        const updatedProfile = await prisma.tenantProfile.upsert({
            where: { userId: authUser.id },
            update: {
                ...(dataToUpdate.fullName && { fullName: dataToUpdate.fullName }),
                ...(dataToUpdate.avatarUrl !== undefined && { avatarUrl: dataToUpdate.avatarUrl }),
                ...(dataToUpdate.address !== undefined && { address: dataToUpdate.address }),
                ...(dataToUpdate.emergencyContactName !== undefined && {
                    emergencyContactName: dataToUpdate.emergencyContactName,
                }),
                ...(dataToUpdate.emergencyContactNumber !== undefined && {
                    emergencyContactNumber: dataToUpdate.emergencyContactNumber,
                }),
                ...(dataToUpdate.emergencyContactRelation !== undefined && {
                    emergencyContactRelation: dataToUpdate.emergencyContactRelation,
                }),
            },
            create: {
                userId: authUser.id,
                fullName: dataToUpdate.fullName || authUser.email || "Penghuni Kost",
                avatarUrl: dataToUpdate.avatarUrl,
                address: dataToUpdate.address,
                emergencyContactName: dataToUpdate.emergencyContactName,
                emergencyContactNumber: dataToUpdate.emergencyContactNumber,
                emergencyContactRelation: dataToUpdate.emergencyContactRelation,
            },
        });

        return apiSuccess({
            profile: updatedProfile,
            message: "Profil berhasil diperbarui",
        });
    } catch (error) {
        console.error("[API_ME_PATCH_ERROR]", error);
        return apiError("INTERNAL_ERROR", "Gagal memperbarui profil", 500);
    }
}
