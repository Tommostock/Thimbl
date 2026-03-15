'use client';

import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { awardXP, getXPForAction } from '@/lib/xp';
import { XP_REWARDS } from '@/lib/constants';

/**
 * useXP Hook
 *
 * Provides a simple interface for awarding XP to the current user.
 * Wraps the awardXP function from lib/xp.ts with the current user context.
 */
export function useXP() {
  const { user } = useAuth();

  const award = useCallback(
    async (action: keyof typeof XP_REWARDS): Promise<number | null> => {
      if (!user) return null;
      const amount = getXPForAction(action);
      return awardXP(user.id, amount);
    },
    [user]
  );

  const awardCustom = useCallback(
    async (amount: number): Promise<number | null> => {
      if (!user) return null;
      return awardXP(user.id, amount);
    },
    [user]
  );

  return { award, awardCustom };
}
