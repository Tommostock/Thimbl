'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ParsedPatternContent } from '@/lib/types/pattern';

interface UsePatternContentResult {
  content: ParsedPatternContent | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function usePatternContent(tutorialId: string): UsePatternContentResult {
  const [content, setContent] = useState<ParsedPatternContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/pattern/${encodeURIComponent(tutorialId)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data: ParsedPatternContent = await res.json();
      setContent(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [tutorialId, retryCount]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const retry = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  return { content, loading, error, retry };
}
