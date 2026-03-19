/**
 * Transforms raw DROPS Design pattern text into beginner-friendly,
 * well-structured instructions.
 *
 * DROPS uses UK crochet terminology:
 *   UK "dc" (double crochet)  = US "sc" (single crochet)
 *   UK "tr" (treble)          = US "dc" (double crochet)
 *   UK "htr" (half treble)    = US "hdc" (half double crochet)
 *
 * This formatter keeps UK terms but expands abbreviations and
 * rewrites instructions in clearer, friendlier language.
 */

export interface FormattedStep {
  /** Round/Row number, or null for prose instructions */
  stepNumber: string | null;
  /** The main instruction text, rewritten for clarity */
  instruction: string;
  /** Stitch count at end of step, if any */
  stitchCount: string | null;
  /** Optional helpful note for beginners */
  note: string | null;
}

export interface FormattedSection {
  heading: string;
  description: string | null;
  steps: FormattedStep[];
}

// ---- Abbreviation expander ----

const ABBREVIATIONS: Record<string, string> = {
  'dc': 'double crochet',
  'ch': 'chain',
  'sl st': 'slip stitch',
  'sc': 'single crochet',
  'tr': 'treble',
  'htr': 'half treble',
  'YO': 'yarn over',
  'tog': 'together',
  'st': 'stitch',
  'sts': 'stitches',
  'beg': 'beginning',
  'rep': 'repeat',
  'approx': 'approximately',
  'no': 'number',
};

export const GLOSSARY: { term: string; definition: string }[] = [
  { term: 'dc (double crochet)', definition: 'Insert hook, yarn over, pull through, yarn over, pull through both loops. (US equivalent: single crochet)' },
  { term: 'ch (chain)', definition: 'Yarn over and pull through the loop on your hook.' },
  { term: 'sl st (slip stitch)', definition: 'Insert hook, yarn over, pull through both the stitch and the loop on your hook in one motion.' },
  { term: 'Magic circle', definition: 'A technique to start crocheting in the round without leaving a hole in the centre. Wind yarn around your finger, crochet into the loop, then pull tight.' },
  { term: 'Yarn over (YO)', definition: 'Wrap the yarn over your hook from back to front.' },
  { term: '2 dc tog', definition: 'A decrease: start a double crochet in the next stitch but don\'t finish it, then start another in the following stitch, yarn over and pull through all loops. This turns 2 stitches into 1.' },
  { term: 'Stitch marker', definition: 'A small clip or piece of yarn placed to mark the beginning of a round or an important position.' },
];

/**
 * Format a raw section of DROPS instructions into structured, beginner-friendly steps.
 */
export function formatSection(heading: string, rawContent: string): FormattedSection {
  const lines = rawContent.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  const steps: FormattedStep[] = [];
  let description: string | null = null;
  const descLines: string[] = [];

  for (const line of lines) {
    // Match ROUND or ROW lines
    const roundMatch = line.match(/^(?:ROUND|ROW)\s+([\d-]+)\s*:\s*(.*)/i);
    if (roundMatch) {
      // If we had description lines before the first step, save them
      if (steps.length === 0 && descLines.length > 0) {
        description = rewriteProse(descLines.join(' '));
        descLines.length = 0;
      }

      const stepNum = roundMatch[1];
      const rawInstruction = roundMatch[2];
      steps.push(parseStepInstruction(stepNum, rawInstruction, heading));
    } else {
      // Prose line — either a description or a standalone instruction
      if (steps.length === 0) {
        descLines.push(line);
      } else {
        // Append to previous step or create a prose step
        steps.push({
          stepNumber: null,
          instruction: rewriteProse(line),
          stitchCount: null,
          note: null,
        });
      }
    }
  }

  // If no rounds/rows found, all content is prose
  if (steps.length === 0 && descLines.length > 0) {
    const proseText = descLines.join('\n');
    // Split into sentences for better readability
    const sentences = proseText.split(/\.\s+/).filter((s) => s.trim().length > 0);
    for (const sentence of sentences) {
      steps.push({
        stepNumber: null,
        instruction: rewriteProse(sentence.trim() + (sentence.endsWith('.') ? '' : '.')),
        stitchCount: null,
        note: null,
      });
    }
  } else if (descLines.length > 0) {
    description = rewriteProse(descLines.join(' '));
  }

  return {
    heading: friendlyHeading(heading),
    description,
    steps,
  };
}

function parseStepInstruction(
  stepNum: string,
  raw: string,
  _sectionHeading: string,
): FormattedStep {
  // Extract stitch count from the end (e.g., "= 18 dc" or "= 12 dc.")
  let stitchCount: string | null = null;
  let instruction = raw;

  const countMatch = instruction.match(/=\s*(\d+)\s*(?:dc|sc|tr|htr|sts?|stitches?)\.?\s*$/i);
  if (countMatch) {
    stitchCount = `${countMatch[1]} stitches`;
    instruction = instruction.slice(0, countMatch.index).trim();
    // Remove trailing comma
    if (instruction.endsWith(',')) instruction = instruction.slice(0, -1).trim();
  }

  // Rewrite the instruction for clarity
  instruction = rewriteInstruction(instruction);

  // Add beginner notes for specific patterns
  const note = getBeginnerNote(stepNum, instruction);

  // Format the step number nicely
  const isRange = stepNum.includes('-');
  const label = isRange ? `Rounds ${stepNum}` : `Round ${stepNum}`;

  return {
    stepNumber: label,
    instruction,
    stitchCount,
    note,
  };
}

function rewriteInstruction(raw: string): string {
  let text = raw;

  // Remove references to "READ EXPLANATION ABOVE" etc.
  text = text.replace(/\s*[-–]\s*READ\s+[A-Z\s]+(?:ABOVE)?\.?\s*/gi, '. ');
  text = text.replace(/\s*[-–]\s*See\s+explanation\s+above\.?\s*/gi, '. ');

  // Expand common instruction patterns into friendlier language
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

  // Clean up repeat notation: * ... *, repeat from *-* ...
  text = text.replace(/\*\s*/g, '');
  text = text.replace(/\s*\*\s*/g, '');
  text = text.replace(/,?\s*repeat from \*-\*\s*(?:the rest of )?(?:the )?(?:round|row)/gi, ' — repeat this across the round');
  text = text.replace(/,?\s*repeat from \*-\*\s*one more time/gi, ' — repeat once more');

  // Clean up double spaces and trailing dots
  text = text.replace(/\.\s*\./g, '.').replace(/\s{2,}/g, ' ').trim();

  // Capitalize first letter
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  return text;
}

function rewriteProse(raw: string): string {
  let text = raw;

  // Remove "READ EXPLANATION ABOVE" references
  text = text.replace(/\s*[-–]\s*READ\s+[A-Z\s]+(?:ABOVE)?\.?\s*/gi, '. ');
  text = text.replace(/\s*[-–]\s*See\s+explanation\s+above\.?\s*/gi, '. ');

  // Expand abbreviations in prose
  text = text.replace(/\bdc\b/g, 'double crochet');
  text = text.replace(/\bsl st\b/g, 'slip stitch');
  text = text.replace(/\bch\b/g, 'chain');
  text = text.replace(/\bYO\b/g, 'yarn over');
  text = text.replace(/\bbeg\b/g, 'beginning');

  // Clean
  text = text.replace(/\.\s*\./g, '.').replace(/\s{2,}/g, ' ').trim();

  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  return text;
}

function friendlyHeading(heading: string): string {
  const map: Record<string, string> = {
    'CHICKEN': '🐔 Chicken Body',
    'WING': '🪽 Wings (make 2)',
    'BEAK': '🔶 Beak',
    'LEG': '🦵 Legs (make 2)',
    'LEGS': '🦵 Legs (make 2)',
    'COCKSCOMB': '👑 Cockscomb (crest)',
    'ASSEMBLY': '🧵 Putting It Together',
    'FRONT PIECE': '👕 Front',
    'BACK PIECE': '👕 Back',
    'BODY': '👕 Body',
    'SLEEVES': '💪 Sleeves',
    'SLEEVE': '💪 Sleeve',
    'SLEEVE CAP': '💪 Sleeve Cap',
    'NECKBAND': '⭕ Neckband',
    'FINISHING': '✨ Finishing',
    'INCREASE FOR ARMHOLES': '📐 Armhole Increases',
  };

  return map[heading.toUpperCase()] || heading.charAt(0).toUpperCase() + heading.slice(1).toLowerCase();
}

function getBeginnerNote(stepNum: string, _instruction: string): string | null {
  // Add helpful context notes for key steps
  if (stepNum === '1') return 'This is your starting round — take it slowly!';
  if (stepNum === '9' || stepNum === '10-17') return 'No increases here — just crochet evenly around to build the body height.';
  if (stepNum === '24') return "Nearly done! Time to stuff your piece with cotton wool before closing up.";
  return null;
}
