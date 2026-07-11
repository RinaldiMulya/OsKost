import { createClient } from "./client";

/**
 * Uploads a file directly to Supabase Storage from the browser.
 *
 * @param file The file object from input or dropzone
 * @param bucket The Supabase Storage bucket name (e.g., 'Oskost-Data-Public')
 * @param folderPath The folder path within the bucket (e.g., 'panoramas/userId')
 * @returns The public URL of the uploaded image and the storage path
 */
export async function uploadImageToSupabase(
  file: File,
  bucket: string,
  folderPath: string,
): Promise<{ imageUrl: string; storagePath: string }> {
  const supabase = createClient();

  const id = crypto.randomUUID();

  function generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Generate a unique file name to avoid collisions
  const fileExt = file.name.split(".").pop();
  const fileName = `${generateUUID()}.${fileExt}`;
  const filePath = `${folderPath}/${fileName}`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  console.log("Uploading to Supabase:", {
    url: supabaseUrl,
    bucket,
    filePath,
    fileSize: file.size,
  });

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Supabase storage error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get the public URL. Note: For private buckets, getPublicUrl will return a URL
  // but it won't be accessible without token. If Oskost-Data-Private is used and needs signed URLs,
  // that logic would be different. For now we just return public URL which works for public buckets
  // or if the private bucket has specific policies for the app.
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    imageUrl: publicUrl,
    storagePath: data.path, // This is needed if we want to delete it later
  };
}

/**
 * Deletes a file from Supabase Storage.
 *
 * @param storagePath The specific path of the file in the bucket
 * @param bucket The Supabase Storage bucket name
 */
export async function deleteImageFromSupabase(
  storagePath: string,
  bucket: string,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).remove([storagePath]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}
