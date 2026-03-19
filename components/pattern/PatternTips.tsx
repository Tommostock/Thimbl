'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Lightbulb } from 'lucide-react';

interface PatternTipsProps {
  tips: string[];
}

export default function PatternTips({ tips }: PatternTipsProps) {
  const [expanded, setExpanded] = useState(false);

  if (tips.length === 0) return null;

  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 min-h-[44px]"
      >
        <span
          className="text-base font-bold flex items-center gap-2"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          <Lightbulb size={18} style={{ color: '#F59E0B' }} />
          Tips & Techniques
        </span>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {tips.map((tip, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
                >
                  {tip}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
