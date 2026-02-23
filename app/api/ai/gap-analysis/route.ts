import { NextRequest, NextResponse } from 'next/server';
import { generateGapAnalysis } from '@/lib/services/ai/gemini-service';

export async function POST(request: NextRequest) {
  try {
    const { papers } = await request.json();

    if (!papers || !Array.isArray(papers) || papers.length === 0) {
      return NextResponse.json(
        { error: 'Papers array is required' },
        { status: 400 }
      );
    }

    const gapAnalysis = await generateGapAnalysis(papers);

    return NextResponse.json({ gapAnalysis });
  } catch (error) {
    console.error('Gap analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate gap analysis' },
      { status: 500 }
    );
  }
}
