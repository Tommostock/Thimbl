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
  const raw = gaugeMatch[1].trim();
  if (raw.length < 5) return null;

  // Take only the first meaningful line (the actual gauge), strip notes and bleeding headings
  const lines = raw.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const cleanLines: string[] = [];
  for (const line of lines) {
    // Stop at NOTE:, section headings (ALL CAPS), or unrelated content
    if (/^NOTE:/i.test(line)) break;
    if (/^[A-Z][A-Z\s-]{2,}:?\s*$/.test(line) && !/stitch|cm|mm|row|needle/i.test(line)) break;
    cleanLines.push(line);
    if (cleanLines.length >= 2) break; // Gauge is usually 1-2 lines max
  }

  const desc = cleanLines.join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (desc.length < 5) return null;
  return { description: desc };
}

function cleanMaterialDetails(details: string): string {
  return details
    // Strip "(belongs to yarn group X)"
    .replace(/\(belongs to yarn group [A-Z]\)/gi, '')
    // Strip "from Garnstudio"
    .replace(/from Garnstudio/gi, '')
    // Strip "And use:" at end
    .replace(/\band use:\s*$/gi, '')
    // Clean up colour format: "100-100 g colour 3609, red" → "100-100g in red (colour 3609)"
    .replace(/(\d[\d-]*)\s*g\s+colou?r\s+(\d+),?\s*(.+)/gi, (_m, qty, code, name) => `${qty}g in ${name.trim()} (colour ${code})`)
    // Simpler: "colour 03, Sand" → "Sand (colour 03)"
    .replace(/colou?r\s+(\d+),?\s*(.+)/gi, (_m, code, name) => `${name.trim()} (colour ${code})`)
    // Clean excessive whitespace
    .replace(/\s{2,}/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

function extractMaterials(text: string): PatternMaterial[] {
  const materials: PatternMaterial[] = [];

  const yarnMatch = text.match(
    /\nYARN:\s*\n([\s\S]*?)(?=\n\s*(?:NEEDLES?:|CROCHET HOOK))/i,
  );
  if (!yarnMatch) return [];

  const block = yarnMatch[1].trim();
  const lines = block.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  let currentName = '';
  let currentDetails: string[] = [];

  for (const line of lines) {
    const dropsMatch = line.match(/^(DROPS\s+[\w\s-]+)/i);
    if (dropsMatch) {
      if (currentName) {
        materials.push({
          yarnName: currentName,
          details: cleanMaterialDetails(currentDetails.join('\n')),
        });
      }
      currentName = dropsMatch[1].trim();
      const rest = line.replace(dropsMatch[0], '').trim();
      currentDetails = rest ? [rest] : [];
    } else {
      currentDetails.push(line);
    }
  }
  if (currentName) {
    materials.push({
      yarnName: currentName,
      details: cleanMaterialDetails(currentDetails.join('\n')),
    });
  } else if (lines.length > 0) {
    materials.push({ yarnName: 'Yarn', details: cleanMaterialDetails(lines.join('\n')) });
  }

  return materials;
}

function cleanNeedleLine(line: string): string {
  return line
    // "DROPS CIRCULAR NEEDLE SIZE 5 mm: Length 40 and 80 cm" → "5mm circular needle (40 & 80cm)"
    .replace(
      /DROPS\s+CIRCULAR\s+NEEDLES?\s+SIZE\s+([\d.]+)\s*MM[:\s]*Length[:\s]*([\d\s,andcm]+)/gi,
      (_m, size, lengths) => {
        const clean = lengths.replace(/\s+/g, '').replace(/and/g, ' & ').replace(/cm/g, '').trim();
        return `${size}mm circular needle (${clean}cm)`;
      },
    )
    // "DROPS DOUBLE POINTED NEEDLES SIZE 5 MM" → "5mm double-pointed needles"
    .replace(
      /DROPS\s+DOUBLE\s+POINTED\s+NEEDLES?\s+SIZE\s+([\d.]+)\s*MM\.?/gi,
      (_m, size) => `${size}mm double-pointed needles`,
    )
    // "DROPS CABLE NEEDLE" → "Cable needle"
    .replace(/DROPS\s+CABLE\s+NEEDLE\.?/gi, 'Cable needle')
    // "DROPS CROCHET HOOK SIZE 4 MM" → "4mm crochet hook"
    .replace(
      /DROPS\s+CROCHET\s+HOOKS?\s+SIZE\s+([\d.]+)\s*MM\.?/gi,
      (_m, size) => `${size}mm crochet hook`,
    )
    // Generic "DROPS ... SIZE X MM" fallback
    .replace(
      /DROPS\s+([\w\s-]+?)\s+SIZE\s+([\d.]+)\s*MM\.?/gi,
      (_m, type, size) => `${size}mm ${type.trim().toLowerCase()}`,
    )
    .replace(/\.\s*$/, '')
    .trim();
}

function extractNeedles(text: string): string[] {
  const needleMatch = text.match(
    /\nNEEDLES?:\s*\n([\s\S]*?)(?=\n\s*(?:KNITTING TENSION|CROCHET TENSION|TENSION|GAUGE|Accessories|\n\n))/i,
  );
  let lines: string[] = [];
  if (needleMatch) {
    lines = needleMatch[1].split('\n').map((l) => l.trim()).filter((l) => l.length > 3 && !l.startsWith('---'));
  } else {
    const hookMatch = text.match(
      /\nCROCHET HOOK[^:]*:\s*\n?([\s\S]*?)(?=\n\s*(?:KNITTING TENSION|CROCHET TENSION|TENSION|GAUGE|Accessories|\n\n))/i,
    );
    if (hookMatch) {
      lines = hookMatch[1].split('\n').map((l) => l.trim()).filter((l) => l.length > 3 && !l.startsWith('---'));
    }
  }

  return lines
    .map(cleanNeedleLine)
    // Filter out "magic loop" advice lines — those aren't tools
    .filter((l) => !/magic loop/i.test(l) && l.length > 2);
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
