'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Camera } from 'lucide-react';
import { useJournal } from '@/hooks/useJournal';
import { getTutorialById } from '@/lib/tutorials';
import { awardXP } from '@/lib/xp';
import { XP_REWARDS } from '@/lib/constants';
import { useAchievements } from '@/hooks/useAchievements';
import { useXPToast } from '@/components/ui/XPToast';
import JournalEntryModal from '@/components/journal/JournalEntryModal';
import JournalDetailModal from '@/components/journal/JournalDetailModal';
import StarRating from '@/components/ui/StarRating';
import type { JournalEntry } from '@/lib/types/database';

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function JournalPage() {
  return (
    <Suspense>
      <JournalPageInner />
    </Suspense>
  );
}

function JournalPageInner() {
  const { entries, addEntry, removeEntry, stats } = useJournal();
  const { checkAchievements } = useAchievements();
  const { showXP } = useXPToast();
  const searchParams = useSearchParams();
  const preSelectedId = searchParams.get('tutorialId');

  const [showEntryModal, setShowEntryModal] = useState(!!preSelectedId);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const handleSave = (entry: JournalEntry) => {
    addEntry(entry);
    let totalXP = XP_REWARDS.ADD_JOURNAL_ENTRY;
    awardXP(XP_REWARDS.ADD_JOURNAL_ENTRY);
    if (entry.photos.length > 0) { awardXP(XP_REWARDS.UPLOAD_PHOTO); totalXP += XP_REWARDS.UPLOAD_PHOTO; }
    if (entry.rating > 0) { awardXP(XP_REWARDS.RATE_PROJECT); totalXP += XP_REWARDS.RATE_PROJECT; }
    showXP(totalXP);
    checkAchievements();
  };

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Header */}
      <h1
        className="text-2xl font-bold mb-4"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
      >
        Craft Journal
      </h1>

      {/* Stats Bar */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {stats.totalSessions}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Total Sessions
            </div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {stats.uniqueProjects}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Unique Patterns
            </div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {stats.avgRating} ⭐
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Avg Rating
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-24 text-center">
          <BookOpen size={48} style={{ color: 'var(--text-muted)' }} />
          <h2
            className="text-lg font-semibold mt-4"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
          >
            Start your craft journal
          </h2>
          <p className="text-sm mt-2 max-w-xs" style={{ color: 'var(--text-muted)' }}>
            Log your crafting sessions with photos, ratings and notes
          </p>
          <button
            className="mt-6 px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--accent-primary)' }}
            onClick={() => setShowEntryModal(true)}
          >
            Log Your First Craft
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {entries.map((entry, index) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              index={index}
              onClick={() => setSelectedEntry(entry)}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      {entries.length > 0 && (
        <motion.button
          className="fixed bottom-[90px] right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-40"
          style={{ backgroundColor: 'var(--accent-primary)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowEntryModal(true)}
        >
          <Plus size={24} color="white" />
        </motion.button>
      )}

      {/* Modals */}
      <JournalEntryModal
        isOpen={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onSave={handleSave}
        preSelectedTutorialId={preSelectedId}
      />
      <JournalDetailModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onDelete={(id) => {
          removeEntry(id);
          setSelectedEntry(null);
        }}
      />
    </div>
  );
}

function JournalCard({
  entry,
  index,
  onClick,
}: {
  entry: JournalEntry;
  index: number;
  onClick: () => void;
}) {
  const hasPhoto = entry.photos.length > 0;
  const tutorial = getTutorialById(entry.projectId);
  // Use the first user photo, or fall back to the tutorial image
  const displayImage = hasPhoto ? entry.photos[0] : tutorial?.imageUrl;
  const photoCount = entry.photos.length;

  return (
    <motion.button
      className="rounded-xl overflow-hidden text-left w-full"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] w-full">
        {displayImage ? (
          <img
            src={displayImage}
            alt={entry.projectTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ backgroundColor: 'var(--accent-primary)', opacity: 0.15 }}
          >
            🧵
          </div>
        )}
        {/* Gradient overlay */}
        <div
          className="absolute inset-x-0 bottom-0 h-16"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
          }}
        />
        <p className="absolute bottom-2 left-2 right-2 text-xs font-semibold text-white truncate">
          {entry.projectTitle}
        </p>

        {/* Craft type badge */}
        {tutorial && (
          <span
            className="absolute top-2 left-2 text-[9px] font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: tutorial.category === 'knitting' ? '#8BA888' : '#D4A0A0',
              color: '#fff',
            }}
          >
            {tutorial.category === 'knitting' ? '🧶' : '🪝'} {tutorial.category}
          </span>
        )}

        {/* Photo count badge */}
        {photoCount > 1 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50">
            <Camera size={10} color="white" />
            <span className="text-[10px] text-white font-medium">{photoCount}</span>
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="px-2.5 py-2">
        <StarRating rating={entry.rating} readonly size={12} />
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {formatShortDate(entry.createdAt)}
        </p>
      </div>
    </motion.button>
  );
}
