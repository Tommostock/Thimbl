import { NextRequest, NextResponse } from 'next/server';

const RAVELRY_API = 'https://api.ravelry.com';

function getAuthHeader(): string | null {
  const user = process.env.RAVELRY_USERNAME;
  const pass = process.env.RAVELRY_PASSWORD;
  if (!user || !pass) return null;
  return 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');
}

// GET /api/ravelry?endpoint=/patterns/search.json&query=scarf&craft=knitting&page_size=20
export async function GET(request: NextRequest) {
  const auth = getAuthHeader();
  if (!auth) {
    return NextResponse.json(
      { error: 'Ravelry API credentials not configured' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
  }

  // Build Ravelry URL with all remaining params
  const ravelryParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') {
      ravelryParams.set(key, value);
    }
  });

  const url = `${RAVELRY_API}${endpoint}?${ravelryParams.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: auth,
        'User-Agent': 'Thimbl/1.0',
      },
      next: { revalidate: 3600 }, // cache for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Ravelry API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch from Ravelry API' },
      { status: 500 }
    );
  }
}
