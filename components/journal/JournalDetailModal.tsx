'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import StarRating from '@/components/ui/StarRating';
import type { JournalEntry } from '@/lib/types/database';

interface JournalDetailModalProps {
  entry: JournalEntry | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function JournalDetailModal({ entry, onClose, onDelete }: JournalDetailModalProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!entry) return null;

  const hasPhotos = entry.photos.length > 0;

  const handleDelete = () => {
    onDelete(entry.id);
    setShowConfirm(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <motion.div
          className="relative rounded-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto p-6"
          style={{ backgroundColor: 'var(--bg-primary)' }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              {entry.projectTitle}
            </h2>
            <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
              <X size={24} />
            </button>
          </div>

          {/* Date */}
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            {formatDate(entry.createdAt)}
          </p>

          {/* Rating */}
          <div className="mb-4">
            <StarRating rating={entry.rating} readonly size={22} />
          </div>

          {/* Photo Gallery */}
          {hasPhotos && (
            <div className="mb-4">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
                <img
                  src={entry.photos[photoIndex]}
                  alt={`Photo ${photoIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {entry.photos.length > 1 && (
                  <>
                    <button
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center"
                      onClick={() => setPhotoIndex((i) => (i - 1 + entry.photos.length) % entry.photos.length)}
                    >
                      <ChevronLeft size={18} color="white" />
                    </button>
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center"
                      onClick={() => setPhotoIndex((i) => (i + 1) % entry.photos.length)}
                    >
                      <ChevronRight size={18} color="white" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full bg-black/40 text-white text-xs">
                      {photoIndex + 1}/{entry.photos.length}
                    </div>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              {entry.photos.length > 1 && (
                <div className="flex gap-2 mt-2">
                  {entry.photos.map((photo, i) => (
                    <button
                      key={i}
                      className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                      style={{
                        border: i === photoIndex ? '2px solid var(--accent-primary)' : '2px solid transparent',
                        opacity: i === photoIndex ? 1 : 0.6,
                      }}
                      onClick={() => setPhotoIndex(i)}
                    >
                      <img src={photo} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {entry.notes && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Notes
              </h3>
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                {entry.notes}
              </p>
            </div>
          )}

          {/* Delete */}
          {!showConfirm ? (
            <button
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium"
              style={{ color: '#ef4444' }}
              onClick={() => setShowConfirm(true)}
            >
              <Trash2 size={16} />
              Delete Entry
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 rounded-xl text-sm font-medium text-white"
                style={{ backgroundColor: '#ef4444' }}
                onClick={handleDelete}
              >
                Confirm Delete
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
