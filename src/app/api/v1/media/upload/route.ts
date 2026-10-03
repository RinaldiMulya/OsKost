import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    // 1. Validasi Autentikasi (Bearer Token Mobile & Sesi Web NextAuth)
    let userId: string | null = null;

    const authUser = await getAuthenticatedUser(req);
    if (authUser) {
      userId = authUser.id;
    } else {
      const session = await auth();
      if (session?.user?.id) {
        userId = session.user.id;
      }
    }

    if (!userId) {
      return apiError("UNAUTHORIZED", "Sesi login tidak valid atau kadaluarsa", 401);
    }

    // 2. Parse Multipart Form Data
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return apiError("VALIDATION_ERROR", "Berkas gambar tidak ditemukan", 400);
    }

    // 3. Validasi Tipe & Ukuran File
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return apiError(
        "INVALID_FILE_TYPE",
        "Format file tidak didukung. Harap unggah JPEG, PNG, atau WebP.",
        400
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError(
        "FILE_TOO_LARGE",
        "Ukuran file melebihi batas maksimal 5 MB.",
        400
      );
    }

    // 4. Tentukan folder target
    let folder = "oskost/reports";
    const requestedFolder = formData.get("folder");
    if (typeof requestedFolder === "string" && requestedFolder.trim()) {
      const trimmed = requestedFolder.trim();
      if (
        trimmed.startsWith("oskost/reports") ||
        trimmed.startsWith("oskost/rooms") ||
        trimmed.startsWith("oskost/avatars") ||
        trimmed.startsWith("oskost/property")
      ) {
        folder = trimmed;
      }
    }

    // 5. Convert Blob ke Node.js Buffer dan upload ke Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadBufferToCloudinary(buffer, folder, ["oskost", "user-upload"]);

    return apiSuccess({
      publicId: result.publicId,
      secureUrl: result.secureUrl,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error("[MEDIA_UPLOAD_ERROR]", error);
    return apiError("INTERNAL_ERROR", "Gagal memproses upload media", 500);
  }
}
