/**
 * localStorage Helpers
 *
 * All user data is stored locally in the browser — no backend required.
 * Single key 'thimbl_data' stores the entire user state.
 */

import type { UserProject, ShoppingListItem, JournalEntry, ProjectNote } from '@/lib/types/database';

export interface StoredPhoto {
  id: string;
  user_project_id: string;
  photo_url: string; // data URL (base64)
  caption: string;
  uploaded_at: string;
}

export interface StoredStats {
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  craft_mode_sessions: number;
  projects_shared: number;
}

export interface StoredProfile {
  display_name: string;
  favourite_category: string;
}

export interface FavoritePatternMeta {
  id: string;
  name: string;
  imageUrl: string | null;
  craft: string;
  designer: string;
  difficulty: number;
  rating: number;
  free: boolean;
}

export interface ThimblStorage {
  profile: StoredProfile;
  userProjects: UserProject[];
  shoppingList: ShoppingListItem[];
  userStats: StoredStats;
  unlockedAchievements: string[];
  userPhotos: StoredPhoto[];
  favorites: string[];
  favoritePatterns: FavoritePatternMeta[];
  journalEntries: JournalEntry[];
  recentlyViewed: string[];
  projectNotes: ProjectNote[];
}

const STORAGE_KEY = 'thimbl_data';

const DEFAULT_STORAGE: ThimblStorage = {
  profile: { display_name: '', favourite_category: '' },
  userProjects: [],
  shoppingList: [],
  userStats: {
    total_xp: 0,
    level: 1,
    current_streak: 0,
    longest_streak: 0,
    last_activity_date: null,
    craft_mode_sessions: 0,
    projects_shared: 0,
  },
  unlockedAchievements: [],
  userPhotos: [],
  favorites: [],
  favoritePatterns: [],
  journalEntries: [],
  recentlyViewed: [],
  projectNotes: [],
};

/** Load the full storage object. Returns defaults if nothing is stored. */
export function getStorage(): ThimblStorage {
  if (typeof window === 'undefined') return DEFAULT_STORAGE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STORAGE };
    return { ...DEFAULT_STORAGE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STORAGE };
  }
}

/** Save partial updates to storage. Merges with existing data. */
export function setStorage(updates: Partial<ThimblStorage>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStorage();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...updates }));
  } catch {
    // localStorage quota exceeded or unavailable — silently fail
  }
}

/** Clear all stored data (sign out / reset). */
export function clearStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// -------------------------------------------------------
// User Projects
// -------------------------------------------------------

export function getUserProjects(): UserProject[] {
  return getStorage().userProjects;
}

export function saveUserProject(project: UserProject): void {
  const { userProjects } = getStorage();
  const exists = userProjects.findIndex((p) => p.id === project.id);
  if (exists >= 0) {
    userProjects[exists] = project;
  } else {
    userProjects.unshift(project);
  }
  setStorage({ userProjects });
}

export function updateUserProject(id: string, updates: Partial<UserProject>): void {
  const { userProjects } = getStorage();
  const idx = userProjects.findIndex((p) => p.id === id);
  if (idx >= 0) {
    userProjects[idx] = { ...userProjects[idx], ...updates };
    setStorage({ userProjects });
  }
}

// -------------------------------------------------------
// Achievements
// -------------------------------------------------------

export function getUnlockedAchievements(): string[] {
  return getStorage().unlockedAchievements;
}

export function unlockAchievement(achievementId: string): void {
  const { unlockedAchievements } = getStorage();
  if (!unlockedAchievements.includes(achievementId)) {
    setStorage({ unlockedAchievements: [...unlockedAchievements, achievementId] });
  }
}

// -------------------------------------------------------
// Favorites
// -------------------------------------------------------

export function getFavorites(): string[] {
  return getStorage().favorites;
}

export function addFavorite(projectId: string, meta?: FavoritePatternMeta): void {
  const { favorites, favoritePatterns } = getStorage();
  if (!favorites.includes(projectId)) {
    const updates: Partial<ThimblStorage> = { favorites: [projectId, ...favorites] };
    if (meta) {
      updates.favoritePatterns = [meta, ...favoritePatterns.filter((p) => p.id !== projectId)];
    }
    setStorage(updates);
  }
}

export function removeFavorite(projectId: string): void {
  const { favorites, favoritePatterns } = getStorage();
  setStorage({
    favorites: favorites.filter((id) => id !== projectId),
    favoritePatterns: favoritePatterns.filter((p) => p.id !== projectId),
  });
}

export function getFavoritePatterns(): FavoritePatternMeta[] {
  return getStorage().favoritePatterns;
}

export function isFavorite(projectId: string): boolean {
  return getStorage().favorites.includes(projectId);
}

// -------------------------------------------------------
// Journal
// -------------------------------------------------------

export function getJournalEntries(): JournalEntry[] {
  return getStorage().journalEntries;
}

export function saveJournalEntry(entry: JournalEntry): void {
  const { journalEntries } = getStorage();
  journalEntries.unshift(entry);
  setStorage({ journalEntries });
}

export function deleteJournalEntry(id: string): void {
  const { journalEntries } = getStorage();
  setStorage({ journalEntries: journalEntries.filter((e) => e.id !== id) });
}

// -------------------------------------------------------
// Recently Viewed
// -------------------------------------------------------

export function getRecentlyViewed(): string[] {
  return getStorage().recentlyViewed;
}

export function addRecentlyViewed(projectId: string): void {
  const { recentlyViewed } = getStorage();
  const filtered = recentlyViewed.filter((id) => id !== projectId);
  setStorage({ recentlyViewed: [projectId, ...filtered].slice(0, 20) });
}

// -------------------------------------------------------
// Project Notes
// -------------------------------------------------------

export function getProjectNotes(projectId: string): ProjectNote[] {
  return getStorage().projectNotes.filter((n) => n.projectId === projectId);
}

export function saveProjectNote(note: ProjectNote): void {
  const { projectNotes } = getStorage();
  projectNotes.unshift(note);
  setStorage({ projectNotes });
}

export function deleteProjectNote(id: string): void {
  const { projectNotes } = getStorage();
  setStorage({ projectNotes: projectNotes.filter((n) => n.id !== id) });
}

// -------------------------------------------------------
// Simple UUID generator (no crypto dependency)
// -------------------------------------------------------

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
