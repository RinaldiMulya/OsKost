import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { generateUploadSignature } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    // 1. Validasi Autentikasi (Dukung Bearer Token Mobile & Sesi Web NextAuth)
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

    // 2. Parse request body untuk custom folder jika ada
    let folder = "oskost/reports";
    try {
      const body = await req.json();
      if (body && typeof body.folder === "string" && body.folder.trim()) {
        const requestedFolder = body.folder.trim();
        // Whitelist prefix folder yang diizinkan untuk keamanan
        if (
          requestedFolder.startsWith("oskost/reports") ||
          requestedFolder.startsWith("oskost/rooms") ||
          requestedFolder.startsWith("oskost/avatars") ||
          requestedFolder.startsWith("oskost/property") ||
          requestedFolder.startsWith("oskost/payment-proofs") ||
          requestedFolder.startsWith("oskost/qris")
        ) {
          folder = requestedFolder;
        }
      }
    } catch {
      // Body kosong / non-JSON, gunakan default folder
    }

    // 3. Generate Cryptographic Signature untuk Cloudinary
    const signResult = generateUploadSignature(folder);

    return apiSuccess({
      signature: signResult.signature,
      timestamp: signResult.timestamp,
      apiKey: signResult.apiKey,
      cloudName: signResult.cloudName,
      folder: signResult.folder,
      uploadUrl: `https://api.cloudinary.com/v1_1/${signResult.cloudName}/image/upload`,
    });
  } catch (error) {
    console.error("[CLOUDINARY_SIGN_ERROR]", error);
    return apiError("INTERNAL_ERROR", "Gagal menghasilkan signature upload Cloudinary", 500);
  }
}
