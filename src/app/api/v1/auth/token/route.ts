import { NextRequest } from "next/server";
import { z } from "zod";
import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import {
    signAccessToken,
    generateRefreshToken,
    hashToken,
    REFRESH_TOKEN_EXPIRY_DAYS,
} from "@/lib/jwt";

const loginSchema = z.object({
    identifier: z.string().min(1, "Nomor WhatsApp atau email wajib diisi"),
    password: z.string().min(1, "Kata sandi wajib diisi"),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null);
        const parsed = loginSchema.safeParse(body);

        if (!parsed.success) {
            return apiError(
                "VALIDATION_ERROR",
                parsed.error.issues[0]?.message || "Input tidak valid",
                400,
                parsed.error.format()
            );
        }

        const { identifier, password } = parsed.data;

        // Normalisasi nomor telepon jika ada awalan 0 / +62
        let normalizedPhone = identifier.trim();
        if (normalizedPhone.startsWith("+62")) {
            normalizedPhone = "0" + normalizedPhone.substring(3);
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { phoneNumber: identifier.trim() },
                    { phoneNumber: normalizedPhone },
                    { email: identifier.trim().toLowerCase() },
                ],
            },
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
                ownedProperties: {
                    take: 1,
                },
            },
        });

        if (!user) {
            return apiError(
                "INVALID_CREDENTIALS",
                "Nomor WhatsApp atau kata sandi tidak sesuai.",
                401
            );
        }

        if (!user.isActive) {
            return apiError(
                "ACCOUNT_DEACTIVATED",
                "Akun Anda sedang dinonaktifkan. Hubungi pengelola kost.",
                403
            );
        }

        if (user.isSuspended) {
            return apiError(
                "ACCOUNT_SUSPENDED",
                "Akun Anda ditangguhkan sementara karena keterlambatan sewa.",
                403
            );
        }

        const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return apiError(
                "INVALID_CREDENTIALS",
                "Nomor WhatsApp atau kata sandi tidak sesuai.",
                401
            );
        }

        const activeLease = user.leases[0] || null;
        let property = activeLease?.property || null;

        if (!property && user.ownedProperties.length > 0) {
            property = user.ownedProperties[0];
        }

        if (!property) {
            property = await prisma.property.findFirst({
                where: { slug: "pulo-jahe" },
            });
        }

        // Generate Access Token (15 menit)
        const accessToken = await signAccessToken({
            userId: user.id,
            role: user.role,
            propertyId: property?.id || null,
        });

        // Generate Refresh Token (30 hari)
        const rawRefreshToken = generateRefreshToken();
        const tokenHash = hashToken(rawRefreshToken);
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

        await prisma.refreshToken.create({
            data: {
                tokenHash,
                userId: user.id,
                expiresAt,
            },
        });

        return apiSuccess({
            accessToken,
            refreshToken: rawRefreshToken,
            user: {
                id: user.id,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                forceReset: user.forceReset,
                profile: user.tenantProfile
                    ? {
                          fullName: user.tenantProfile.fullName,
                          ktpNumber: user.tenantProfile.ktpNumber,
                          avatarUrl: user.tenantProfile.avatarUrl,
                          isVerified: user.tenantProfile.isVerified,
                          address: user.tenantProfile.address,
                          emergencyContactName: user.tenantProfile.emergencyContactName,
                          emergencyContactNumber: user.tenantProfile.emergencyContactNumber,
                          emergencyContactRelation: user.tenantProfile.emergencyContactRelation,
                      }
                    : null,
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
                          },
                          property: property
                              ? {
                                    id: property.id,
                                    name: property.name,
                                    slug: property.slug,
                                    address: property.address,
                                    primaryColorHex: property.primaryColorHex,
                                    accentColorHex: property.accentColorHex,
                                    managerPhone: property.managerPhone,
                                    guardPhone: property.guardPhone,
                                    emergencyPhone: property.emergencyPhone,
                                }
                              : null,
                      }
                    : null,
            },
        });
    } catch (error) {
        console.error("[API_AUTH_TOKEN_ERROR]", error);
        return apiError("INTERNAL_ERROR", "Terjadi kesalahan saat memproses login", 500);
    }
}
