'use client';

import { useState, useCallback, useEffect } from 'react';
import { getJournalEntries, saveJournalEntry, deleteJournalEntry as deleteEntry } from '@/lib/storage';
import type { JournalEntry } from '@/lib/types/database';

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    setEntries(getJournalEntries());
  }, []);

  const addEntry = useCallback((entry: JournalEntry) => {
    saveJournalEntry(entry);
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const stats = {
    totalSessions: entries.length,
    uniqueProjects: new Set(entries.map((e) => e.projectId)).size,
    avgRating:
      entries.length > 0
        ? Math.round((entries.reduce((sum, e) => sum + e.rating, 0) / entries.length) * 10) / 10
        : 0,
  };

  return { entries, addEntry, removeEntry, stats };
}
