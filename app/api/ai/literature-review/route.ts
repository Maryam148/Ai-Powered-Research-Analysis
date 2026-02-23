import { NextRequest, NextResponse } from 'next/server';
import { generateLiteratureReview } from '@/lib/services/ai/gemini-service';

export async function POST(request: NextRequest) {
  try {
    const { papers } = await request.json();

    if (!papers || !Array.isArray(papers) || papers.length === 0) {
      return NextResponse.json(
        { error: 'Papers array is required' },
        { status: 400 }
      );
    }

    const review = await generateLiteratureReview(papers);

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Literature review generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate literature review' },
      { status: 500 }
    );
  }
}
