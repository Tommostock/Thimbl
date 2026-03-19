/**
 * Transforms raw DROPS Design pattern text into beginner-friendly,
 * well-structured instructions.
 *
 * DROPS uses UK crochet terminology:
 *   UK "dc" (double crochet)  = US "sc" (single crochet)
 *   UK "tr" (treble)          = US "dc" (double crochet)
 *   UK "htr" (half treble)    = US "hdc" (half double crochet)
 */

export interface FormattedStep {
  /** Unique id for checkbox persistence */
  id: string;
  /** Round/Row number label, or null for prose */
  stepNumber: string | null;
  /** The main instruction text, rewritten for clarity */
  instruction: string;
  /** Stitch count at end of step, if any */
  stitchCount: string | null;
  /** Optional helpful note for beginners */
  note: string | null;
  /** Shaping indicator: 'increase' | 'decrease' | null */
  shaping: 'increase' | 'decrease' | null;
}

export interface FormattedSection {
  heading: string;
  description: string | null;
  /** Mini materials note for this section (e.g. "Use 4mm hook with vanilla yarn") */
  materialsNote: string | null;
  steps: FormattedStep[];
  totalSteps: number;
}

// ---- Glossary (used for tooltips + guide panel) ----

export interface GlossaryEntry {
  term: string;
  short: string;
  definition: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  { term: 'dc', short: 'double crochet', definition: 'Insert hook, yarn over, pull through, yarn over, pull through both loops. (US equivalent: single crochet)' },
  { term: 'ch', short: 'chain', definition: 'Yarn over and pull through the loop on your hook.' },
  { term: 'sl st', short: 'slip stitch', definition: 'Insert hook, yarn over, pull through both the stitch and the loop on your hook in one motion.' },
  { term: 'magic circle', short: 'magic circle', definition: 'A technique to start crocheting in the round without leaving a hole in the centre. Wind yarn around your finger, crochet into the loop, then pull tight.' },
  { term: 'YO', short: 'yarn over', definition: 'Wrap the yarn over your hook from back to front.' },
  { term: '2 dc tog', short: 'decrease', definition: 'Start a double crochet in the next stitch but don\'t finish it, then start another in the following stitch, yarn over and pull through all loops. This turns 2 stitches into 1.' },
  { term: 'stitch marker', short: 'stitch marker', definition: 'A small clip or piece of yarn placed to mark the beginning of a round or an important position.' },
  { term: 'cast on', short: 'cast on', definition: 'The method of putting the first stitches onto a needle to begin knitting.' },
  { term: 'stocking stitch', short: 'stocking stitch', definition: 'Alternate rows of knit and purl. Creates a smooth V-pattern on the front.' },
  { term: 'rib', short: 'ribbing', definition: 'Alternating knit and purl stitches in the same row, creating a stretchy textured fabric.' },
];

/** Words that should be tappable for tooltip explanations */
export const TOOLTIP_TERMS = new Map<string, string>([
  ['double crochet', 'Insert hook, yarn over, pull through, yarn over, pull through both loops.'],
  ['chain', 'Yarn over and pull through the loop on your hook.'],
  ['slip stitch', 'Insert hook, yarn over, pull through the stitch and your loop in one go.'],
  ['magic circle', 'Wind yarn around finger, crochet into the loop, then pull tight to close.'],
  ['yarn over', 'Wrap the yarn over your hook from back to front.'],
  ['decrease', 'Crochet two stitches together to reduce your stitch count by one.'],
  ['increase', 'Work two stitches into the same stitch to add one extra.'],
  ['stitch marker', 'A clip placed to mark the start of a round or key position.'],
  ['stocking stitch', 'Alternate knit and purl rows for a smooth V-pattern fabric.'],
  ['cast on', 'Put the first stitches onto a needle to begin knitting.'],
]);

/**
 * Format a raw section of DROPS instructions into structured, beginner-friendly steps.
 */
export function formatSection(heading: string, rawContent: string): FormattedSection {
  const lines = rawContent.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  let steps: FormattedStep[] = [];
  let description: string | null = null;
  const descLines: string[] = [];

  for (const line of lines) {
    const roundMatch = line.match(/^(?:ROUND|ROW)\s+([\d-]+)\s*:\s*(.*)/i);
    if (roundMatch) {
      if (steps.length === 0 && descLines.length > 0) {
        description = rewriteProse(descLines.join(' '));
        descLines.length = 0;
      }
      const stepNum = roundMatch[1];
      const rawInstruction = roundMatch[2];
      steps.push(parseStepInstruction(stepNum, rawInstruction, heading));
    } else {
      if (steps.length === 0) {
        descLines.push(line);
      } else {
        steps.push({
          id: `${heading}-prose-${steps.length}`,
          stepNumber: null,
          instruction: rewriteProse(line),
          stitchCount: null,
          note: null,
          shaping: null,
        });
      }
    }
  }

  if (steps.length === 0 && descLines.length > 0) {
    const proseText = descLines.join('\n');
    const sentences = proseText.split(/\.\s+/).filter((s) => s.trim().length > 0);
    for (let i = 0; i < sentences.length; i++) {
      const s = sentences[i].trim();
      steps.push({
        id: `${heading}-s-${i}`,
        stepNumber: null,
        instruction: rewriteProse(s + (s.endsWith('.') ? '' : '.')),
        stitchCount: null,
        note: null,
        shaping: null,
      });
    }
  } else if (descLines.length > 0) {
    description = rewriteProse(descLines.join(' '));
  }

  const totalSteps = steps.length;

  // Group identical consecutive rounds
  steps = groupIdenticalRounds(steps);

  // Extract materials note from description
  const materialsNote = extractMaterialsNote(heading, rawContent);

  return {
    heading: friendlyHeading(heading),
    description,
    materialsNote,
    steps,
    totalSteps,
  };
}

// ---- Round grouping ----

function groupIdenticalRounds(steps: FormattedStep[]): FormattedStep[] {
  const result: FormattedStep[] = [];
  let i = 0;

  while (i < steps.length) {
    const step = steps[i];

    // Already a range (e.g. "Rounds 10-17") — keep as is
    if (step.stepNumber && /Rounds?\s+\d+-\d+/.test(step.stepNumber)) {
      result.push(step);
      i++;
      continue;
    }

    // Try to group consecutive identical instructions
    if (step.stepNumber && step.instruction) {
      let j = i + 1;
      while (
        j < steps.length &&
        steps[j].stepNumber &&
        steps[j].instruction === step.instruction &&
        steps[j].stitchCount === step.stitchCount
      ) {
        j++;
      }

      if (j - i >= 2) {
        // Group them
        const firstNum = step.stepNumber.replace(/^Rounds?\s+/, '');
        const lastNum = steps[j - 1].stepNumber!.replace(/^Rounds?\s+/, '');
        result.push({
          ...step,
          id: `${step.id}-group`,
          stepNumber: `Rounds ${firstNum}–${lastNum}`,
          note: `Repeat for ${j - i} rounds — no shaping changes.`,
        });
        i = j;
        continue;
      }
    }

    result.push(step);
    i++;
  }

  return result;
}

// ---- Per-section materials note ----

function extractMaterialsNote(heading: string, rawContent: string): string | null {
  const h = heading.toUpperCase();
  const raw = rawContent.toLowerCase();

  // Look for hook/needle size + colour mentions in the raw content
  const hookMatch = raw.match(/hook size (\d+(?:\.\d+)?\s*mm)/i);
  const needleMatch = raw.match(/needle size (\d+(?:\.\d+)?\s*mm)/i);
  const colourMatch = raw.match(/with\s+([\w\s]+?)(?:\.|,|\n|$)/i);
  const tool = hookMatch ? `${hookMatch[1]} hook` : needleMatch ? `${needleMatch[1]} needles` : null;
  const colour = colourMatch ? colourMatch[1].trim() : null;

  if (tool && colour) return `Use ${tool} with ${colour} yarn`;
  if (tool) return `Use ${tool}`;

  // Fallback: known section → tool mappings
  const sectionTools: Record<string, string> = {
    'BEAK': 'Use 3mm hook with orange yarn',
    'LEG': 'Use 3mm hook with orange yarn',
    'LEGS': 'Use 3mm hook with orange yarn',
    'COCKSCOMB': 'Use 3mm hook with red yarn',
  };

  return sectionTools[h] || null;
}

// ---- Step parsing ----

function parseStepInstruction(
  stepNum: string,
  raw: string,
  heading: string,
): FormattedStep {
  let stitchCount: string | null = null;
  let instruction = raw;

  const countMatch = instruction.match(/=\s*(\d+)\s*(?:dc|sc|tr|htr|sts?|stitches?)\.?\s*$/i);
  if (countMatch) {
    stitchCount = `${countMatch[1]} stitches`;
    instruction = instruction.slice(0, countMatch.index).trim();
    if (instruction.endsWith(',')) instruction = instruction.slice(0, -1).trim();
  }

  // Detect shaping
  const shaping = detectShaping(raw);

  instruction = rewriteInstruction(instruction);
  const note = getBeginnerNote(stepNum, raw);
  const isRange = stepNum.includes('-');
  const label = isRange ? `Rounds ${stepNum}` : `Round ${stepNum}`;

  return {
    id: `${heading}-${stepNum}`,
    stepNumber: label,
    instruction,
    stitchCount,
    note,
    shaping,
  };
}

function detectShaping(raw: string): 'increase' | 'decrease' | null {
  const lower = raw.toLowerCase();
  const hasIncrease = /2 dc in (?:next|every|1st|last) dc|increase/i.test(lower);
  const hasDecrease = /2 dc tog|tog|decrease/i.test(lower);
  if (hasIncrease && !hasDecrease) return 'increase';
  if (hasDecrease && !hasIncrease) return 'decrease';
  return null;
}

// ---- Instruction rewriting ----

function rewriteInstruction(raw: string): string {
  let text = raw;

  text = text.replace(/\s*[-–]\s*READ\s+[A-Z\s]+(?:ABOVE)?\.?\s*/gi, '. ');
  text = text.replace(/\s*[-–]\s*See\s+explanation\s+above\.?\s*/gi, '. ');

  text = text.replace(/Work (\d+) dc in (?:the )?circle/gi, 'Crochet $1 double crochets into the magic circle');
  text = text.replace(/Work (\d+) dc in every dc/gi, 'Crochet 1 double crochet in each stitch around ($1 total)');
  text = text.replace(/Work 1 dc in every dc/gi, 'Crochet 1 double crochet in each stitch around');
  text = text.replace(/(\d+) dc in every dc/gi, '$1 double crochets in each stitch');
  text = text.replace(/2 dc in next dc/gi, '2 double crochets in the next stitch (increase)');
  text = text.replace(/2 dc in every dc/gi, '2 double crochets in every stitch (increase each stitch)');
  text = text.replace(/1 dc in next dc/gi, '1 double crochet in the next stitch');
  text = text.replace(/1 dc in the next (\d+) dc/gi, '1 double crochet in each of the next $1 stitches');
  text = text.replace(/crochet the next 2 dc tog/gi, 'decrease by crocheting the next 2 stitches together');
  text = text.replace(/Work all dc tog 2 by 2/gi, 'Decrease every pair of stitches by crocheting them together');
  text = text.replace(/1 sl st in next dc/gi, '1 slip stitch in the next stitch');
  text = text.replace(/finish with 1 sl st in next dc/gi, 'Finish with a slip stitch into the next stitch');
  text = text.replace(/Work 1 ch/gi, 'Chain 1');
  text = text.replace(/Work (\d+) ch/gi, 'Chain $1');
  text = text.replace(/1 dc in (\d+)(?:st|nd|rd|th) ch from hook/gi, '1 double crochet in the $1st chain from your hook');
  text = text.replace(/2 dc in 1st dc/gi, '2 double crochets in the first stitch (increase)');
  text = text.replace(/2 dc in last dc/gi, '2 double crochets in the last stitch (increase)');
  text = text.replace(/1 dc in next (\d+) dc/gi, '1 double crochet in each of the next $1 stitches');
  text = text.replace(/skip 1st dc/gi, 'Skip the first stitch');
  text = text.replace(/1 dc in last dc/gi, '1 double crochet in the last stitch');
  text = text.replace(/turn piece/gi, 'turn your work');
  text = text.replace(/1 sl st in every ch remaining on ch-row/gi, 'slip stitch along each remaining chain back to the start');
  text = text.replace(/work 1 sl st in (\d+)(?:st|nd|rd|th) ch from hook/gi, 'slip stitch in the $1st chain from your hook');

  // Clean up repeat notation
  text = text.replace(/\*\s*/g, '');
  text = text.replace(/\s*\*\s*/g, '');
  text = text.replace(/,?\s*repeat from \*-\*\s*(?:the rest of )?(?:the )?(?:round|row)/gi, ' — repeat this across the round');
  text = text.replace(/,?\s*repeat from \*-\*\s*one more time/gi, ' — repeat once more');

  text = text.replace(/\.\s*\./g, '.').replace(/\s{2,}/g, ' ').trim();

  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  return text;
}

function rewriteProse(raw: string): string {
  let text = raw;

  text = text.replace(/\s*[-–]\s*READ\s+[A-Z\s]+(?:ABOVE)?\.?\s*/gi, '. ');
  text = text.replace(/\s*[-–]\s*See\s+explanation\s+above\.?\s*/gi, '. ');

  text = text.replace(/\bdc\b/g, 'double crochet');
  text = text.replace(/\bsl st\b/g, 'slip stitch');
  text = text.replace(/\bch\b(?!-)/g, 'chain');
  text = text.replace(/\bYO\b/g, 'yarn over');
  text = text.replace(/\bbeg\b/g, 'beginning');

  text = text.replace(/\.\s*\./g, '.').replace(/\s{2,}/g, ' ').trim();
  if (text.length > 0) text = text.charAt(0).toUpperCase() + text.slice(1);
  return text;
}

function friendlyHeading(heading: string): string {
  const map: Record<string, string> = {
    'CHICKEN': 'Chicken Body',
    'WING': 'Wings (make 2)',
    'BEAK': 'Beak',
    'LEG': 'Legs (make 2)',
    'LEGS': 'Legs (make 2)',
    'COCKSCOMB': 'Cockscomb (Crest)',
    'ASSEMBLY': 'Putting It Together',
    'FRONT PIECE': 'Front',
    'BACK PIECE': 'Back',
    'BODY': 'Body',
    'SLEEVES': 'Sleeves',
    'SLEEVE': 'Sleeve',
    'SLEEVE CAP': 'Sleeve Cap',
    'NECKBAND': 'Neckband',
    'FINISHING': 'Finishing',
    'INCREASE FOR ARMHOLES': 'Armhole Increases',
    'START THE PIECE HERE': 'Getting Started',
    'JUMPER - SHORT OVERVIEW OF THE PIECE': 'Overview',
    'PICK UP STITCHES AS FOLLOWS': 'Picking Up Stitches',
    'AFTER LAST TURN': 'After Last Turn',
  };
  return map[heading.toUpperCase()] || heading.charAt(0).toUpperCase() + heading.slice(1).toLowerCase();
}

function getBeginnerNote(stepNum: string, raw: string): string | null {
  if (stepNum === '1') return 'This is your starting round — take it slowly!';
  if (/fill|stuff|cotton wool/i.test(raw)) return 'Time to stuff your piece with filling before closing up.';
  if (/cut the thread|fasten/i.test(raw)) return 'Finishing up! Cut your yarn leaving a tail for sewing.';
  return null;
}
