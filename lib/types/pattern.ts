/**
 * Types for parsed DROPS Design pattern content.
 * These represent the rich data extracted from pattern pages.
 */

export interface ParsedPatternContent {
  patternId: string;
  title: string;
  sizes: string[];
  gauge: PatternGauge | null;
  materials: PatternMaterial[];
  needles: string[];
  accessories: string[];
  sections: PatternSection[];
  images: PatternImage[];
  tips: string[];
  rawInstructionsHtml: string;
  fetchedAt: string;
  sourceUrl: string;
}

export interface PatternGauge {
  description: string;
}

export interface PatternMaterial {
  yarnName: string;
  details: string;
}

export interface PatternSection {
  heading: string;
  content: string;
  order: number;
}

export interface PatternImage {
  url: string;
  alt: string;
}
