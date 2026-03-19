import { NextResponse } from 'next/server';
import { getTutorialById } from '@/lib/tutorials';
import { parseDropsPattern } from '@/lib/pattern-parser';

export const revalidate = 604800; // Cache for 1 week

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const tutorial = getTutorialById(id);

  if (!tutorial) {
    return NextResponse.json({ error: 'Pattern not found' }, { status: 404 });
  }

  try {
    const response = await fetch(tutorial.sourceUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; Thimbl/1.0; craft pattern reader)',
        Accept: 'text/html',
        'Accept-Language': 'en',
      },
      next: { revalidate: 604800 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch pattern: ${response.status}` },
        { status: 502 },
      );
    }

    const html = await response.text();
    const content = parseDropsPattern(html, id, tutorial.sourceUrl);

    return NextResponse.json(content, {
      headers: {
        'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch pattern: ${(error as Error).message}` },
      { status: 502 },
    );
  }
}
