'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Search } from 'lucide-react';
import StarRating from '@/components/ui/StarRating';
import { PROJECTS } from '@/lib/data';
import { generateId } from '@/lib/storage';
import type { JournalEntry } from '@/lib/types/database';
import type { Project } from '@/lib/types/database';

interface JournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: JournalEntry) => void;
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

export default function JournalEntryModal({ isOpen, onClose, onSave }: JournalEntryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [rating, setRating] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ project?: boolean; rating?: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProjects = searchQuery.trim()
    ? PROJECTS.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const handleSelectProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setSearchQuery(project.title);
    setShowDropdown(false);
    setErrors((prev) => ({ ...prev, project: false }));
  }, []);

  const handlePhotoAdd = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos: string[] = [];
    for (let i = 0; i < files.length; i++) {
      if (photos.length + newPhotos.length >= 6) break;
      const compressed = await compressImage(files[i]);
      newPhotos.push(compressed);
    }
    setPhotos((prev) => [...prev, ...newPhotos].slice(0, 6));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [photos.length]);

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(() => {
    const newErrors: { project?: boolean; rating?: boolean } = {};
    if (!selectedProject) newErrors.project = true;
    if (rating < 1) newErrors.rating = true;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const entry: JournalEntry = {
      id: generateId(),
      projectId: selectedProject!.id,
      projectTitle: selectedProject!.title,
      rating,
      photos,
      notes,
      createdAt: new Date().toISOString(),
    };

    onSave(entry);
    // Reset form
    setSearchQuery('');
    setSelectedProject(null);
    setRating(0);
    setPhotos([]);
    setNotes('');
    setErrors({});
    onClose();
  }, [selectedProject, rating, photos, notes, onSave, onClose]);

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
                Log Craft Session
              </h2>
              <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>

            {/* Project Search */}
            <div className="mb-5 relative">
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Project
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
                    if (selectedProject && e.target.value !== selectedProject.title) {
                      setSelectedProject(null);
                    }
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search projects..."
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
              {errors.project && (
                <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
                  Please select a project
                </p>
              )}
              {/* Dropdown */}
              {showDropdown && filteredProjects.length > 0 && (
                <div
                  className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden z-10 shadow-lg"
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-colour)' }}
                >
                  {filteredProjects.map((project) => (
                    <button
                      key={project.id}
                      className="w-full text-left px-4 py-3 text-sm hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--text-primary)' }}
                      onClick={() => handleSelectProject(project)}
                    >
                      {project.title}
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
                <StarRating rating={rating} onRate={(n) => { setRating(n); setErrors((prev) => ({ ...prev, rating: false })); }} size={28} />
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
                Photos (optional)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-lg overflow-hidden"
                  >
                    <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center bg-black/50"
                      onClick={() => handleRemovePhoto(i)}
                    >
                      <X size={14} color="white" />
                    </button>
                  </div>
                ))}
                {photos.length < 6 && (
                  <button
                    className="aspect-square rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '2px dashed var(--border-colour)',
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus size={24} style={{ color: 'var(--text-muted)' }} />
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
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did the session go?"
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
