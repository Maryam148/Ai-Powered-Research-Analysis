import { NextRequest, NextResponse } from 'next/server'

const SS_BASE = 'https://api.semanticscholar.org/graph/v1'
const FIELDS = 'paperId,title,authors,year,citationCount,externalIds,url'

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function ssGet(endpoint: string, retries = 3): Promise<Record<string, unknown>> {
    const headers: HeadersInit = {}
    if (process.env.SEMANTIC_SCHOLAR_API_KEY) {
        headers['x-api-key'] = process.env.SEMANTIC_SCHOLAR_API_KEY
    }

    for (let attempt = 0; attempt < retries; attempt++) {
        const res = await fetch(`${SS_BASE}${endpoint}`, {
            headers,
            cache: 'force-cache',
            next: { revalidate: 3600 },
        })

        if (res.status === 429) {
            const wait = 1500 * (attempt + 1) // 1.5s, 3s, 4.5s
            console.warn(`SS API rate limited, retrying in ${wait}ms (attempt ${attempt + 1})`)
            await sleep(wait)
            continue
        }

        if (!res.ok) {
            throw new Error(`Semantic Scholar API ${res.status}: ${endpoint}`)
        }

        return res.json() as Promise<Record<string, unknown>>
    }

    throw new Error('Semantic Scholar API: too many requests. Try again in a few seconds.')
}

interface SSPaper {
    paperId: string
    title?: string
    authors?: { name: string }[]
    year?: number
    citationCount?: number
    url?: string
    externalIds?: { DOI?: string }
}

function mapPaper(p: SSPaper, type: 'center' | 'reference' | 'citation') {
    return {
        id: p.paperId,
        title: p.title || 'Unknown Title',
        authors: (p.authors || []).map(a => a.name).join(', '),
        year: p.year || 0,
        citationCount: p.citationCount || 0,
        type,
        url: p.url || `https://www.semanticscholar.org/paper/${p.paperId}`,
        doi: p.externalIds?.DOI,
    }
}

export async function GET(request: NextRequest) {
    const paperId = request.nextUrl.searchParams.get('paperId')
    const doi = request.nextUrl.searchParams.get('doi')

    if (!paperId && !doi) {
        return NextResponse.json({ error: 'paperId or doi required' }, { status: 400 })
    }

    const lookupId = paperId || `DOI:${doi}`

    try {
        // Sequential requests with small gaps to avoid hitting rate limits
        const center = await ssGet(`/paper/${encodeURIComponent(lookupId)}?fields=${FIELDS}`)
        await sleep(350)

        const refsData = await ssGet(
            `/paper/${encodeURIComponent(lookupId)}/references?fields=${FIELDS}&limit=30`
        )
        await sleep(350)

        const citeData = await ssGet(
            `/paper/${encodeURIComponent(lookupId)}/citations?fields=${FIELDS}&limit=20`
        )

        const centerNode = mapPaper(center as unknown as SSPaper, 'center')

        const refNodes = ((refsData.data as { citedPaper: SSPaper }[]) || [])
            .map(d => d.citedPaper)
            .filter(p => p?.paperId && p.title)
            .map(p => mapPaper(p, 'reference'))

        const citeNodes = ((citeData.data as { citingPaper: SSPaper }[]) || [])
            .map(d => d.citingPaper)
            .filter(p => p?.paperId && p.title)
            .map(p => mapPaper(p, 'citation'))

        const nodes = [centerNode, ...refNodes, ...citeNodes]
        const links = [
            ...refNodes.map(n => ({ source: centerNode.id, target: n.id, type: 'reference' })),
            ...citeNodes.map(n => ({ source: n.id, target: centerNode.id, type: 'citation' })),
        ]

        return NextResponse.json({ nodes, links, paperId: centerNode.id })
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to fetch citation data'
        console.error('Citations fetch error:', msg)

        if (msg.includes('too many requests') || msg.includes('429')) {
            return NextResponse.json(
                { error: 'Semantic Scholar is rate-limiting requests. Please wait a few seconds and try again.' },
                { status: 429 }
            )
        }

        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
