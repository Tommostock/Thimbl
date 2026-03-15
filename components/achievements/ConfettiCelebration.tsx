'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ConfettiCelebration Component
 *
 * Shows a burst of confetti particles when triggered.
 * Used for achievement unlocks, level-ups, and project completions.
 */

interface ConfettiCelebrationProps {
  show: boolean;
  onComplete?: () => void;
}

// Craft-themed confetti colours
const COLOURS = ['#C67B5C', '#8BA888', '#D4A0A0', '#D4A843', '#6B8A7A', '#E8B4A0'];

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  colour: string;
  size: number;
  delay: number;
  shape: 'circle' | 'square' | 'triangle';
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100, // % from left
    y: -10 - Math.random() * 20, // start above viewport
    rotation: Math.random() * 360,
    colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
    size: 6 + Math.random() * 8,
    delay: Math.random() * 0.5,
    shape: (['circle', 'square', 'triangle'] as const)[Math.floor(Math.random() * 3)],
  }));
}

export default function ConfettiCelebration({ show, onComplete }: ConfettiCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (show) {
      setParticles(generateParticles(40));
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setParticles([]);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute"
              style={{
                left: `${particle.x}%`,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.colour,
                borderRadius: particle.shape === 'circle' ? '50%' : particle.shape === 'triangle' ? '0' : '2px',
                clipPath: particle.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
              }}
              initial={{
                y: particle.y,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: '110vh',
                rotate: particle.rotation + 720,
                opacity: [1, 1, 0.8, 0],
              }}
              transition={{
                duration: 2 + Math.random(),
                delay: particle.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
