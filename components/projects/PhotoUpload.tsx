'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { uploadPhoto } from '@/lib/supabase/storage';
import { createClient } from '@/lib/supabase/client';

/**
 * PhotoUpload Component
 *
 * Lets users upload photos to their project.
 * Compresses images client-side before uploading to Supabase Storage.
 */

interface PhotoUploadProps {
  userProjectId: string;
  userId: string;
  onPhotoUploaded: (url: string) => void;
}

export default function PhotoUpload({ userProjectId, userId, onPhotoUploaded }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const url = await uploadPhoto(file, userId, userProjectId);
      if (url) {
        // Save to user_photos table
        const supabase = createClient();
        await supabase.from('user_photos').insert({
          user_id: userId,
          user_project_id: userProjectId,
          photo_url: url,
          caption: '',
        });

        onPhotoUploaded(url);
      }
    } catch (err) {
      console.error('Photo upload failed:', err);
    } finally {
      setUploading(false);
      setPreview(null);
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      {/* Upload button */}
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
            Uploading...
          </>
        ) : (
          <>
            <Camera size={18} />
            Add Photo
          </>
        )}
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload preview */}
      {preview && (
        <div className="mt-3 relative inline-block">
          <img
            src={preview}
            alt="Upload preview"
            className="w-20 h-20 object-cover rounded-xl opacity-50"
          />
          <button
            onClick={() => setPreview(null)}
            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
