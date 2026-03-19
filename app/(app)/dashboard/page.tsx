'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { TUTORIALS, SUBCATEGORIES, getTutorialsByCategory, getTutorialsBySubcategory } from '@/lib/tutorials';
import SectionHeader from '@/components/home/SectionHeader';
import TutorialCardSmall from '@/components/home/TutorialCardSmall';
import TutorialCard from '@/components/catalogue/TutorialCard';

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme();
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  const knittingHighlights = useMemo(() => getTutorialsByCategory('knitting').slice(0, 10), []);
  const crochetHighlights = useMemo(() => getTutorialsByCategory('crochet').slice(0, 10), []);
  const toyHighlights = useMemo(() => getTutorialsBySubcategory('Toys'), []);
  const babyHighlights = useMemo(() => getTutorialsBySubcategory('Baby'), []);
  const christmasHighlights = useMemo(() => getTutorialsBySubcategory('Christmas'), []);

  const allTutorials = useMemo(
    () => (selectedSub ? getTutorialsBySubcategory(selectedSub) : TUTORIALS),
    [selectedSub],
  );

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Logo bar */}
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          Thimbl
        </h1>
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      {/* Subcategory pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setSelectedSub(null)}
          className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0"
          style={{
            backgroundColor: !selectedSub ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            color: !selectedSub ? '#fff' : 'var(--text-secondary)',
          }}
        >
          All
        </button>
        {SUBCATEGORIES.map((sub) => (
          <button
            key={sub.key}
            onClick={() => setSelectedSub(selectedSub === sub.key ? null : sub.key)}
            className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0"
            style={{
              backgroundColor: selectedSub === sub.key ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: selectedSub === sub.key ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {sub.emoji} {sub.label}
          </button>
        ))}
      </div>

      {/* Horizontal scroll sections (only when no subcategory filter) */}
      {!selectedSub && (
        <>
          <div className="mb-6">
            <SectionHeader title="🧶 Knitting Patterns" href="/search" />
            <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {knittingHighlights.map((t) => (
                <TutorialCardSmall key={t.id} tutorial={t} />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <SectionHeader title="🪝 Crochet Patterns" href="/search" />
            <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {crochetHighlights.map((t) => (
                <TutorialCardSmall key={t.id} tutorial={t} />
              ))}
            </div>
          </div>

          {toyHighlights.length > 0 && (
            <div className="mb-6">
              <SectionHeader title="🧸 Toys & Amigurumi" />
              <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {toyHighlights.map((t) => (
                  <TutorialCardSmall key={t.id} tutorial={t} />
                ))}
              </div>
            </div>
          )}

          {babyHighlights.length > 0 && (
            <div className="mb-6">
              <SectionHeader title="👶 Baby Patterns" />
              <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {babyHighlights.map((t) => (
                  <TutorialCardSmall key={t.id} tutorial={t} />
                ))}
              </div>
            </div>
          )}

          {christmasHighlights.length > 0 && (
            <div className="mb-6">
              <SectionHeader title="🎄 Christmas & Holiday" />
              <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {christmasHighlights.map((t) => (
                  <TutorialCardSmall key={t.id} tutorial={t} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* All tutorials grid */}
      <div className="mb-6">
        <SectionHeader
          title={selectedSub ? `${SUBCATEGORIES.find((s) => s.key === selectedSub)?.emoji ?? ''} ${selectedSub}` : 'All Patterns'}
          count={allTutorials.length}
        />
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
        >
          {allTutorials.map((tutorial, index) => (
            <TutorialCard key={tutorial.id} tutorial={tutorial} index={index} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
