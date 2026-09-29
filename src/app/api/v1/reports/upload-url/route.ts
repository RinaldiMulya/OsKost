import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/api-auth";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(req);
        if (!authUser) {
            return apiError("UNAUTHORIZED", "Sesi login tidak valid", 401);
        }

        const contentType = req.headers.get("content-type") || "";

        // Mode 1: Direct Multipart Form-Data upload dari Flutter Mobile
        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const file = formData.get("file") as File | null;

            if (!file) {
                return apiError("VALIDATION_ERROR", "File gambar wajib diunggah", 400);
            }

            // Validasi ukuran maksimal 5MB
            if (file.size > 5 * 1024 * 1024) {
                return apiError("FILE_TOO_LARGE", "Ukuran gambar maksimal 5MB", 400);
            }

            const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
            const uniqueName = `${crypto.randomUUID()}.${ext}`;
            const storagePath = `reports/${authUser.id}/${uniqueName}`;
            const buffer = Buffer.from(await file.arrayBuffer());

            const { error: uploadError } = await supabase.storage
                .from("Oskost-Data-Public")
                .upload(storagePath, buffer, {
                    contentType: file.type || "image/jpeg",
                    upsert: false,
                });

            if (uploadError) {
                console.error("[SUPABASE_STORAGE_ERROR]", uploadError);
                return apiError("UPLOAD_FAILED", `Gagal mengunggah foto: ${uploadError.message}`, 500);
            }

            const {
                data: { publicUrl },
            } = supabase.storage.from("Oskost-Data-Public").getPublicUrl(storagePath);

            return apiSuccess({
                url: publicUrl,
                path: storagePath,
            });
        }

        // Mode 2: Presigned Upload URL untuk direct upload dari client
        const body = await req.json().catch(() => ({}));
        const fileName = body.fileName || `photo_${Date.now()}.jpg`;
        const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
        const uniqueName = `${crypto.randomUUID()}.${ext}`;
        const storagePath = `reports/${authUser.id}/${uniqueName}`;

        const { data: signedData, error: signedError } = await supabase.storage
            .from("Oskost-Data-Public")
            .createSignedUploadUrl(storagePath);

        if (signedError || !signedData) {
            console.error("[SUPABASE_SIGNED_URL_ERROR]", signedError);
            return apiError("UPLOAD_URL_ERROR", "Gagal membuat URL upload", 500);
        }

        const {
            data: { publicUrl },
        } = supabase.storage.from("Oskost-Data-Public").getPublicUrl(storagePath);

        return apiSuccess({
            uploadUrl: signedData.signedUrl,
            token: signedData.token,
            path: storagePath,
            publicUrl,
        });
    } catch (error) {
        console.error("[API_REPORTS_UPLOAD_URL_ERROR]", error);
        return apiError("INTERNAL_ERROR", "Gagal memproses unggah foto", 500);
    }
}
