import "server-only";
import { v2 as cloudinary } from "cloudinary";

// Konfigurasi Cloudinary dari Environment Variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export interface CloudinarySignatureResult {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

/**
 * Generate cryptographic signature untuk upload langsung dari klien (Web/Mobile)
 * Tanpa menggunakan Unsigned Preset (Mencegah abuse/spam).
 */
export function generateUploadSignature(
  folder: string = "oskost/reports",
  additionalParams: Record<string, string | number> = {}
): CloudinarySignatureResult {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!apiKey || !apiSecret || !cloudName) {
    throw new Error("Kredensial Cloudinary belum dikonfigurasi di server.");
  }

  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp,
    ...additionalParams,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    apiSecret
  );

  return {
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
  };
}

/**
 * Helper untuk upload buffer langsung di server (Multipart backend route)
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string = "oskost/reports",
  tags: string[] = ["oskost"]
): Promise<{
  publicId: string;
  secureUrl: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        tags,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Gagal mengunggah gambar ke Cloudinary"));
        } else {
          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Helper untuk menyusun URL gambar Cloudinary yang responsif & teroptimasi
 */
export function buildCloudinaryUrl(
  publicIdOrUrl: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
  } = {}
): string {
  // Jika sudah berupa URL penuh dan bukan cloudinary public_id
  if (publicIdOrUrl.startsWith("http://") || publicIdOrUrl.startsWith("https://")) {
    return publicIdOrUrl;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return publicIdOrUrl;

  const transformations: string[] = ["f_auto", "q_auto"];
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);

  const transformStr = transformations.join(",");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}/${publicIdOrUrl}`;
}
