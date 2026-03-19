/**
 * Ravelry API client — fetches patterns via our /api/ravelry proxy route.
 *
 * Ravelry pattern search returns objects like:
 *   { id, name, permalink, designer: { name }, first_photo: { medium_url, small_url, ... } }
 *
 * Pattern detail returns the full object with photos[], notes, gauge, yardage, etc.
 */

// ----- Types for Ravelry API responses -----

export interface RavelryPhoto {
  id: number;
  medium_url: string;
  medium2_url: string;
  small_url: string;
  small2_url: string;
  square_url: string;
  thumbnail_url: string;
}

export interface RavelryDesigner {
  id: number;
  name: string;
  permalink: string;
}

export interface RavelryPatternSource {
  id: number;
  name: string;
  url: string;
  permalink: string;
}

export interface RavelryYarnWeight {
  id: number;
  name: string;
}

export interface RavelryPatternCategory {
  id: number;
  name: string;
  permalink: string;
  parent?: { id: number; name: string; permalink: string };
}

export interface RavelryPatternAttribute {
  id: number;
  permalink: string;
}

export interface RavelryPatternSearchResult {
  id: number;
  name: string;
  permalink: string;
  first_photo: RavelryPhoto | null;
  designer: RavelryDesigner;
  pattern_categories: RavelryPatternCategory[];
  pattern_attributes: RavelryPatternAttribute[];
  craft: { id: number; name: string; permalink: string };
  difficulty_average: number;
  rating_average: number;
  favorites_count: number;
  free: boolean;
}

export interface RavelryPatternDetail extends RavelryPatternSearchResult {
  notes_html: string;
  notes: string;
  gauge: string;
  gauge_description: string;
  yardage: number;
  yardage_description: string;
  sizes_available: string;
  url: string; // link to the original pattern
  pdf_url: string | null;
  photos: RavelryPhoto[];
  pattern_needle_sizes: { id: number; name: string }[];
  pattern_type: { id: number; name: string };
  yarn_weight: RavelryYarnWeight;
  yarn_weight_description: string;
  packs: { yarn_name: string; yarn_weight: RavelryYarnWeight; quantity_description: string }[];
  projects_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface RavelrySearchResponse {
  patterns: RavelryPatternSearchResult[];
  paginator: { page_count: number; page: number; page_size: number; results: number; last_page: number };
}

// ----- API functions -----

async function ravelryFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const searchParams = new URLSearchParams({ endpoint, ...params });
  const res = await fetch(`/api/ravelry?${searchParams.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Ravelry API error: ${res.status}`);
  }
  return res.json();
}

export async function searchPatterns(opts: {
  query?: string;
  craft?: 'knitting' | 'crochet';
  pc?: string; // pattern category, e.g. "hat", "scarf"
  sort?: string; // "best", "recently-popular", "favorites", "date"
  availability?: string; // "free", "ravelry", "online"
  fit?: string;
  weight?: string;
  diff?: string; // difficulty range e.g. "1-3"
  page?: number;
  page_size?: number;
}): Promise<RavelrySearchResponse> {
  const params: Record<string, string> = {};
  if (opts.query) params.query = opts.query;
  if (opts.craft) params.craft = opts.craft;
  if (opts.pc) params.pc = opts.pc;
  if (opts.sort) params.sort = opts.sort;
  if (opts.availability) params.availability = opts.availability;
  if (opts.fit) params.fit = opts.fit;
  if (opts.weight) params.weight = opts.weight;
  if (opts.diff) params.diff = opts.diff;
  params.page = String(opts.page ?? 1);
  params.page_size = String(opts.page_size ?? 24);

  return ravelryFetch<RavelrySearchResponse>('/patterns/search.json', params);
}

export async function getPattern(id: number): Promise<RavelryPatternDetail> {
  const data = await ravelryFetch<{ pattern: RavelryPatternDetail }>(`/patterns/${id}.json`);
  return data.pattern;
}

// ----- Helpers -----

export function getPatternImageUrl(pattern: RavelryPatternSearchResult, size: 'medium' | 'small' | 'square' = 'medium'): string | null {
  const photo = pattern.first_photo;
  if (!photo) return null;
  switch (size) {
    case 'medium': return photo.medium2_url || photo.medium_url;
    case 'small': return photo.small2_url || photo.small_url;
    case 'square': return photo.square_url;
  }
}

export function getDifficultyLabel(avg: number): string {
  if (avg <= 1.5) return 'Beginner';
  if (avg <= 3) return 'Easy';
  if (avg <= 5) return 'Intermediate';
  if (avg <= 7) return 'Advanced';
  return 'Expert';
}

export function getCraftEmoji(craft: string): string {
  switch (craft.toLowerCase()) {
    case 'knitting': return '🧶';
    case 'crochet': return '🪝';
    default: return '🧵';
  }
}
