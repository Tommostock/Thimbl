'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Search, Camera } from 'lucide-react';
import StarRating from '@/components/ui/StarRating';
import { TUTORIALS, type CraftTutorial } from '@/lib/tutorials';
import { generateId } from '@/lib/storage';
import type { JournalEntry } from '@/lib/types/database';

interface JournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: JournalEntry) => void;
  /** Pre-select a tutorial when opening from a pattern page */
  preSelectedTutorialId?: string | null;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 800;
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const MAX_PHOTOS = 6;

export default function JournalEntryModal({
  isOpen,
  onClose,
  onSave,
  preSelectedTutorialId,
}: JournalEntryModalProps) {
  const preSelected = preSelectedTutorialId
    ? TUTORIALS.find((t) => t.id === preSelectedTutorialId) ?? null
    : null;

  const [searchQuery, setSearchQuery] = useState(preSelected?.title ?? '');
  const [selectedTutorial, setSelectedTutorial] = useState<CraftTutorial | null>(preSelected);
  const [showDropdown, setShowDropdown] = useState(false);
  const [rating, setRating] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ project?: boolean; rating?: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTutorials = searchQuery.trim()
    ? TUTORIALS.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6)
    : [];

  const handleSelectTutorial = useCallback((tutorial: CraftTutorial) => {
    setSelectedTutorial(tutorial);
    setSearchQuery(tutorial.title);
    setShowDropdown(false);
    setErrors((prev) => ({ ...prev, project: false }));
  }, []);

  const handlePhotoAdd = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      const newPhotos: string[] = [];
      for (let i = 0; i < files.length; i++) {
        if (photos.length + newPhotos.length >= MAX_PHOTOS) break;
        const compressed = await compressImage(files[i]);
        newPhotos.push(compressed);
      }
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, MAX_PHOTOS));
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [photos.length],
  );

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(() => {
    const newErrors: { project?: boolean; rating?: boolean } = {};
    if (!selectedTutorial) newErrors.project = true;
    if (rating < 1) newErrors.rating = true;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const entry: JournalEntry = {
      id: generateId(),
      projectId: selectedTutorial!.id,
      projectTitle: selectedTutorial!.title,
      rating,
      photos,
      notes,
      createdAt: new Date().toISOString(),
    };

    onSave(entry);
    // Reset form
    setSearchQuery('');
    setSelectedTutorial(null);
    setRating(0);
    setPhotos([]);
    setNotes('');
    setErrors({});
    onClose();
  }, [selectedTutorial, rating, photos, notes, onSave, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
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
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
              >
                Log Your Craft
              </h2>
              <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>

            {/* Pattern Search */}
            <div className="mb-5 relative">
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Pattern
              </label>
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: errors.project ? '2px solid #ef4444' : '1px solid var(--border-colour)',
                }}
              >
                <Search size={16} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                    if (selectedTutorial && e.target.value !== selectedTutorial.title) {
                      setSelectedTutorial(null);
                    }
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search patterns..."
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
              {errors.project && (
                <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
                  Please select a pattern
                </p>
              )}

              {/* Selected tutorial preview */}
              {selectedTutorial && (
                <div
                  className="mt-2 flex items-center gap-3 rounded-lg p-2"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <img
                    src={selectedTutorial.imageUrl}
                    alt={selectedTutorial.title}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {selectedTutorial.title}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {selectedTutorial.category === 'knitting' ? '🧶' : '🪝'} {selectedTutorial.subcategory}
                    </p>
                  </div>
                </div>
              )}

              {/* Dropdown */}
              {showDropdown && filteredTutorials.length > 0 && !selectedTutorial && (
                <div
                  className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden z-10 shadow-lg max-h-60 overflow-y-auto"
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-colour)' }}
                >
                  {filteredTutorials.map((tutorial) => (
                    <button
                      key={tutorial.id}
                      className="w-full text-left px-4 py-3 flex items-center gap-3 hover:opacity-80 transition-opacity"
                      style={{ borderBottom: '1px solid var(--border-colour)' }}
                      onClick={() => handleSelectTutorial(tutorial)}
                    >
                      <img
                        src={tutorial.imageUrl}
                        alt={tutorial.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {tutorial.title}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {tutorial.category === 'knitting' ? '🧶' : '🪝'} {tutorial.subcategory}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Star Rating */}
            <div className="mb-5">
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Rating
              </label>
              <div
                className="p-3 rounded-xl"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: errors.rating ? '2px solid #ef4444' : '1px solid var(--border-colour)',
                }}
              >
                <StarRating
                  rating={rating}
                  onRate={(n) => {
                    setRating(n);
                    setErrors((prev) => ({ ...prev, rating: false }));
                  }}
                  size={28}
                />
              </div>
              {errors.rating && (
                <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
                  Please add a rating
                </p>
              )}
            </div>

            {/* Photos */}
            <div className="mb-5">
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Photos <span style={{ color: 'var(--text-muted)' }}>(up to {MAX_PHOTOS})</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                    <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center bg-black/50"
                      onClick={() => handleRemovePhoto(i)}
                    >
                      <X size={14} color="white" />
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <button
                    className="aspect-square rounded-lg flex flex-col items-center justify-center gap-1"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '2px dashed var(--border-colour)',
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={20} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      Add Photo
                    </span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoAdd}
              />
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Notes <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did the session go? Any changes you made?"
                rows={3}
                className="w-full rounded-xl px-3 py-2.5 text-sm resize-none border-none outline-none"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-colour)',
                }}
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              Save Entry
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
