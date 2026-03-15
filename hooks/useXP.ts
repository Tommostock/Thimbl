'use client';

import { useCallback } from 'react';
import { awardXP, getXPForAction } from '@/lib/xp';
import { XP_REWARDS } from '@/lib/constants';

/**
 * useXP Hook
 *
 * Provides a simple interface for awarding XP.
 * All XP data is stored in localStorage via lib/xp.ts.
 */
export function useXP() {
  const award = useCallback(
    (action: keyof typeof XP_REWARDS): number => {
      const amount = getXPForAction(action);
      return awardXP(amount);
    },
    []
  );

  const awardCustom = useCallback((amount: number): number => {
    return awardXP(amount);
  }, []);

  return { award, awardCustom };
}
