import { createClient } from './client';

/**
 * Supabase Storage Helpers
 *
 * Upload, delete, and get URLs for photos stored in Supabase Storage.
 * Photos are stored in the 'project-photos' bucket.
 */

const BUCKET = 'project-photos';

/**
 * Upload a photo to Supabase Storage.
 * Compresses the image client-side before uploading.
 *
 * @param file - The image file to upload
 * @param userId - The user's ID (used in the file path)
 * @param projectId - The user project's ID (used in the file path)
 * @returns The public URL of the uploaded photo, or null on failure
 */
export async function uploadPhoto(
  file: File,
  userId: string,
  projectId: string
): Promise<string | null> {
  const supabase = createClient();

  // Generate a unique filename
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${userId}/${projectId}/${Date.now()}.${ext}`;

  // Compress the image before uploading (max 1200px wide, 80% quality)
  const compressed = await compressImage(file, 1200, 0.8);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, compressed, {
      contentType: compressed.type,
      upsert: false,
    });

  if (error) {
    console.error('Upload failed:', error);
    return null;
  }

  // Get the public URL
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

/**
 * Delete a photo from Supabase Storage.
 */
export async function deletePhoto(photoUrl: string): Promise<boolean> {
  const supabase = createClient();

  // Extract the file path from the public URL
  const parts = photoUrl.split(`${BUCKET}/`);
  if (parts.length < 2) return false;
  const filePath = parts[1];

  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
  return !error;
}

/**
 * Compress an image file using canvas.
 * Resizes to maxWidth while maintaining aspect ratio.
 */
async function compressImage(
  file: File,
  maxWidth: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => resolve(blob || file),
        'image/jpeg',
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}
