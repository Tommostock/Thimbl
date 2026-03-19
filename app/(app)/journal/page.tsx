'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus } from 'lucide-react';
import { useJournal } from '@/hooks/useJournal';
import { CATEGORIES } from '@/lib/constants';
import { PROJECTS } from '@/lib/data';
import JournalEntryModal from '@/components/journal/JournalEntryModal';
import JournalDetailModal from '@/components/journal/JournalDetailModal';
import StarRating from '@/components/ui/StarRating';
import type { JournalEntry } from '@/lib/types/database';

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getCategoryEmoji(category: string): string {
  return CATEGORIES.find((c) => c.key === category)?.emoji ?? '🧵';
}

// Map of project category colours for placeholders
const CATEGORY_COLOURS: Record<string, string> = {
  sewing: '#D4A843',
  knitting: '#C67B5C',
  crochet: '#8BA888',
  embroidery: '#9B7DB8',
};

export default function JournalPage() {
  const { entries, addEntry, removeEntry, stats } = useJournal();
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

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
          <div
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {stats.totalSessions}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Total Sessions
            </div>
          </div>
          <div
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {stats.uniqueProjects}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Unique Projects
            </div>
          </div>
          <div
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
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
      <motion.button
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-40"
        style={{ backgroundColor: 'var(--accent-primary)' }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowEntryModal(true)}
      >
        <Plus size={24} color="white" />
      </motion.button>

      {/* Modals */}
      <JournalEntryModal
        isOpen={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onSave={addEntry}
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
  // Find project to get category for placeholder
  const project = PROJECTS.find((p) => p.id === entry.projectId);
  const category = project?.category ?? 'sewing';
  const emoji = getCategoryEmoji(category);
  const placeholderColour = CATEGORY_COLOURS[category] ?? '#8BA888';

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
        {hasPhoto ? (
          <img
            src={entry.photos[0]}
            alt={entry.projectTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ backgroundColor: placeholderColour + '30' }}
          >
            {emoji}
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
