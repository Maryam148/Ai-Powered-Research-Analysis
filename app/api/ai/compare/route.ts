import { NextRequest, NextResponse } from 'next/server';
import { comparePapers } from '@/lib/services/ai/gemini-service';

export async function POST(request: NextRequest) {
  try {
    const { papers } = await request.json();

    if (!papers || !Array.isArray(papers) || papers.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 papers are required for comparison' },
        { status: 400 }
      );
    }

    const comparison = await comparePapers(papers);

    return NextResponse.json({ comparison });
  } catch (error) {
    console.error('Comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to generate comparison' },
      { status: 500 }
    );
  }
}
