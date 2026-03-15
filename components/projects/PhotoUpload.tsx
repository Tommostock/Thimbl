'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { savePhoto, generateId } from '@/lib/storage';

/**
 * PhotoUpload Component
 *
 * Lets users add photos to their project.
 * Compresses images and stores them as base64 data URLs in localStorage.
 * No backend required.
 */

interface PhotoUploadProps {
  userProjectId: string;
  onPhotoUploaded: (photoId: string) => void;
}

export default function PhotoUpload({ userProjectId, onPhotoUploaded }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Compress and convert to data URL
      const dataUrl = await compressToDataUrl(file, 800, 0.75);
      const photoId = generateId();

      savePhoto({
        id: photoId,
        user_project_id: userProjectId,
        photo_url: dataUrl,
        caption: '',
        uploaded_at: new Date().toISOString(),
      });

      onPhotoUploaded(photoId);
    } catch (err) {
      console.error('Photo processing failed:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border-2 border-dashed transition-colors min-h-[44px]"
        style={{
          borderColor: 'var(--border-colour)',
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        {uploading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Camera size={18} />
            Add Photo
          </>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

/**
 * Compress an image file and return it as a base64 data URL.
 */
async function compressToDataUrl(file: File, maxWidth: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
