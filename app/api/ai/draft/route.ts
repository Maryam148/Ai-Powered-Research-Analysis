import { NextRequest, NextResponse } from 'next/server'
import { generateResearchDraft } from '@/lib/services/ai/gemini-service'

export async function POST(request: NextRequest) {
    try {
        const { papers } = await request.json()

        if (!papers || !Array.isArray(papers) || papers.length < 2) {
            return NextResponse.json(
                { error: 'At least 2 papers are required' },
                { status: 400 }
            )
        }

        const draft = await generateResearchDraft(papers)
        return NextResponse.json({ draft })
    } catch (error) {
        console.error('Draft generation error:', error)
        return NextResponse.json({ error: 'Failed to generate draft' }, { status: 500 })
    }
}
