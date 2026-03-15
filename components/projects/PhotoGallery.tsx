'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { deletePhoto } from '@/lib/supabase/storage';
import { createClient } from '@/lib/supabase/client';

/**
 * PhotoGallery Component
 *
 * Displays a grid of project photos with a lightbox viewer.
 * Users can tap to enlarge and delete their photos.
 */

interface Photo {
  id: string;
  photo_url: string;
  caption?: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onPhotoDeleted: (photoId: string) => void;
}

export default function PhotoGallery({ photos, onPhotoDeleted }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (photos.length === 0) return null;

  const handleDelete = async () => {
    if (selectedIndex === null || deleting) return;
    const photo = photos[selectedIndex];

    setDeleting(true);
    try {
      // Delete from storage
      await deletePhoto(photo.photo_url);

      // Delete from database
      const supabase = createClient();
      await supabase.from('user_photos').delete().eq('id', photo.id);

      onPhotoDeleted(photo.id);
      setSelectedIndex(null);
    } catch (err) {
      console.error('Failed to delete photo:', err);
    } finally {
      setDeleting(false);
    }
  };

  const goNext = () => {
    if (selectedIndex !== null && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const goPrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  return (
    <>
      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <motion.button
            key={photo.id}
            onClick={() => setSelectedIndex(index)}
            className="aspect-square rounded-xl overflow-hidden"
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={photo.photo_url}
              alt={photo.caption || `Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </motion.button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center min-h-[44px] min-w-[44px]"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <X size={20} className="text-white" />
            </button>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={deleting}
              className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center min-h-[44px] min-w-[44px]"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <Trash2 size={18} className="text-white" />
            </button>

            {/* Navigation */}
            {selectedIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-2 w-10 h-10 rounded-full flex items-center justify-center min-h-[44px] min-w-[44px]"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
            )}
            {selectedIndex < photos.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-2 w-10 h-10 rounded-full flex items-center justify-center min-h-[44px] min-w-[44px]"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <ChevronRight size={24} className="text-white" />
              </button>
            )}

            {/* Image */}
            <motion.img
              key={selectedIndex}
              src={photos[selectedIndex].photo_url}
              alt={photos[selectedIndex].caption || 'Photo'}
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Counter */}
            <div className="absolute bottom-6 text-white text-sm">
              {selectedIndex + 1} / {photos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
