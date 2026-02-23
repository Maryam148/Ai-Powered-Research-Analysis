import { NextRequest, NextResponse } from 'next/server';
import { generateSummary } from '@/lib/services/ai/gemini-service';

export async function POST(request: NextRequest) {
  try {
    const { title, abstract, authors } = await request.json();

    if (!title || !abstract) {
      return NextResponse.json(
        { error: 'Title and abstract are required' },
        { status: 400 }
      );
    }

    const summary = await generateSummary(title, abstract, authors || []);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Summary generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary', details: (error as any)?.message || String(error) },
      { status: 500 }
    );
  }
}
