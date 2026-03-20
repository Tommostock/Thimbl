import * as cheerio from 'cheerio';
import type {
  ParsedPatternContent,
  PatternMaterial,
  PatternSection,
  PatternImage,
} from '@/lib/types/pattern';

/**
 * Clean up excessive whitespace from DROPS page text.
 * Their HTML has lots of tabs and blank lines.
 */
function cleanText(text: string): string {
  return text
    .replace(/\t+/g, ' ')
    .replace(/ {2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^[ ]+/gm, '')
    .replace(/-{5,}/g, '')
    .trim();
}

/**
 * Parse a DROPS Design pattern page HTML into structured content.
 */
export function parseDropsPattern(
  html: string,
  patternId: string,
  sourceUrl: string,
): ParsedPatternContent {
  const $ = cheerio.load(html);

  // --- Title ---
  const title =
    $('h1').first().text().trim() ||
    $('title').text().replace(/ - Free .*$/, '').trim();

  // --- Images ---
  const images: PatternImage[] = [];
  const seenUrls = new Set<string>();
  $('img').each((_, el) => {
    let src = $(el).attr('src') || '';
    if (src.startsWith('//')) src = `https:${src}`;
    if (
      src.includes('images.garnstudio.com/drops/mag') &&
      !seenUrls.has(src)
    ) {
      seenUrls.add(src);
      images.push({ url: src, alt: $(el).attr('alt') || title });
    }
  });

  // --- Raw pattern text (instructions area) ---
  const patternTextEl = $('#pattern_text');
  const rawInstructionsHtml = patternTextEl.html() || '';
  const patternText = cleanText(patternTextEl.text());

  // --- Full body text (contains SIZE, YARN, NEEDLES, GAUGE above pattern_text) ---
  // Use RAW body text for metadata extraction (cleanText can mangle the structure)
  const rawBodyText = $('body').text();

  // --- Sizes (from raw body text, above pattern_text) ---
  const sizes = extractSizes(rawBodyText);

  // --- Gauge (from raw body text) ---
  const gauge = extractGauge(rawBodyText);

  // --- Materials (from raw body text) ---
  const materials = extractMaterials(rawBodyText);

  // --- Needles / Hooks (from raw body text) ---
  const needles = extractNeedles(rawBodyText);

  // --- Tips (from pattern_text) ---
  const tips = extractTips(patternText);

  // --- Instruction sections (from pattern_text, after tips) ---
  const sections = extractSections(patternText);

  return {
    patternId,
    title,
    sizes,
    gauge,
    materials,
    needles,
    accessories: [],
    sections,
    images,
    tips,
    rawInstructionsHtml,
    fetchedAt: new Date().toISOString(),
    sourceUrl,
  };
}

// ---- Extractors ----

function extractSizes(text: string): string[] {
  // Match the SIZE: line followed by the next line (which has the actual sizes)
  const sizeMatch = text.match(/SIZE:\s*\n\s*((?:XS|S|M|L|XL|XXL|XXXL|One size|[\d/]+)[^\n]*)/i);
  if (!sizeMatch) return [];

  const sizeText = sizeMatch[1].trim();
  // "XS - S - M - L - XL - XXL - XXXL" or "2/4 - 6/8 - 10/12 years"
  const parts = sizeText.split(/\s*[-–]\s*/).map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) return parts;

  // Single size
  if (sizeText.toLowerCase().includes('one size')) return ['One size'];
  return sizeText ? [sizeText] : [];
}

function extractGauge(text: string): { description: string } | null {
  const gaugeMatch = text.match(
    /\n(?:KNITTING TENSION|CROCHET TENSION)[:\s]*\n([\s\S]*?)(?=\n\s*(?:REMEMBER|PATTERN|EXPLANATION|\n\n))/i,
  );
  if (!gaugeMatch) return null;
  const desc = gaugeMatch[1].trim();
  if (desc.length < 5) return null;
  const lines = desc.split('\n').filter((l) => l.trim().length > 0);
  return { description: lines.slice(0, 3).join('\n') };
}

function extractMaterials(text: string): PatternMaterial[] {
  const materials: PatternMaterial[] = [];

  const yarnMatch = text.match(
    /\nYARN:\s*\n([\s\S]*?)(?=\n\s*(?:NEEDLES?:|CROCHET HOOK))/i,
  );
  if (!yarnMatch) return [];

  const block = yarnMatch[1].trim();
  // Split by lines, group by DROPS yarn mentions
  const lines = block.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  let currentName = '';
  let currentDetails: string[] = [];

  for (const line of lines) {
    const dropsMatch = line.match(/^(DROPS\s+[\w\s-]+)/i);
    if (dropsMatch) {
      // Save previous
      if (currentName) {
        materials.push({ yarnName: currentName, details: currentDetails.join('\n') });
      }
      currentName = dropsMatch[1].trim();
      const rest = line.replace(dropsMatch[0], '').trim();
      currentDetails = rest ? [rest] : [];
    } else {
      currentDetails.push(line);
    }
  }
  // Save last
  if (currentName) {
    materials.push({ yarnName: currentName, details: currentDetails.join('\n') });
  } else if (lines.length > 0) {
    materials.push({ yarnName: 'Yarn', details: lines.join('\n') });
  }

  return materials;
}

function extractNeedles(text: string): string[] {
  // Match NEEDLES: or CROCHET HOOK SIZE at the start of a line (not "Yarn & needles" nav text)
  const needleMatch = text.match(
    /\nNEEDLES?:\s*\n([\s\S]*?)(?=\n\s*(?:KNITTING TENSION|CROCHET TENSION|TENSION|GAUGE|Accessories|\n\n))/i,
  );
  if (needleMatch) {
    return needleMatch[1]
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 3 && !l.startsWith('---'));
  }

  // Try CROCHET HOOK SIZE format
  const hookMatch = text.match(
    /\nCROCHET HOOK[^:]*:\s*\n?([\s\S]*?)(?=\n\s*(?:KNITTING TENSION|CROCHET TENSION|TENSION|GAUGE|Accessories|\n\n))/i,
  );
  if (hookMatch) {
    return hookMatch[1]
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 3 && !l.startsWith('---'));
  }

  return [];
}

function extractTips(patternText: string): string[] {
  const tips: string[] = [];

  // Match tip blocks: KNITTING TIP:, CROCHET TIP:, INCREASE TIP:, DECREASE TIP:, CROCHET INFO:, etc.
  const tipRegex =
    /(?:KNITTING TIP|CROCHET TIP|CROCHET INFO|INCREASE TIP|DECREASE TIP|MAGIC CIRCLE|WORK IN THE ROUND[^:]*|WORKING \d+ DC TOG)[:\s]*([\s\S]*?)(?=\n\s*(?:KNITTING TIP|CROCHET TIP|CROCHET INFO|INCREASE TIP|DECREASE TIP|MAGIC CIRCLE|WORK IN THE ROUND|WORKING \d+ DC TOG|START THE PIECE|JUMPER|CARDIGAN|SWEATER|BLANKET|SCARF|HAT|CHICKEN|FRONT PIECE|BACK PIECE|BODY|SLEEVE|ASSEMBLY)[:\s]|\n\s*-{3,})/gi;

  let match;
  while ((match = tipRegex.exec(patternText)) !== null) {
    const tip = match[1].trim();
    if (tip.length > 15) {
      tips.push(tip);
    }
  }
  return tips;
}

function extractSections(patternText: string): PatternSection[] {
  const sections: PatternSection[] = [];

  // Find the "START THE PIECE HERE" marker or the first major section heading
  const startMarker = patternText.search(
    /(?:START THE PIECE|JUMPER|CARDIGAN|SWEATER|SCARF|HAT|BLANKET|CHICKEN|FRONT PIECE|BACK PIECE|BODY|SLEEVE)/i,
  );
  if (startMarker < 0 && !patternText.match(/ROUND 1|ROW 1/i)) {
    // No recognizable sections — return entire pattern text as one section
    if (patternText.length > 50) {
      sections.push({ heading: 'Pattern Instructions', content: patternText, order: 0 });
    }
    return sections;
  }

  // Get text from start marker onwards
  const instructionText = startMarker >= 0 ? patternText.slice(startMarker) : patternText;

  // Split by lines that look like section headings (ALL CAPS word(s) with colon)
  // Use a simple approach: any line that is entirely uppercase letters/spaces, ends with colon or is standalone
  const headings: { heading: string; index: number }[] = [];
  {
    const lines = instructionText.split('\n');
    let offset = 0;
    for (const line of lines) {
      const trimmed = line.trim();
      const withoutColon = trimmed.replace(/:$/, '').trim();
      if (
        withoutColon.length >= 3 &&
        withoutColon === withoutColon.toUpperCase() &&
        /^[A-Z][A-Z\s&-]*$/.test(withoutColon) &&
        !withoutColon.startsWith('ROW') &&
        !withoutColon.startsWith('ROUND') &&
        !withoutColon.startsWith('NOTE') &&
        !withoutColon.startsWith('REMEMBER')
      ) {
        headings.push({ heading: trimmed.replace(/:$/, ''), index: offset });
      }
      offset += line.length + 1;
    }
  }

  if (headings.length === 0) {
    // Last resort — just put everything as one section
    if (instructionText.length > 50) {
      sections.push({
        heading: 'Pattern Instructions',
        content: instructionText.trim(),
        order: 0,
      });
    }
    return sections;
  }

  // Headings to exclude — tips, techniques, info blocks
  const excludePattern =
    /^(TIPS?\s*(AND|&)\s*TECHNIQUES?|KNITTING TIP|CROCHET TIP|CROCHET INFO|INCREASE TIP|DECREASE TIP|MAGIC CIRCLE|WORK IN THE ROUND|WORKING \d+ DC TOG|EXPLANATION|REMEMBER|TIPS?)$/i;

  // Extract content between headings
  for (let i = 0; i < headings.length; i++) {
    // Skip tips/techniques sections entirely
    if (excludePattern.test(headings[i].heading.trim())) continue;

    const start = headings[i].index + headings[i].heading.length + 1;
    const end = i + 1 < headings.length ? headings[i + 1].index : instructionText.length;
    const content = instructionText.slice(start, end).trim();

    if (content.length > 10) {
      sections.push({
        heading: headings[i].heading,
        content,
        order: sections.length,
      });
    }
  }

  return sections;
}
