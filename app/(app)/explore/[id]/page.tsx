'use client';

import { use, useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Share2,
  MessageSquare,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

import { getTutorialById } from '@/lib/tutorials';
import { usePatternContent } from '@/hooks/usePatternContent';
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

import PatternImageCarousel from '@/components/pattern/PatternImageCarousel';
import PatternSkeleton from '@/components/pattern/PatternSkeleton';
import MaterialsList from '@/components/pattern/MaterialsList';
import PatternInstructions from '@/components/pattern/PatternInstructions';
import type { ProjectNote } from '@/lib/types/database';

const craftBadgeColour: Record<string, string> = {
  knitting: '#8BA888',
  crochet: '#D4A0A0',
};

const TABS = ['Overview', 'Instructions', 'Notes'] as const;
type Tab = (typeof TABS)[number];

export default function TutorialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { checkAchievements } = useAchievements();

  const tutorial = getTutorialById(id);
  const { content, loading, error, retry } = usePatternContent(id);

  // Notes
  const [notes, setNotes] = useState<ProjectNote[]>(() => (tutorial ? getProjectNotes(id) : []));
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const overviewRef = useRef<HTMLDivElement>(null);
  const instructionsRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);

  // When a tab is tapped, lock the active tab for a moment so the scroll
  // handler doesn't immediately override it before the smooth-scroll finishes.
  const scrollLockRef = useRef(false);

  const scrollToSection = useCallback((tab: Tab) => {
    setActiveTab(tab);
    scrollLockRef.current = true;
    const ref = tab === 'Overview' ? overviewRef : tab === 'Instructions' ? instructionsRef : notesRef;
    if (ref.current && tabBarRef.current) {
      const tabBarHeight = tabBarRef.current.offsetHeight;
      const top = ref.current.getBoundingClientRect().top + window.scrollY - tabBarHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    // Unlock after the smooth scroll settles
    setTimeout(() => { scrollLockRef.current = false; }, 800);
  }, []);

  // Update active tab on scroll (skipped while a tap-scroll is in progress)
  useEffect(() => {
    const handleScroll = () => {
      if (scrollLockRef.current || !tabBarRef.current) return;
      const offset = tabBarRef.current.offsetHeight + 16;
      const scrollY = window.scrollY + offset;

      // Check if user has scrolled near the bottom of the page — if so, activate Notes
      const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 100;
      if (nearBottom && notesRef.current) {
        setActiveTab('Notes');
      } else if (notesRef.current && scrollY >= notesRef.current.offsetTop - 8) {
        setActiveTab('Notes');
      } else if (instructionsRef.current && scrollY >= instructionsRef.current.offsetTop - 8) {
        setActiveTab('Instructions');
      } else {
        setActiveTab('Overview');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        url: window.location.href,
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
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-4 py-2 rounded-xl text-sm"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  const bgColour = craftBadgeColour[tutorial.category] ?? '#8BA888';

  return (
    <div className="pb-24">
      {/* Hero image carousel */}
      <div className="relative">
        <PatternImageCarousel
          images={(content?.images ?? []).slice(0, 5)}
          fallbackImage={tutorial.imageUrl}
          title={tutorial.title}
        />

        {/* Action bar overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
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

      {/* Sticky tab bar */}
      <div
        ref={tabBarRef}
        className="sticky top-0 z-30 border-b"
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-colour)' }}
      >
        <div className="flex px-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => scrollToSection(tab)}
              className="flex-1 py-3 text-sm font-medium text-center relative"
              style={{
                color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        {/* ── OVERVIEW SECTION ── */}
        <div ref={overviewRef} className="pt-4">
          {/* Title */}
          <div className="mb-4">
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
              <a
                href={tutorial.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-1 underline-offset-2"
                style={{ color: 'var(--accent-primary)' }}
              >
                Pattern
              </a>
              {' '}by {tutorial.sourceName}
            </p>
          </div>

          {/* Sizes */}
          {content && content.sizes.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>
                Available Sizes
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {content.sizes.map((size) => (
                  <span
                    key={size}
                    className="text-xs font-medium px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-colour)',
                    }}
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Loading / Error */}
          {loading && <PatternSkeleton />}

          {error && !loading && (
            <div
              className="rounded-xl p-4 mb-5 flex items-center gap-3"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <AlertCircle size={20} style={{ color: '#e74c3c' }} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Couldn&apos;t load full pattern
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {error}
                </p>
              </div>
              <button
                onClick={retry}
                className="shrink-0 flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg min-h-[36px]"
                style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          )}

          {/* Materials */}
          {content && !loading && (
            <MaterialsList
              materials={content.materials}
              needles={content.needles}
              gauge={content.gauge}
            />
          )}
        </div>

        {/* ── INSTRUCTIONS SECTION ── */}
        <div ref={instructionsRef} className="pt-5">
          {content && !loading && (
            <PatternInstructions sections={content.sections} patternId={id} />
          )}
        </div>

        {/* ── NOTES SECTION ── */}
        <div ref={notesRef} className="pt-5">
          {/* Log Your Craft button */}
          <div className="mb-5">
            <button
              onClick={() => router.push(`/journal?tutorialId=${id}`)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <BookOpen size={18} />
              Log Your Craft
            </button>
          </div>

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
        </div>
      </div>
    </div>
  );
}
