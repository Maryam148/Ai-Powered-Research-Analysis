'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const CitationGraph = dynamic(
    () => import('@/components/citation-mesh/CitationGraph'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full">
                <span className="text-sm text-foreground/40 animate-pulse">Loading graph…</span>
            </div>
        ),
    }
)

function CitationMeshContent() {
    const params = useSearchParams()
    const paperId = params.get('paperId')
    const doi = params.get('doi')
    const title = params.get('title') || 'Unknown Paper'
    const source = params.get('source') || ''
    const backHref = params.get('back') || '/dashboard/search'

    // Citation mesh works for SS papers (by paperId) or papers with DOI (looked up via DOI:xxx)
    const isSS = source === 'semantic-scholar' || source === 'semantic_scholar'
    const hasDOI = !!doi
    const canShowGraph = (isSS && !!paperId) || (!isSS && hasDOI)
    const lookupId = isSS ? paperId! : (hasDOI ? `DOI:${doi}` : null)

    return (
        <div className="flex flex-col h-screen bg-[hsl(40,33%,96%)]">
            {/* ─── Header ─── */}
            <div className="bg-white border-b border-foreground/5 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                    <Link
                        href={backHref}
                        className="text-sm font-semibold text-foreground/50 hover:text-foreground transition-colors flex-shrink-0 flex items-center gap-1"
                    >
                        ← Back
                    </Link>
                    <div className="min-w-0">
                        <h1 className="text-sm font-bold text-foreground truncate max-w-[500px]">
                            {title}
                        </h1>
                        <p className="text-[11px] text-foreground/35 mt-0.5">
                            Citation Mesh — Explore connected research
                        </p>
                    </div>
                </div>

                {/* Legend */}
                <div className="hidden md:flex items-center gap-5 text-[11px] font-semibold text-foreground/50 flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#1a1a1a] inline-block" />
                        Center Paper
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
                        References
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                        Cited By
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                        Expanded
                    </div>
                </div>
            </div>

            {/* ─── Hint bar ─── */}
            <div className="px-6 py-2 bg-indigo-50 border-b border-indigo-100 text-[11px] text-indigo-700 font-medium flex items-center gap-2 flex-shrink-0">
                <span>💡</span>
                <span>Drag nodes to reposition · Scroll to zoom · Click any node to expand its references</span>
            </div>

            {/* ─── Graph ─── */}
            <div className="flex-1 relative overflow-hidden">
                {canShowGraph && lookupId ? (
                    <CitationGraph paperId={lookupId} paperTitle={title} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
                        <span className="text-5xl">🕸️</span>
                        <p className="text-sm font-semibold text-foreground/50 max-w-[400px]">
                            {!paperId && !doi
                                ? 'No paper ID was provided. Please open the Citation Mesh from a search result or library paper.'
                                : 'Citation mesh is available for Semantic Scholar papers or papers with a DOI.'}
                        </p>
                        <Link
                            href="/dashboard/search"
                            className="text-sm text-indigo-500 hover:text-indigo-600 font-semibold transition-colors"
                        >
                            Search for papers →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function CitationMeshPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-screen">
                    <span className="text-sm text-foreground/40 animate-pulse">Loading…</span>
                </div>
            }
        >
            <CitationMeshContent />
        </Suspense>
    )
}
