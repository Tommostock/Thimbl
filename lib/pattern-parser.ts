import * as cheerio from 'cheerio';
import type {
  ParsedPatternContent,
  PatternMaterial,
  PatternSection,
  PatternImage,
} from '@/lib/types/pattern';

/**
 * Parse a DROPS Design pattern page HTML into structured content.
 * Falls back gracefully if parsing fails — always returns rawInstructionsHtml.
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
    $('title').text().replace(' - Free knitting patterns', '').trim();

  // --- Images ---
  const images: PatternImage[] = [];
  const seenUrls = new Set<string>();
  $('img').each((_, el) => {
    const src = $(el).attr('src') || '';
    if (
      src.includes('images.garnstudio.com/drops/mag') &&
      !seenUrls.has(src) &&
      !src.includes('icon') &&
      !src.includes('logo')
    ) {
      seenUrls.add(src);
      images.push({
        url: src.startsWith('//') ? `https:${src}` : src,
        alt: $(el).attr('alt') || title,
      });
    }
  });

  // --- Raw pattern text ---
  const patternTextEl = $('#pattern_text');
  const rawInstructionsHtml = patternTextEl.html() || '';
  const rawText = patternTextEl.text() || $('body').text();

  // --- Sizes ---
  const sizes = extractSizes(rawText);

  // --- Gauge ---
  const gaugeMatch = rawText.match(
    /(\d+)\s*(?:stitches?|st|dc).*?(?:and|x)\s*(\d+)\s*rows?.*?=\s*10\s*x\s*10\s*cm/i,
  );
  const gaugeBlock = rawText.match(
    /(?:TENSION|GAUGE|KNITTING TENSION|CROCHET TENSION)[:\s]*([\s\S]*?)(?=\n\s*\n|NEEDLE|HOOK|CROCHET HOOK|YARN|PATTERN|$)/i,
  );
  const gauge = gaugeMatch || gaugeBlock
    ? { description: gaugeBlock ? gaugeBlock[1].trim() : gaugeMatch![0] }
    : null;

  // --- Materials ---
  const materials = extractMaterials(rawText);

  // --- Needles / Hooks ---
  const needles = extractNeedles(rawText);

  // --- Tips ---
  const tips = extractTips(rawText);

  // --- Instruction sections ---
  const sections = extractSections(rawText);

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

function extractSizes(text: string): string[] {
  // Look for size listings like "S - M - L - XL" or "XS, S, M, L"
  const sizeMatch = text.match(
    /(?:SIZE|SIZES?)[:\s]*((?:(?:XS|S|M|L|XL|XXL|XXXL|[0-9/]+(?:\s*(?:years?|months?|cm))?)\s*[-–,]\s*)+(?:XS|S|M|L|XL|XXL|XXXL|[0-9/]+(?:\s*(?:years?|months?|cm))?))/i,
  );
  if (sizeMatch) {
    return sizeMatch[1]
      .split(/\s*[-–,]\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  // Fallback: look for common size patterns in the text
  const commonSizes = text.match(
    /\b(XS|S|M|L|XL|XXL|XXXL)\s*[-–]\s*(XS|S|M|L|XL|XXL|XXXL)\b/,
  );
  if (commonSizes) {
    const all = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    const start = all.indexOf(commonSizes[1]);
    const end = all.indexOf(commonSizes[2]);
    if (start >= 0 && end >= start) return all.slice(start, end + 1);
  }
  return [];
}

function extractMaterials(text: string): PatternMaterial[] {
  const materials: PatternMaterial[] = [];

  // Match DROPS yarn names
  const yarnSection = text.match(
    /(?:YARN|MATERIALS?)[:\s]*([\s\S]*?)(?=\n\s*(?:NEEDLE|HOOK|CROCHET HOOK|TENSION|GAUGE|KNITTING TIP|PATTERN|$))/i,
  );
  if (yarnSection) {
    const block = yarnSection[1];
    // Split by DROPS yarn name mentions
    const yarnMatches = block.match(/DROPS\s+[\w\s-]+(?:\([\s\S]*?\))?[^]*?(?=DROPS\s+[\w-]|$)/gi);
    if (yarnMatches) {
      for (const match of yarnMatches) {
        const lines = match.trim();
        if (lines.length < 5) continue;
        const nameMatch = lines.match(/^(DROPS\s+[\w\s-]+)/i);
        materials.push({
          yarnName: nameMatch ? nameMatch[1].trim() : 'Yarn',
          details: lines.replace(nameMatch?.[0] ?? '', '').trim(),
        });
      }
    }
    if (materials.length === 0 && block.trim().length > 5) {
      materials.push({ yarnName: 'Yarn', details: block.trim().slice(0, 500) });
    }
  }

  return materials;
}

function extractNeedles(text: string): string[] {
  const needles: string[] = [];
  const needleSection = text.match(
    /(?:NEEDLE|HOOK|CROCHET HOOK|KNITTING NEEDLES?)[:\s]*([\s\S]*?)(?=\n\s*(?:TENSION|GAUGE|YARN|PATTERN|KNITTING TIP|CROCHET TIP|$))/i,
  );
  if (needleSection) {
    const lines = needleSection[1]
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 3);
    needles.push(...lines.slice(0, 8));
  }
  return needles;
}

function extractTips(text: string): string[] {
  const tips: string[] = [];
  const tipRegex =
    /(?:KNITTING TIP|CROCHET TIP|TIP|NOTE|IMPORTANT)[:\s]*([\s\S]*?)(?=\n\s*(?:KNITTING TIP|CROCHET TIP|TIP|NOTE|FRONT|BACK|BODY|SLEEVE|PATTERN|ROW|ROUND|$))/gi;
  let match;
  while ((match = tipRegex.exec(text)) !== null) {
    const tip = match[1].trim();
    if (tip.length > 10 && tip.length < 2000) {
      tips.push(tip);
    }
  }
  return tips;
}

function extractSections(text: string): PatternSection[] {
  const sections: PatternSection[] = [];

  // Common section headings in DROPS patterns (all-caps, sometimes with colon)
  const sectionRegex =
    /\n\s*((?:FRONT PIECE|BACK PIECE|BODY|SLEEVE|SLEEVES|LEFT SLEEVE|RIGHT SLEEVE|ASSEMBLY|FINISHING|NECKBAND|NECK|COLLAR|POCKET|POCKETS|HOOD|BORDER|RIBBING|HEM|WAISTBAND|YOKE|SHOULDER|ARMHOLE|INCREASE FOR ARMHOLES?|WINGS?|BEAK|LEGS?|COCKSCOMB|HEAD|TAIL|EARS?|ARMS?|FEET|FOOT|SOLE|TOE|HEEL|CUFF|THUMB|FINGERS?|MAIN BODY|UPPER BODY|LOWER BODY|SKIRT|TOP|BOTTOM|FRONT|BACK|SIDE|PANEL|MOTIF|CHART|DIAGRAM|GUSSET|DECREASE|BUTTON BAND|BUTTONHOLE BAND|FLAP|STRAP|HANDLE|BASE|LID|CHICKEN BODY|ROUND [0-9]+))[:\s]*([\s\S]*?)(?=\n\s*(?:FRONT PIECE|BACK PIECE|BODY|SLEEVE|SLEEVES|LEFT SLEEVE|RIGHT SLEEVE|ASSEMBLY|FINISHING|NECKBAND|NECK|COLLAR|POCKET|POCKETS|HOOD|BORDER|RIBBING|HEM|WAISTBAND|YOKE|SHOULDER|ARMHOLE|INCREASE FOR ARMHOLES?|WINGS?|BEAK|LEGS?|COCKSCOMB|HEAD|TAIL|EARS?|ARMS?|FEET|FOOT|SOLE|TOE|HEEL|CUFF|THUMB|FINGERS?|MAIN BODY|UPPER BODY|LOWER BODY|SKIRT|TOP|BOTTOM|FRONT|BACK|SIDE|PANEL|MOTIF|CHART|DIAGRAM|GUSSET|DECREASE|BUTTON BAND|BUTTONHOLE BAND|FLAP|STRAP|HANDLE|BASE|LID|CHICKEN BODY)[:\s]|$)/gi;

  let match;
  let order = 0;
  while ((match = sectionRegex.exec(text)) !== null) {
    const heading = match[1].trim();
    const content = match[2].trim();
    if (content.length > 10) {
      sections.push({ heading, content, order: order++ });
    }
  }

  // Fallback: if no sections found, look for ROW/ROUND-based content
  if (sections.length === 0) {
    const rowContent = text.match(
      /(?:ROW|ROUND)\s+1[\s\S]*$/i,
    );
    if (rowContent) {
      sections.push({
        heading: 'Instructions',
        content: rowContent[0].trim().slice(0, 10000),
        order: 0,
      });
    }
  }

  // Final fallback: use the main block of text after materials/gauge
  if (sections.length === 0) {
    const afterSetup = text.match(
      /(?:TENSION|GAUGE|NEEDLE|HOOK)[\s\S]*?\n\n([\s\S]+)/i,
    );
    if (afterSetup && afterSetup[1].trim().length > 50) {
      sections.push({
        heading: 'Pattern Instructions',
        content: afterSetup[1].trim().slice(0, 10000),
        order: 0,
      });
    }
  }

  return sections;
}
