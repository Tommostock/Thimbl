'use client';

import { use, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquare,
  Plus,
  Trash2,
  Lightbulb,
} from 'lucide-react';

import { usePatternDetail } from '@/hooks/useRavelry';
import { getDifficultyLabel, getCraftEmoji, getPatternImageUrl } from '@/lib/ravelry';
import { useFavorites } from '@/hooks/useFavorites';
import {
  getProjectNotes,
  saveProjectNote,
  deleteProjectNote,
  addRecentlyViewed,
  generateId,
  getStorage,
  setStorage,
} from '@/lib/storage';
import { awardXP } from '@/lib/xp';
import { XP_REWARDS } from '@/lib/constants';
import { useAchievements } from '@/hooks/useAchievements';
import Timer from '@/components/project/Timer';
import type { ProjectNote } from '@/lib/types/database';

export default function PatternDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const patternId = parseInt(id, 10);
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { checkAchievements } = useAchievements();

  const { pattern, loading, error } = usePatternDetail(isNaN(patternId) ? null : patternId);

  // Photo gallery state
  const [photoIndex, setPhotoIndex] = useState(0);

  // Notes state
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [notesLoaded, setNotesLoaded] = useState(false);

  // Heart animation
  const [heartAnimating, setHeartAnimating] = useState(false);

  // Load notes when pattern loads
  if (pattern && !notesLoaded) {
    setNotes(getProjectNotes(id));
    addRecentlyViewed(id);
    setNotesLoaded(true);
  }

  const handleToggleFavorite = useCallback(() => {
    if (!pattern) return;
    setHeartAnimating(true);
    const meta = {
      id,
      name: pattern.name,
      imageUrl: getPatternImageUrl(pattern, 'small'),
      craft: pattern.craft?.name ?? '',
      designer: pattern.designer?.name ?? '',
      difficulty: pattern.difficulty_average,
      rating: pattern.rating_average,
      free: pattern.free,
    };
    toggleFavorite(id, meta);
    if (!isFavorite(id)) {
      awardXP(XP_REWARDS.ADD_FAVORITE);
    }
    setTimeout(() => setHeartAnimating(false), 400);
  }, [id, pattern, toggleFavorite, isFavorite]);

  const handleShare = useCallback(async () => {
    if (!pattern) return;
    try {
      await navigator.share({
        title: pattern.name,
        text: `Check out this ${pattern.craft?.name} pattern: ${pattern.name}`,
        url: pattern.url || `https://www.ravelry.com/patterns/library/${pattern.permalink}`,
      });
    } catch {
      // User cancelled or not supported
    }
    const storage = getStorage();
    setStorage({
      userStats: {
        ...storage.userStats,
        projects_shared: (storage.userStats.projects_shared ?? 0) + 1,
      },
    });
    awardXP(XP_REWARDS.SHARE_PROJECT);
    checkAchievements();
  }, [pattern, checkAchievements]);

  const handleAddNote = useCallback(() => {
    if (!noteText.trim()) return;
    const note: ProjectNote = {
      id: generateId(),
      projectId: id,
      text: noteText.trim(),
      createdAt: new Date().toISOString(),
    };
    saveProjectNote(note);
    setNotes((prev) => [note, ...prev]);
    setNoteText('');
    setShowNoteInput(false);
  }, [id, noteText]);

  const handleDeleteNote = useCallback((noteId: string) => {
    deleteProjectNote(noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    );
  }

  // Error / not found
  if (error || !pattern) {
    return (
      <div className="px-4 pt-12 text-center">
        <p style={{ color: 'var(--text-secondary)' }}>{error || 'Pattern not found.'}</p>
        <button
          onClick={() => router.push('/search')}
          className="mt-4 px-4 py-2 rounded-xl text-sm"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
        >
          Back to Search
        </button>
      </div>
    );
  }

  const photos = pattern.photos ?? [];
  const craftEmoji = getCraftEmoji(pattern.craft?.name ?? '');
  const diffLabel = getDifficultyLabel(pattern.difficulty_average);
  const ravelryUrl = pattern.url || `https://www.ravelry.com/patterns/library/${pattern.permalink}`;

  return (
    <div className="pb-32">
      {/* Photo gallery */}
      <div className="relative h-72 bg-gray-100 dark:bg-gray-800">
        {photos.length > 0 ? (
          <>
            <Image
              src={photos[photoIndex]?.medium2_url || photos[photoIndex]?.medium_url}
              alt={pattern.name}
              fill
              className="object-cover"
              sizes="100vw"
              unoptimized
            />
            {/* Photo nav arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setPhotoIndex((i) => (i > 0 ? i - 1 : photos.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setPhotoIndex((i) => (i < photos.length - 1 ? i + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}
                >
                  <ChevronRight size={18} />
                </button>
                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.slice(0, 8).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIndex(i)}
                      className="w-2 h-2 rounded-full transition-colors"
                      style={{
                        backgroundColor: i === photoIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            {craftEmoji}
          </div>
        )}

        {/* Action bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center min-h-[44px] min-w-[44px]"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full flex items-center justify-center min-h-[44px] min-w-[44px]"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}
              aria-label="Share pattern"
            >
              <Share2 size={18} />
            </button>
            <motion.button
              onClick={handleToggleFavorite}
              className="w-10 h-10 rounded-full flex items-center justify-center min-h-[44px] min-w-[44px]"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              animate={heartAnimating ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
              aria-label={isFavorite(id) ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                size={18}
                fill={isFavorite(id) ? '#e74c3c' : 'none'}
                stroke={isFavorite(id) ? '#e74c3c' : '#fff'}
              />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="px-4">
        {/* Title section */}
        <div className="mt-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
            >
              {craftEmoji} {pattern.craft?.name}
            </span>
            {pattern.free && (
              <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-500 text-white">
                FREE
              </span>
            )}
          </div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            {pattern.name}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            by {pattern.designer?.name}
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div
            className="flex flex-col items-center gap-1 p-3 rounded-xl"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <span className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>
              {diffLabel}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Difficulty
            </span>
          </div>
          <div
            className="flex flex-col items-center gap-1 p-3 rounded-xl"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <div className="flex items-center gap-1">
              <Star size={16} fill="#F59E0B" stroke="#F59E0B" />
              <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {pattern.rating_average > 0 ? pattern.rating_average.toFixed(1) : '—'}
              </span>
            </div>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Rating
            </span>
          </div>
          <div
            className="flex flex-col items-center gap-1 p-3 rounded-xl"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              <Heart size={16} className="inline" /> {pattern.favorites_count > 999 ? `${(pattern.favorites_count / 1000).toFixed(1)}k` : pattern.favorites_count}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Favorites
            </span>
          </div>
        </div>

        {/* Pattern details */}
        <div className="space-y-3 mb-5">
          {pattern.yarn_weight_description && (
            <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-colour)' }}>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Yarn Weight</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{pattern.yarn_weight_description}</span>
            </div>
          )}
          {pattern.yardage_description && (
            <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-colour)' }}>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Yardage</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{pattern.yardage_description}</span>
            </div>
          )}
          {pattern.gauge_description && (
            <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-colour)' }}>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Gauge</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{pattern.gauge_description}</span>
            </div>
          )}
          {pattern.sizes_available && (
            <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-colour)' }}>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Sizes</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{pattern.sizes_available}</span>
            </div>
          )}
          {pattern.packs && pattern.packs.length > 0 && (
            <div className="py-2" style={{ borderBottom: '1px solid var(--border-colour)' }}>
              <span className="text-sm block mb-1" style={{ color: 'var(--text-muted)' }}>Yarn</span>
              {pattern.packs.map((pack, i) => (
                <p key={i} className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {pack.yarn_name} {pack.quantity_description && `(${pack.quantity_description})`}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Description / notes */}
        {pattern.notes_html && (
          <div className="mb-5">
            <h2
              className="text-lg font-bold mb-2 flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              <Lightbulb size={18} style={{ color: 'var(--accent-primary)' }} />
              About This Pattern
            </h2>
            <div
              className="text-sm leading-relaxed prose prose-sm max-w-none"
              style={{ color: 'var(--text-secondary)' }}
              dangerouslySetInnerHTML={{ __html: pattern.notes_html }}
            />
          </div>
        )}

        {/* Personal notes */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-lg font-bold flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              <MessageSquare size={18} style={{ color: 'var(--accent-secondary)' }} />
              My Notes
            </h2>
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="flex items-center gap-1 text-sm font-medium min-h-[44px] px-2"
              style={{ color: 'var(--accent-primary)' }}
            >
              <Plus size={16} />
              Add Note
            </button>
          </div>

          <AnimatePresence>
            {showNoteInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-3"
              >
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Write a note..."
                  className="w-full p-3 rounded-xl text-sm resize-none border-none outline-none"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', minHeight: 80 }}
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddNote}
                    disabled={!noteText.trim()}
                    className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 min-h-[36px]"
                    style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
                  >
                    Save Note
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {notes.length === 0 && !showNoteInput && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notes yet.</p>
          )}
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 rounded-xl mb-2 flex items-start justify-between gap-2"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{note.text}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {new Date(note.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Delete note"
              >
                <Trash2 size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          ))}
        </div>

        {/* Timer */}
        <div className="mb-5">
          <Timer />
        </div>
      </div>

      {/* Sticky bottom: View on Ravelry */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 z-30"
        style={{ backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-colour)' }}
      >
        <div className="flex gap-2 max-w-lg mx-auto">
          <a
            href={ravelryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px]"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
          >
            <ExternalLink size={16} />
            View Full Pattern on Ravelry
          </a>
          <button
            onClick={handleShare}
            className="py-3 px-4 rounded-xl min-h-[44px] flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-colour)' }}
            aria-label="Share"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
