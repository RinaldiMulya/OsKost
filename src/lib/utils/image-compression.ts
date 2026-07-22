import imageCompression from "browser-image-compression";

export interface CompressionOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    initialQuality?: number;
    useWebWorker?: boolean;
    fileType?: string;
}

const defaultOptions: CompressionOptions = {
    maxSizeMB: 0.5, // 500KB default
    maxWidthOrHeight: 1920, // Full HD default limit
    initialQuality: 0.8, // 80% quality
    useWebWorker: true,
    fileType: "image/webp", // Force WebP by default, unless overridden (e.g., for 360 images)
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
        
        // Rename file extension to match the output type
        if (compressionOptions.fileType) {
            const extension = compressionOptions.fileType.split("/")[1];
            if (extension && !compressedFile.name.endsWith(`.${extension}`)) {
                const newName = compressedFile.name.replace(/\.[^/.]+$/, "") + `.${extension}`;
                return new File([compressedFile], newName, { type: compressedFile.type });
            }
        }
        
        return compressedFile;
    } catch (error) {
        console.error("Error compressing image:", error);
        throw error;
    }
}
