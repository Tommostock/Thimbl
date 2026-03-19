'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, PlayCircle, PauseCircle, RotateCcw } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';

const PRESETS = [
  { label: '5min', seconds: 5 * 60 },
  { label: '15min', seconds: 15 * 60 },
  { label: '30min', seconds: 30 * 60 },
  { label: '1hr', seconds: 60 * 60 },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Timer() {
  const [expanded, setExpanded] = useState(false);
  const { remaining, isRunning, duration, start, pause, reset, setTime } = useTimer();

  const progress = duration > 0 ? remaining / duration : 0;

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Collapse header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between min-h-[44px]"
      >
        <span
          className="font-medium text-sm"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}
        >
          Timer
        </span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={20} style={{ color: 'var(--text-muted)' }} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="timer-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-4">
              {/* Time display */}
              <div className="text-center">
                <span
                  className="text-3xl font-mono font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {formatTime(remaining)}
                </span>
              </div>

              {/* Progress bar */}
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--border-colour)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Preset buttons */}
              <div className="flex gap-2 justify-center">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setTime(preset.seconds)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[36px]"
                    style={{
                      backgroundColor:
                        duration === preset.seconds
                          ? 'var(--accent-primary)'
                          : 'var(--bg-primary)',
                      color:
                        duration === preset.seconds
                          ? '#fff'
                          : 'var(--text-secondary)',
                      border: `1px solid ${duration === preset.seconds ? 'var(--accent-primary)' : 'var(--border-colour)'}`,
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Control buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={isRunning ? pause : start}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={isRunning ? 'Pause' : 'Play'}
                >
                  {isRunning ? (
                    <PauseCircle size={40} style={{ color: 'var(--accent-primary)' }} />
                  ) : (
                    <PlayCircle size={40} style={{ color: 'var(--accent-primary)' }} />
                  )}
                </button>
                <button
                  onClick={reset}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Reset"
                >
                  <RotateCcw size={24} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
