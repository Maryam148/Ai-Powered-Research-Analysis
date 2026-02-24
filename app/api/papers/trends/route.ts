import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

interface SSPaper {
    title?: string
    abstract?: string
    year?: number
    citationCount?: number
    fieldsOfStudy?: string[]
}

async function fetchPapersForQuery(query: string): Promise<SSPaper[]> {
    const params = new URLSearchParams({
        query,
        limit: '25',
        fields: 'title,abstract,year,citationCount,fieldsOfStudy',
    })
    const headers: HeadersInit = {}
    if (process.env.SEMANTIC_SCHOLAR_API_KEY) {
        headers['x-api-key'] = process.env.SEMANTIC_SCHOLAR_API_KEY
    }
    const res = await fetch(
        `https://api.semanticscholar.org/graph/v1/paper/search?${params}`,
        { headers, next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
}

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('query')
    if (!query?.trim()) {
        return NextResponse.json({ error: 'Query required' }, { status: 400 })
    }

    try {
        const papers = await fetchPapersForQuery(query)
        if (!papers.length) {
            return NextResponse.json({
                topics: [], techniques: [], keywords: [], domains: [], totalPapers: 0, query
            })
        }

        const paperSummaries = papers
            .slice(0, 20)
            .map(p =>
                `Title: ${p.title || ''}\nAbstract: ${(p.abstract || '').slice(0, 200)}\nFields: ${(p.fieldsOfStudy || []).join(', ')}\nYear: ${p.year || ''}`
            )
            .join('\n---\n')

        const prompt = `Analyze these ${papers.length} academic papers about "${query}".

${paperSummaries}

Identify trends and return ONLY valid JSON with no markdown or code blocks:
{
  "topics": [{"name": "string", "count": number, "description": "brief 1-sentence description"}],
  "techniques": [{"name": "string", "count": number}],
  "keywords": [{"name": "string", "count": number}],
  "domains": [{"name": "string", "count": number}],
  "yearRange": {"min": number, "max": number}
}

Rules: top 6 topics, top 8 techniques, top 10 keywords, top 5 domains. Base counts on actual frequency in the papers. Return only the JSON object.`

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy' })
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { maxOutputTokens: 1200, temperature: 0.2 },
        })

        const text = response.text || '{}'
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        let parsed: Record<string, unknown> = {}
        if (jsonMatch) {
            try { parsed = JSON.parse(jsonMatch[0]) } catch { /* ignore parse error */ }
        }

        // Compute year distribution from fetched papers
        const years: Record<number, number> = {}
        for (const p of papers) {
            if (p.year && p.year > 1990) {
                years[p.year] = (years[p.year] || 0) + 1
            }
        }
        const yearDist = Object.entries(years)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([year, count]) => ({ year: Number(year), count }))

        return NextResponse.json({
            ...(parsed as object),
            yearDistribution: yearDist,
            totalPapers: papers.length,
            query,
        })
    } catch (error) {
        console.error('Trends error:', error)
        return NextResponse.json({ error: 'Failed to analyze trends' }, { status: 500 })
    }
}
