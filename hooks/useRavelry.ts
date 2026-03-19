'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  searchPatterns,
  getPattern,
  type RavelryPatternSearchResult,
  type RavelryPatternDetail,
  type RavelrySearchResponse,
} from '@/lib/ravelry';

export function usePatternSearch(opts: {
  query?: string;
  craft?: 'knitting' | 'crochet';
  pc?: string;
  sort?: string;
  availability?: string;
  diff?: string;
  page?: number;
  page_size?: number;
  enabled?: boolean;
}) {
  const [patterns, setPatterns] = useState<RavelryPatternSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginator, setPaginator] = useState<RavelrySearchResponse['paginator'] | null>(null);

  const { enabled = true, ...searchOpts } = opts;
  const key = JSON.stringify(searchOpts);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    searchPatterns(searchOpts)
      .then((res) => {
        if (cancelled) return;
        setPatterns(res.patterns);
        setPaginator(res.paginator);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  return { patterns, loading, error, paginator };
}

export function usePatternDetail(id: number | null) {
  const [pattern, setPattern] = useState<RavelryPatternDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === null) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPattern(id)
      .then((p) => {
        if (!cancelled) setPattern(p);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  return { pattern, loading, error };
}

export function useInfinitePatternSearch(opts: {
  query?: string;
  craft?: 'knitting' | 'crochet';
  pc?: string;
  sort?: string;
  availability?: string;
  diff?: string;
  page_size?: number;
}) {
  const [patterns, setPatterns] = useState<RavelryPatternSearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const key = JSON.stringify(opts);

  // Reset when search params change
  useEffect(() => {
    setPatterns([]);
    setPage(1);
    setHasMore(true);
  }, [key]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    searchPatterns({ ...opts, page })
      .then((res) => {
        if (cancelled) return;
        setPatterns((prev) => page === 1 ? res.patterns : [...prev, ...res.patterns]);
        setHasMore(res.paginator.page < res.paginator.last_page);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((p) => p + 1);
    }
  }, [loading, hasMore]);

  return { patterns, loading, error, hasMore, loadMore };
}
