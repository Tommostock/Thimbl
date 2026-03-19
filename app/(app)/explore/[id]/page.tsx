'use client';

import { use, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Share2,
  ExternalLink,
  MessageSquare,
  Plus,
  Trash2,
} from 'lucide-react';

import { getTutorialById } from '@/lib/tutorials';
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

const craftBadgeColour: Record<string, string> = {
  knitting: '#8BA888',
  crochet: '#D4A0A0',
};

export default function TutorialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { checkAchievements } = useAchievements();

  const tutorial = getTutorialById(id);

  // Notes
  const [notes, setNotes] = useState<ProjectNote[]>(() => (tutorial ? getProjectNotes(id) : []));
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);

  // Track recently viewed
  if (tutorial && typeof window !== 'undefined') {
    addRecentlyViewed(id);
  }

  const handleToggleFavorite = useCallback(() => {
    if (!tutorial) return;
    setHeartAnimating(true);
    const meta = {
      id,
      name: tutorial.title,
      imageUrl: tutorial.imageUrl,
      craft: tutorial.category,
      designer: tutorial.sourceName,
      difficulty: 0,
      rating: 0,
      free: true,
    };
    toggleFavorite(id, meta);
    if (!isFavorite(id)) {
      awardXP(XP_REWARDS.ADD_FAVORITE);
    }
    setTimeout(() => setHeartAnimating(false), 400);
  }, [id, tutorial, toggleFavorite, isFavorite]);

  const handleShare = useCallback(async () => {
    if (!tutorial) return;
    try {
      await navigator.share({
        title: tutorial.title,
        text: `Check out this ${tutorial.category} pattern: ${tutorial.title}`,
        url: tutorial.sourceUrl,
      });
    } catch {
      // cancelled
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
  }, [tutorial, checkAchievements]);

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

  if (!tutorial) {
    return (
      <div className="px-4 pt-12 text-center">
        <p style={{ color: 'var(--text-secondary)' }}>Pattern not found.</p>
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

  const bgColour = craftBadgeColour[tutorial.category] ?? '#8BA888';

  return (
    <div className="pb-32">
      {/* Hero image */}
      <div className="relative h-72">
        <Image
          src={tutorial.imageUrl}
          alt={tutorial.title}
          fill
          className="object-cover"
          sizes="100vw"
          unoptimized
          priority
        />

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
              style={{ backgroundColor: bgColour, color: '#fff' }}
            >
              {tutorial.category === 'knitting' ? '🧶' : '🪝'} {tutorial.category}
            </span>
            <span
              className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
            >
              {tutorial.subcategory}
            </span>
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            {tutorial.title}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {tutorial.description}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Source: {tutorial.sourceName}
          </p>
        </div>

        {/* Tags */}
        {tutorial.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {tutorial.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* View full pattern CTA */}
        <a
          href={tutorial.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm mb-5 min-h-[44px]"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
        >
          <ExternalLink size={16} />
          View Full Pattern on {tutorial.sourceName}
        </a>

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

      {/* Sticky bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 z-30"
        style={{ backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-colour)' }}
      >
        <div className="flex gap-2 max-w-lg mx-auto">
          <a
            href={tutorial.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px]"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
          >
            <ExternalLink size={16} />
            View Full Pattern
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
