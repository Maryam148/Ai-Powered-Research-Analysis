'use client'

import { useState, useCallback } from 'react'

interface TrendItem { name: string; count: number; description?: string }
interface YearPoint { year: number; count: number }

interface TrendsData {
    topics: TrendItem[]
    techniques: TrendItem[]
    keywords: TrendItem[]
    domains: TrendItem[]
    yearDistribution: YearPoint[]
    totalPapers: number
    query: string
}

const TOPIC_COLORS = ['#FFF3B0', '#D4F5E9', '#FFE0C4', '#F3E8FF', '#FFF0F0', '#E0F0FF']

export default function DashboardTrends() {
    const [query, setQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState<TrendsData | null>(null)
    const [error, setError] = useState('')

    const handleSearch = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!query.trim()) return
        setIsLoading(true)
        setError('')
        setData(null)
        try {
            const res = await fetch(`/api/papers/trends?query=${encodeURIComponent(query)}`)
            if (!res.ok) throw new Error('Failed to analyze trends')
            const result = await res.json()
            if (result.error) throw new Error(result.error)
            setData(result)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }, [query])

    const maxYear = data?.yearDistribution?.length
        ? Math.max(...data.yearDistribution.map(d => d.count))
        : 1

    const maxTechCount = data?.techniques?.length
        ? Math.max(...data.techniques.map(t => t.count))
        : 1

    const maxKeyCount = data?.keywords?.length
        ? Math.max(...data.keywords.map(k => k.count))
        : 1

    return (
        <div className="p-6 lg:p-8 max-w-[1000px]">
            <h1 className="text-2xl font-bold text-foreground mb-1">Research Trends</h1>
            <p className="text-sm text-foreground/35 mb-6">Enter a topic to analyze trends across recent academic papers</p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                <div className="flex-1 flex items-center gap-3 bg-white border-2 border-foreground/8 rounded-2xl px-5 py-3.5 shadow-sm focus-within:border-[hsl(45,100%,50%)] focus-within:shadow-md transition-all">
                    <span className="text-foreground/25">📈</span>
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Enter a research topic (e.g. 'Transformer models', 'CRISPR', 'Federated Learning')…"
                        className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-foreground/25"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="px-6 rounded-2xl bg-foreground text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                >
                    {isLoading ? 'Analyzing…' : 'Analyze'}
                </button>
            </form>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>
            )}

            {/* Loading skeleton */}
            {isLoading && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border-2 border-foreground/6 p-6 shadow-sm">
                        <div className="h-4 w-40 bg-foreground/10 rounded animate-pulse mb-5" />
                        <div className="flex items-end gap-4 h-[180px]">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="flex-1 bg-foreground/10 rounded-t-lg animate-pulse" style={{ height: `${30 + Math.random() * 70}%` }} />
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-foreground/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && !data && !error && (
                <div className="text-center py-20 border-2 border-dashed border-foreground/10 rounded-2xl bg-white">
                    <span className="text-5xl mb-4 block">📊</span>
                    <p className="text-foreground/40 font-semibold text-sm mb-2">Enter a research topic above to see real trends</p>
                    <p className="text-foreground/25 text-xs">Powered by Semantic Scholar + Gemini AI analysis</p>
                </div>
            )}

            {/* Results */}
            {data && !isLoading && (
                <div className="space-y-8">
                    {/* Header stat */}
                    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-foreground/6 shadow-sm">
                        <div className="w-12 h-12 bg-[#FFF3B0] rounded-xl flex items-center justify-center text-2xl">📊</div>
                        <div>
                            <p className="text-lg font-bold text-foreground">{data.totalPapers} papers analyzed</p>
                            <p className="text-[12px] text-foreground/40">for &quot;{data.query}&quot;</p>
                        </div>
                    </div>

                    {/* Publication Trend Chart */}
                    {data.yearDistribution && data.yearDistribution.length > 0 && (
                        <div className="bg-white rounded-2xl border-2 border-foreground/6 p-6 shadow-sm">
                            <h3 className="font-bold text-foreground mb-5">Publication Volume by Year</h3>
                            <div className="flex items-end gap-2 h-[180px] overflow-x-auto pb-6">
                                {data.yearDistribution.map(d => (
                                    <div key={d.year} className="flex flex-col items-center flex-shrink-0 w-10">
                                        <span className="text-[10px] text-foreground/40 mb-1 font-semibold">{d.count}</span>
                                        <div
                                            className="w-full bg-[hsl(45,100%,65%)] rounded-t-lg hover:bg-[hsl(45,100%,50%)] transition-colors cursor-default"
                                            style={{ height: `${Math.max(4, (d.count / maxYear) * 140)}px` }}
                                        />
                                        <span className="text-[9px] text-foreground/30 mt-2 font-medium">{d.year}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Topics grid */}
                    {data.topics && data.topics.length > 0 && (
                        <>
                            <h3 className="font-bold text-foreground text-lg">Trending Topics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.topics.map((item, i) => (
                                    <div
                                        key={item.name}
                                        className="rounded-2xl border-2 border-foreground/6 p-5 hover:shadow-md hover:translate-y-[-1px] transition-all"
                                        style={{ backgroundColor: TOPIC_COLORS[i % TOPIC_COLORS.length] }}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="text-[10px] text-foreground/30 font-bold mb-1">#{i + 1} TOPIC</p>
                                                <h4 className="text-sm font-bold text-foreground">{item.name}</h4>
                                            </div>
                                            <span className="text-[12px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
                                                {item.count} papers
                                            </span>
                                        </div>
                                        {item.description && (
                                            <p className="text-[12px] text-foreground/45 leading-relaxed">{item.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Techniques */}
                        {data.techniques && data.techniques.length > 0 && (
                            <div className="bg-white rounded-2xl border-2 border-foreground/6 p-5 shadow-sm">
                                <h3 className="font-bold text-foreground mb-4">Common Techniques</h3>
                                <div className="space-y-3">
                                    {data.techniques.map(t => (
                                        <div key={t.name}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[13px] font-medium text-foreground">{t.name}</span>
                                                <span className="text-[11px] text-foreground/40 font-semibold">{t.count}</span>
                                            </div>
                                            <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-400 rounded-full transition-all"
                                                    style={{ width: `${(t.count / maxTechCount) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Keywords */}
                        {data.keywords && data.keywords.length > 0 && (
                            <div className="bg-white rounded-2xl border-2 border-foreground/6 p-5 shadow-sm">
                                <h3 className="font-bold text-foreground mb-4">Common Keywords</h3>
                                <div className="flex flex-wrap gap-2">
                                    {data.keywords.map(k => {
                                        const size = Math.max(0.75, (k.count / maxKeyCount) * 1.4)
                                        return (
                                            <span
                                                key={k.name}
                                                className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-100 cursor-default hover:bg-amber-100 transition-colors"
                                                style={{ fontSize: `${size}rem` }}
                                                title={`Frequency: ${k.count}`}
                                            >
                                                {k.name}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Domains */}
                    {data.domains && data.domains.length > 0 && (
                        <div className="bg-white rounded-2xl border-2 border-foreground/6 p-5 shadow-sm">
                            <h3 className="font-bold text-foreground mb-4">Application Domains</h3>
                            <div className="flex flex-wrap gap-3">
                                {data.domains.map(d => (
                                    <div key={d.name} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground/[0.04] border border-foreground/6">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                        <span className="text-sm font-medium text-foreground">{d.name}</span>
                                        <span className="text-[11px] text-foreground/40 font-bold">{d.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
