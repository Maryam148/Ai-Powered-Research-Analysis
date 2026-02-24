'use client'

import { useState, useRef, useEffect } from 'react'
import { useNotification } from '@/components/ui/notifications'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAutocomplete } from '@/lib/hooks/useAutocomplete'

interface Paper {
    id: string
    title: string
    authors: { name: string }[]
    abstract: string
    year: number
    citationCount: number
    url: string
    source: string
    doi?: string
    aiSummary?: string
}

const FILTERS = ['All', 'Semantic Scholar', 'OpenAlex', 'CrossRef', '2024+', 'High Citations']

export default function DashboardSearch() {
    const [query, setQuery] = useState('')
    const [inputValue, setInputValue] = useState('')
    const [results, setResults] = useState<Paper[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [savingId, setSavingId] = useState<string | null>(null)
    const [activeFilter, setActiveFilter] = useState('All')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)
    const { showNotification } = useNotification()
    const router = useRouter()

    const { suggestions, isLoading: loadingSuggestions } = useAutocomplete(inputValue)

    // Close suggestions on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
                inputRef.current && !inputRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSearch = async (searchQuery?: string) => {
        const q = searchQuery ?? query
        if (!q.trim()) return
        setQuery(q)
        setInputValue(q)
        setShowSuggestions(false)
        setIsLoading(true)
        setError('')
        setResults([])

        try {
            const response = await fetch(`/api/papers/search?query=${encodeURIComponent(q)}`)
            if (!response.ok) throw new Error('Search failed to initialize')

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
                        if (data.type === 'complete' || data.type === 'done') continue
                        setResults(prev => {
                            if (prev.some(p => p.id === data.id)) return prev
                            return [...prev, data]
                        })
                    }
                }
            }
        } catch (err: unknown) {
            console.error('Search error:', err)
            setError(err instanceof Error ? err.message : 'An error occurred during search')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveAndViewInsights = async (paper: Paper) => {
        setSavingId(paper.id)
        try {
            const response = await fetch('/api/papers/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paper }),
            })
            if (!response.ok) throw new Error('Failed to save paper')
            showNotification('Paper saved. Redirecting to insights…', 'success')
            router.push(`/dashboard/library/${paper.id}`)
        } catch (err) {
            console.error(err)
            showNotification('Failed to save paper.', 'error')
        } finally {
            setSavingId(null)
        }
    }

    const filteredResults = results.filter(paper => {
        if (activeFilter === 'All') return true
        if (activeFilter === 'Semantic Scholar') return paper.source === 'semantic-scholar' || paper.source === 'semantic_scholar'
        if (activeFilter === 'OpenAlex') return paper.source === 'openalex'
        if (activeFilter === 'CrossRef') return paper.source === 'crossref'
        if (activeFilter === '2024+') return (paper.year || 0) >= 2024
        if (activeFilter === 'High Citations') return (paper.citationCount || 0) > 50
        return true
    })

    const isSS = (paper: Paper) =>
        paper.source === 'semantic-scholar' || paper.source === 'semantic_scholar'

    const citationMeshHref = (paper: Paper) => {
        if (isSS(paper)) {
            return `/dashboard/citation-mesh?paperId=${encodeURIComponent(paper.id)}&title=${encodeURIComponent(paper.title)}&source=${paper.source}&back=/dashboard/search`
        }
        if (paper.doi) {
            return `/dashboard/citation-mesh?doi=${encodeURIComponent(paper.doi)}&title=${encodeURIComponent(paper.title)}&source=${paper.source}&back=/dashboard/search`
        }
        return null
    }

    return (
        <div className="p-6 lg:p-8 max-w-[1000px]">
            <h1 className="text-2xl font-bold text-foreground mb-1">Search Papers</h1>
            <p className="text-sm text-foreground/35 mb-6">
                Discover research from millions of academic papers via Semantic Scholar, OpenAlex, and CrossRef
            </p>

            {/* Search Bar with Autocomplete */}
            <div className="relative mb-8">
                <form onSubmit={e => { e.preventDefault(); handleSearch() }} className="flex gap-3">
                    <div className="flex-1 flex items-center gap-3 bg-white border-2 border-foreground/8 rounded-2xl px-5 py-3.5 shadow-sm focus-within:border-[hsl(45,100%,50%)] focus-within:shadow-md transition-all">
                        <span className="text-foreground/25 text-lg">🔍</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={e => {
                                setInputValue(e.target.value)
                                setQuery(e.target.value)
                                setShowSuggestions(true)
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="Search by topic, author, or keyword (e.g. 'Transformer Models')…"
                            className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-foreground/25"
                        />
                        {inputValue && (
                            <button type="button" onClick={() => { setInputValue(''); setQuery(''); setResults([]); inputRef.current?.focus() }} className="text-foreground/25 hover:text-foreground/60 transition-colors text-lg leading-none">×</button>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="px-6 rounded-2xl bg-foreground text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                    >
                        {isLoading ? 'Searching…' : 'Search'}
                    </button>
                </form>

                {/* Autocomplete dropdown */}
                {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && inputValue.length >= 2 && (
                    <div
                        ref={suggestionsRef}
                        className="absolute top-full left-0 right-16 z-50 mt-2 bg-white rounded-2xl border-2 border-foreground/8 shadow-xl overflow-hidden"
                    >
                        {loadingSuggestions && (
                            <div className="px-4 py-3 text-[12px] text-foreground/35 animate-pulse">Searching…</div>
                        )}
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => handleSearch(s.title)}
                                className="w-full text-left px-4 py-3 hover:bg-foreground/[0.03] transition-colors border-b border-foreground/4 last:border-0 group"
                            >
                                <p className="text-[13px] font-semibold text-foreground group-hover:text-[hsl(45,100%,40%)] line-clamp-1 transition-colors">{s.title}</p>
                                <p className="text-[11px] text-foreground/35 mt-0.5">
                                    {s.authors?.join(', ')} {s.year ? `· ${s.year}` : ''}
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>
            )}

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {FILTERS.map(f => (
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
                {results.length > 0 && (
                    <span className="ml-auto text-[11px] text-foreground/35 font-semibold self-center flex-shrink-0 px-2">
                        {filteredResults.length} results
                    </span>
                )}
            </div>

            {/* Results */}
            <div className="space-y-4">
                {results.length === 0 && !isLoading && !error && query && (
                    <p className="text-sm text-foreground/40 text-center py-10">No results found for &quot;{query}&quot;.</p>
                )}
                {results.length === 0 && !isLoading && !query && (
                    <div className="text-center py-16 border-2 border-dashed border-foreground/10 rounded-2xl bg-white">
                        <span className="text-4xl mb-3 block">📚</span>
                        <p className="text-foreground/40 font-medium text-sm">Enter a query above to start searching academic papers.</p>
                        <p className="text-foreground/25 text-xs mt-1">Sources: Semantic Scholar · OpenAlex · CrossRef</p>
                    </div>
                )}

                {filteredResults.map(paper => {
                    const meshHref = citationMeshHref(paper)
                    return (
                        <div key={paper.id} className="bg-white rounded-2xl border-2 border-foreground/6 p-5 shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all group">
                            <a href={paper.url} target="_blank" rel="noopener noreferrer" className="block">
                                <h3 className="text-sm font-bold text-foreground group-hover:text-[hsl(45,100%,45%)] mb-1.5 transition-colors leading-snug">
                                    {paper.title}
                                </h3>
                                <p className="text-[12px] text-foreground/35 mb-2 truncate">
                                    {paper.authors?.slice(0, 3).map(a => a.name).join(', ')}
                                    {paper.authors?.length > 3 ? ` +${paper.authors.length - 3}` : ''} · {paper.year || 'Unknown Year'}
                                </p>
                                {paper.abstract && (
                                    <p className="text-[13px] text-foreground/45 leading-relaxed line-clamp-2 mb-3">
                                        {paper.abstract}
                                    </p>
                                )}
                            </a>

                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-foreground/5 flex-wrap">
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-foreground/5 text-foreground/60 uppercase tracking-wider">
                                    {paper.source}
                                </span>
                                {paper.citationCount > 0 && (
                                    <span className="text-[11px] font-semibold text-foreground/40">
                                        📄 {paper.citationCount} citations
                                    </span>
                                )}

                                <div className="flex-1" />

                                {/* Citation Mesh button */}
                                {meshHref && (
                                    <Link
                                        href={meshHref}
                                        onClick={e => e.stopPropagation()}
                                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                        title="Explore Citation Mesh"
                                    >
                                        🕸️ Citations
                                    </Link>
                                )}

                                {/* View Insights */}
                                <button
                                    onClick={e => { e.preventDefault(); e.stopPropagation(); handleSaveAndViewInsights(paper) }}
                                    disabled={savingId === paper.id || !!paper.aiSummary || !paper.abstract}
                                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors ${!paper.abstract
                                        ? 'text-foreground/25 cursor-not-allowed'
                                        : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                        }`}
                                    title={!paper.abstract ? 'No abstract available' : 'Save & Generate AI Insights'}
                                >
                                    {savingId === paper.id ? 'Saving…' : 'View Insights 🧠'}
                                </button>
                            </div>
                        </div>
                    )
                })}

                {isLoading && results.length > 0 && (
                    <div className="text-center py-4">
                        <span className="text-[12px] font-semibold text-foreground/40 animate-pulse">
                            Loading more results…
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
