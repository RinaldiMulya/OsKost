import imageCompression from "browser-image-compression";

export interface CompressionOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    initialQuality?: number;
    useWebWorker?: boolean;
}

const defaultOptions: CompressionOptions = {
    maxSizeMB: 1, // 1MB default
    maxWidthOrHeight: 1920, // Full HD default limit
    initialQuality: 0.8, // 80% quality
    useWebWorker: true,
};

/**
 * Compresses an image file directly in the browser.
 * 
 * @param file The original image file
 * @param options Custom compression options (overrides defaults)
 * @returns The compressed image file
 */
export async function compressImage(
    file: File,
    options?: CompressionOptions
): Promise<File> {
    const compressionOptions = {
        ...defaultOptions,
        ...options,
    };

    try {
        const compressedFile = await imageCompression(file, compressionOptions);
        return compressedFile;
    } catch (error) {
        console.error("Error compressing image:", error);
        throw error;
    }
}
