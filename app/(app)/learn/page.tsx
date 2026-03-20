'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, ArrowLeftRight, Ruler, Search } from 'lucide-react';

// ── Expanded Stitch Glossary ──

interface GlossaryItem {
  term: string;
  aka: string;
  craft: 'crochet' | 'knitting' | 'both';
  definition: string;
}

const GLOSSARY: GlossaryItem[] = [
  // Crochet
  { term: 'Chain (ch)', aka: '', craft: 'crochet', definition: 'Yarn over and pull through the loop on your hook. The foundation of most crochet projects.' },
  { term: 'Slip Stitch (sl st)', aka: '', craft: 'crochet', definition: 'Insert hook, yarn over, pull through both the stitch and the loop on your hook in one motion. Used to join rounds or move yarn.' },
  { term: 'Double Crochet (dc)', aka: 'US: Single Crochet (sc)', craft: 'crochet', definition: 'Insert hook, yarn over, pull through, yarn over, pull through both loops. The most common crochet stitch.' },
  { term: 'Treble (tr)', aka: 'US: Double Crochet (dc)', craft: 'crochet', definition: 'Yarn over, insert hook, yarn over, pull through, (yarn over, pull through 2 loops) twice. Creates a taller stitch.' },
  { term: 'Half Treble (htr)', aka: 'US: Half Double Crochet (hdc)', craft: 'crochet', definition: 'Yarn over, insert hook, yarn over, pull through, yarn over, pull through all 3 loops.' },
  { term: 'Double Treble (dtr)', aka: 'US: Treble (tr)', craft: 'crochet', definition: 'Yarn over twice, insert hook, yarn over, pull through, (yarn over, pull through 2 loops) three times.' },
  { term: 'Magic Circle', aka: 'Magic Ring, Adjustable Ring', craft: 'crochet', definition: 'A technique to start crocheting in the round without leaving a hole in the centre. Wind yarn around your finger, crochet into the loop, then pull tight to close.' },
  { term: 'Yarn Over (YO)', aka: '', craft: 'crochet', definition: 'Wrap the yarn over your hook from back to front. Used in almost every crochet stitch.' },
  { term: '2 dc tog', aka: 'dc2tog, Decrease', craft: 'crochet', definition: 'Start a double crochet in the next stitch but don\'t finish it, then start another in the following stitch, yarn over and pull through all loops. This turns 2 stitches into 1.' },

  // Knitting
  { term: 'Cast On (CO)', aka: '', craft: 'knitting', definition: 'The method of putting the first stitches onto a needle to begin knitting. Common methods: long-tail, cable, and knitted cast on.' },
  { term: 'Cast Off (BO)', aka: 'Bind Off', craft: 'knitting', definition: 'Securing stitches so they don\'t unravel when you take the needle out. Knit 2, pass the first over the second, repeat.' },
  { term: 'Knit (K)', aka: '', craft: 'knitting', definition: 'Insert the right needle into the front of the stitch from left to right, wrap yarn around and pull through. The most basic knitting stitch.' },
  { term: 'Purl (P)', aka: '', craft: 'knitting', definition: 'Insert the right needle into the front of the stitch from right to left, wrap yarn around and pull through. The reverse of a knit stitch.' },
  { term: 'Stocking Stitch (St st)', aka: 'Stockinette', craft: 'knitting', definition: 'Alternate rows of knit and purl. Creates a smooth V-pattern on the front and a bumpy texture on the back.' },
  { term: 'Garter Stitch', aka: '', craft: 'knitting', definition: 'Knit every row (or purl every row). Creates a bumpy, stretchy fabric that looks the same on both sides.' },
  { term: 'Rib', aka: 'Ribbing', craft: 'knitting', definition: 'Alternating knit and purl stitches in the same row (e.g. K1, P1 or K2, P2). Creates a stretchy, textured fabric great for cuffs and hems.' },
  { term: 'Increase (inc)', aka: 'KFB, M1', craft: 'knitting', definition: 'Adding a stitch to make your work wider. KFB = knit front and back. M1 = make one by lifting the bar between stitches.' },
  { term: 'Decrease (dec)', aka: 'K2tog, SSK', craft: 'knitting', definition: 'Removing a stitch to make your work narrower. K2tog = knit two together. SSK = slip, slip, knit.' },
  { term: 'Yarn Over (YO)', aka: '', craft: 'knitting', definition: 'Wrap yarn around the needle to create a new stitch and a decorative hole. Used in lace patterns.' },

  // Both
  { term: 'Stitch Marker', aka: '', craft: 'both', definition: 'A small clip or piece of yarn placed to mark the beginning of a round, a pattern repeat, or an important position.' },
  { term: 'Gauge / Tension', aka: '', craft: 'both', definition: 'The number of stitches and rows per 10cm. Always make a test swatch to check your gauge matches the pattern.' },
  { term: 'Blocking', aka: '', craft: 'both', definition: 'Wetting or steaming your finished piece and pinning it to shape. Evens out stitches and gives a professional finish.' },
  { term: 'Frogging', aka: 'Ripping back', craft: 'both', definition: 'Pulling out your work to undo mistakes. Named after "rip it, rip it" (sounds like a frog!).' },
  { term: 'WIP', aka: 'Work In Progress', craft: 'both', definition: 'A project you\'ve started but haven\'t finished yet. Most crafters have several on the go!' },
  { term: 'FO', aka: 'Finished Object', craft: 'both', definition: 'A completed project. The best feeling in crafting!' },
];

// ── UK vs US Terminology ──

const UK_US_TERMS = [
  { uk: 'Double Crochet (dc)', us: 'Single Crochet (sc)' },
  { uk: 'Half Treble (htr)', us: 'Half Double Crochet (hdc)' },
  { uk: 'Treble (tr)', us: 'Double Crochet (dc)' },
  { uk: 'Double Treble (dtr)', us: 'Treble (tr)' },
  { uk: 'Triple Treble (trtr)', us: 'Double Treble (dtr)' },
  { uk: 'Tension', us: 'Gauge' },
  { uk: 'Cast Off', us: 'Bind Off' },
  { uk: 'Stocking Stitch', us: 'Stockinette Stitch' },
  { uk: 'Reverse Stocking Stitch', us: 'Reverse Stockinette' },
  { uk: 'Miss', us: 'Skip' },
  { uk: 'Yarn Forward (yfwd)', us: 'Yarn Over (YO)' },
];

// ── Needle & Hook Size Charts ──

const KNITTING_NEEDLES = [
  { mm: '2.0', uk: '14', us: '0' },
  { mm: '2.25', uk: '13', us: '1' },
  { mm: '2.75', uk: '12', us: '2' },
  { mm: '3.0', uk: '11', us: '-' },
  { mm: '3.25', uk: '10', us: '3' },
  { mm: '3.5', uk: '-', us: '4' },
  { mm: '3.75', uk: '9', us: '5' },
  { mm: '4.0', uk: '8', us: '6' },
  { mm: '4.5', uk: '7', us: '7' },
  { mm: '5.0', uk: '6', us: '8' },
  { mm: '5.5', uk: '5', us: '9' },
  { mm: '6.0', uk: '4', us: '10' },
  { mm: '6.5', uk: '3', us: '10½' },
  { mm: '7.0', uk: '2', us: '-' },
  { mm: '8.0', uk: '0', us: '11' },
  { mm: '9.0', uk: '00', us: '13' },
  { mm: '10.0', uk: '000', us: '15' },
];

const CROCHET_HOOKS = [
  { mm: '2.0', us: '-', letter: '-' },
  { mm: '2.25', us: 'B/1', letter: 'B' },
  { mm: '2.75', us: 'C/2', letter: 'C' },
  { mm: '3.25', us: 'D/3', letter: 'D' },
  { mm: '3.5', us: 'E/4', letter: 'E' },
  { mm: '3.75', us: 'F/5', letter: 'F' },
  { mm: '4.0', us: 'G/6', letter: 'G' },
  { mm: '4.5', us: '7', letter: '-' },
  { mm: '5.0', us: 'H/8', letter: 'H' },
  { mm: '5.5', us: 'I/9', letter: 'I' },
  { mm: '6.0', us: 'J/10', letter: 'J' },
  { mm: '6.5', us: 'K/10½', letter: 'K' },
  { mm: '8.0', us: 'L/11', letter: 'L' },
  { mm: '9.0', us: 'M-N/13', letter: 'M/N' },
  { mm: '10.0', us: 'N-P/15', letter: 'N/P' },
];

// ── Section Component ──

function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: typeof BookOpen;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl overflow-hidden mb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <button onClick={() => setOpen(!open)} className="w-full p-4 min-h-[48px] text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon size={18} style={{ color: 'var(--accent-primary)' }} />
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {title}
            </span>
          </div>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
          </motion.div>
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ──

const CRAFT_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'crochet', label: '🪝 Crochet' },
  { key: 'knitting', label: '🧶 Knitting' },
];

export default function LearnPage() {
  const [glossaryFilter, setGlossaryFilter] = useState('all');
  const [glossarySearch, setGlossarySearch] = useState('');

  const filteredGlossary = GLOSSARY.filter((g) => {
    const matchesCraft = glossaryFilter === 'all' || g.craft === glossaryFilter || g.craft === 'both';
    const matchesSearch = !glossarySearch.trim() ||
      g.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      g.aka.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      g.definition.toLowerCase().includes(glossarySearch.toLowerCase());
    return matchesCraft && matchesSearch;
  });

  return (
    <div className="px-4 pt-6 pb-24">
      <h1
        className="text-2xl font-bold mb-5"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
      >
        Learn
      </h1>

      {/* 1. Stitch Glossary */}
      <CollapsibleSection title="Stitch Glossary" icon={BookOpen} defaultOpen>
        {/* Search input */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3"
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-colour)' }}
        >
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            value={glossarySearch}
            onChange={(e) => setGlossarySearch(e.target.value)}
            placeholder="Search stitches..."
            className="flex-1 bg-transparent border-none outline-none text-xs"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-3">
          {CRAFT_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setGlossaryFilter(f.key)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                backgroundColor: glossaryFilter === f.key ? 'var(--accent-primary)' : 'var(--bg-primary)',
                color: glossaryFilter === f.key ? '#fff' : 'var(--text-muted)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredGlossary.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
              No matching stitches found
            </p>
          )}
          {filteredGlossary.map((item) => (
            <div
              key={item.term}
              className="rounded-lg p-3"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {item.term}
                </span>
                <span
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: item.craft === 'crochet' ? '#D4A0A0' : item.craft === 'knitting' ? '#8BA888' : 'var(--accent-primary)',
                    color: '#fff',
                  }}
                >
                  {item.craft === 'both' ? 'both' : item.craft}
                </span>
              </div>
              {item.aka && (
                <p className="text-xs mb-1" style={{ color: 'var(--accent-primary)' }}>
                  Also known as: {item.aka}
                </p>
              )}
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.definition}
              </p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* 2. UK vs US Terminology */}
      <CollapsibleSection title="UK vs US Terminology" icon={ArrowLeftRight}>
        <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Patterns in this app use UK terminology (DROPS Design standard). Here's a quick conversion.
        </p>
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-colour)' }}>
          {/* Header */}
          <div className="flex" style={{ backgroundColor: 'var(--accent-primary)' }}>
            <div className="flex-1 px-3 py-2">
              <span className="text-xs font-bold text-white">UK Term</span>
            </div>
            <div className="flex-1 px-3 py-2">
              <span className="text-xs font-bold text-white">US Term</span>
            </div>
          </div>
          {/* Rows */}
          {UK_US_TERMS.map((row, i) => (
            <div
              key={row.uk}
              className="flex"
              style={{
                backgroundColor: i % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-colour)',
              }}
            >
              <div className="flex-1 px-3 py-2.5">
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                  {row.uk}
                </span>
              </div>
              <div className="flex-1 px-3 py-2.5">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {row.us}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* 3. Knitting Needle Sizes */}
      <CollapsibleSection title="Knitting Needle Sizes" icon={Ruler}>
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-colour)' }}>
          <div className="flex" style={{ backgroundColor: '#8BA888' }}>
            <div className="flex-1 px-3 py-2"><span className="text-xs font-bold text-white">Metric</span></div>
            <div className="flex-1 px-3 py-2"><span className="text-xs font-bold text-white">UK</span></div>
            <div className="flex-1 px-3 py-2"><span className="text-xs font-bold text-white">US</span></div>
          </div>
          {KNITTING_NEEDLES.map((row, i) => (
            <div
              key={row.mm}
              className="flex"
              style={{
                backgroundColor: i % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-colour)',
              }}
            >
              <div className="flex-1 px-3 py-2">
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{row.mm}mm</span>
              </div>
              <div className="flex-1 px-3 py-2">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{row.uk}</span>
              </div>
              <div className="flex-1 px-3 py-2">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{row.us}</span>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* 4. Crochet Hook Sizes */}
      <CollapsibleSection title="Crochet Hook Sizes" icon={Ruler}>
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-colour)' }}>
          <div className="flex" style={{ backgroundColor: '#D4A0A0' }}>
            <div className="flex-1 px-3 py-2"><span className="text-xs font-bold text-white">Metric</span></div>
            <div className="flex-1 px-3 py-2"><span className="text-xs font-bold text-white">US</span></div>
            <div className="flex-1 px-3 py-2"><span className="text-xs font-bold text-white">Letter</span></div>
          </div>
          {CROCHET_HOOKS.map((row, i) => (
            <div
              key={row.mm}
              className="flex"
              style={{
                backgroundColor: i % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-colour)',
              }}
            >
              <div className="flex-1 px-3 py-2">
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{row.mm}mm</span>
              </div>
              <div className="flex-1 px-3 py-2">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{row.us}</span>
              </div>
              <div className="flex-1 px-3 py-2">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{row.letter}</span>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
