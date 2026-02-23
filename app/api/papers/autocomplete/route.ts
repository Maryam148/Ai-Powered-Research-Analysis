import { NextRequest, NextResponse } from 'next/server';
import { autocompleteSemanticScholar } from '@/lib/services/paper-sources/semantic-scholar';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = await autocompleteSemanticScholar(query);

  return NextResponse.json({ suggestions });
}
