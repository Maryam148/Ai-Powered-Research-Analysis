'use client'

import { useState } from 'react'
import { useNotification } from '@/components/ui/notifications'
import { useRouter } from 'next/navigation'

interface Paper {
    id: string;
    title: string;
    authors: { name: string }[];
    abstract: string;
    year: number;
    citationCount: number;
    url: string;
    source: string;
    aiSummary?: string;
}

export default function DashboardSearch() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Paper[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [savingId, setSavingId] = useState<string | null>(null)
    const [activeFilter, setActiveFilter] = useState('All')
    const { showNotification } = useNotification()
    const router = useRouter()

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!query.trim()) return

        setIsLoading(true)
        setError('')
        setResults([])

        try {
            const response = await fetch(`/api/papers/search?query=${encodeURIComponent(query)}`)

            if (!response.ok) {
                throw new Error('Search failed to initialize')
            }

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (!reader) throw new Error('No reader')

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.slice(6))

                        if (data.type === 'complete' || data.type === 'done') {
                            continue
                        }

                        // It's a paper
                        setResults(prev => {
                            // Avoid duplicates
                            if (prev.some(p => p.id === data.id)) return prev
                            return [...prev, data]
                        })
                    }
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Search error:', err)
            setError(err.message || 'An error occurred during search')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveAndViewInsights = async (paper: Paper) => {
        setSavingId(paper.id)
        try {
            // First save the paper
            const response = await fetch('/api/papers/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paper })
            })

            if (!response.ok) throw new Error('Failed to save paper')

            showNotification('Paper saved. Redirecting to insights...', 'success')

            // Then navigate to the insights page
            router.push(`/dashboard/library/${paper.id}`)
        } catch (err) {
            console.error('Save error:', err)
            showNotification('Failed to save paper.', 'error')
        } finally {
            setSavingId(null)
        }
    }

    const filteredResults = results.filter(paper => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Semantic Scholar') return paper.source === 'semantic_scholar';
        if (activeFilter === 'OpenAlex') return paper.source === 'openalex';
        if (activeFilter === 'CrossRef') return paper.source === 'crossref';
        if (activeFilter === '2024+') return (paper.year || 0) >= 2024;
        if (activeFilter === 'High Citations') return (paper.citationCount || 0) > 50;
        return true;
    });

    return (
        <div className="p-6 lg:p-8 max-w-[1000px]">
            <h1 className="text-2xl font-bold text-foreground mb-1">Search Papers</h1>
            <p className="text-sm text-foreground/35 mb-6">Discover research from millions of academic papers via Semantic Scholar, OpenAlex, and CrossRef</p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                <div className="flex-1 flex items-center gap-3 bg-white border-2 border-foreground/8 rounded-2xl px-5 py-3.5 shadow-sm focus-within:border-[hsl(45,100%,50%)] focus-within:shadow-md transition-all">
                    <span className="text-foreground/25 text-lg">🔍</span>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by topic, author, or keyword (e.g., 'Transformer Models')..."
                        className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-foreground/25"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="px-6 rounded-2xl bg-foreground text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                >
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {/* Error State */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['All', 'Semantic Scholar', 'OpenAlex', 'CrossRef', '2024+', 'High Citations'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`px-4 py-2 rounded-xl text-[12px] font-semibold border-2 transition-all whitespace-nowrap ${activeFilter === f
                            ? 'bg-foreground text-white border-foreground shadow-sm'
                            : 'bg-white border-foreground/6 text-foreground/45 hover:bg-foreground/5 hover:text-foreground/60'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Results */}
            <div className="space-y-4">
                {results.length === 0 && !isLoading && !error && query && (
                    <p className="text-sm text-foreground/40 text-center py-10">No results found for &quot;{query}&quot;.</p>
                )}

                {results.length === 0 && !isLoading && !query && (
                    <div className="text-center py-16 border-2 border-dashed border-foreground/10 rounded-2xl bg-white">
                        <span className="text-4xl mb-3 block">📚</span>
                        <p className="text-foreground/40 font-medium text-sm">Enter a query above to start searching actual papers.</p>
                    </div>
                )}

                {filteredResults.map((paper) => (
                    <div key={paper.id} className="bg-white rounded-2xl border-2 border-foreground/6 p-5 shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all group">
                        <a href={paper.url} target="_blank" rel="noopener noreferrer" className="block">
                            <h3 className="text-sm font-bold text-foreground group-hover:text-[hsl(45,100%,45%)] mb-1.5 transition-colors">{paper.title}</h3>
                            <p className="text-[12px] text-foreground/35 mb-2 truncate">
                                {paper.authors?.map(a => a.name).join(', ')} · {paper.year || 'Unknown Year'}
                            </p>
                            {paper.abstract && (
                                <p className="text-[13px] text-foreground/45 leading-relaxed line-clamp-3 mb-3">{paper.abstract}</p>
                            )}
                        </a>

                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-foreground/5">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-foreground/5 text-foreground/60 uppercase tracking-wider">
                                {paper.source}
                            </span>
                            {paper.citationCount > 0 && (
                                <span className="text-[11px] font-semibold text-foreground/40">📄 {paper.citationCount} citations</span>
                            )}
                            <div className="flex-1"></div>

                            <div className="flex-1"></div>

                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSaveAndViewInsights(paper); }}
                                disabled={savingId === paper.id || !!paper.aiSummary}
                                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors ${!paper.abstract ? 'text-foreground/30 pointer-events-none' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                    }`}
                                title={!paper.abstract ? "No abstract available" : "Save & Generate Insights"}
                            >
                                {savingId === paper.id ? 'Redirecting...' : 'View Insights 🧠'}
                            </button>
                        </div>
                    </div>
                ))}

                {isLoading && results.length > 0 && (
                    <div className="text-center py-4">
                        <span className="text-[12px] font-semibold text-foreground/40 animate-pulse">Loading more results...</span>
                    </div>
                )}
            </div>
        </div>
    )
}
