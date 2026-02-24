'use client'

import { useState, useEffect, useCallback } from 'react'
import { useNotification } from '@/components/ui/notifications'
import { Paper } from '@/lib/types/paper'

interface SavedPaper {
    id: string
    paper_title: string
    paper_data: Paper
    created_at: string
}

export default function DashboardCompare() {
    const [papers, setPapers] = useState<SavedPaper[]>([])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [comparison, setComparison] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isComparing, setIsComparing] = useState(false)
    const { showNotification } = useNotification()

    const loadPapers = useCallback(async () => {
        try {
            const res = await fetch('/api/papers/library')
            if (!res.ok) throw new Error()
            const data = await res.json()
            setPapers(data.papers || [])
        } catch {
            showNotification('Failed to load library', 'error')
        } finally {
            setIsLoading(false)
        }
    }, [showNotification])

    useEffect(() => { loadPapers() }, [loadPapers])

    const selected = papers.filter(p => selectedIds.has(p.id))

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                if (next.size >= 4) {
                    showNotification('You can compare up to 4 papers at once', 'warning')
                    return prev
                }
                next.add(id)
            }
            return next
        })
    }

    const handleCompare = async () => {
        if (selected.length < 2) {
            showNotification('Select at least 2 papers to compare', 'warning')
            return
        }
        setIsComparing(true)
        setComparison('')
        try {
            const res = await fetch('/api/ai/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    papers: selected.map(p => ({
                        title: p.paper_data.title,
                        authors: p.paper_data.authors?.map(a => a.name) || [],
                        abstract: p.paper_data.abstract,
                        year: p.paper_data.year,
                    })),
                }),
            })
            if (!res.ok) throw new Error()
            const data = await res.json()
            setComparison(data.comparison || '')
            showNotification('Comparison generated!', 'success')
        } catch {
            showNotification('Comparison failed. Please try again.', 'error')
        } finally {
            setIsComparing(false)
        }
    }

    return (
        <div className="p-6 lg:p-8 max-w-[1100px]">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-1">Compare Papers</h1>
                <p className="text-sm text-foreground/35">Select 2–4 papers from your library for an AI-powered side-by-side comparison</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

                {/* ─── Paper Selector ─── */}
                <div className="bg-white rounded-2xl border-2 border-foreground/6 shadow-sm overflow-hidden flex flex-col max-h-[80vh]">
                    <div className="p-4 border-b border-foreground/5 flex-shrink-0">
                        <h3 className="text-sm font-bold text-foreground">Your Library</h3>
                        <p className="text-[11px] text-foreground/35 mt-0.5">
                            {selected.length}/4 papers selected
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-6 space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-16 bg-foreground/5 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : papers.length === 0 ? (
                            <div className="p-8 text-center">
                                <span className="text-3xl block mb-2">📚</span>
                                <p className="text-sm text-foreground/40 font-medium">No papers in your library yet.</p>
                                <a href="/dashboard/search" className="text-[12px] text-indigo-500 font-semibold mt-2 inline-block">Search and save papers →</a>
                            </div>
                        ) : (
                            <div className="divide-y divide-foreground/4">
                                {papers.map(p => {
                                    const sel = selectedIds.has(p.id)
                                    const orderNum = selected.findIndex(s => s.id === p.id) + 1
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => toggleSelect(p.id)}
                                            className={`w-full text-left p-4 transition-colors hover:bg-foreground/[0.02] flex items-start gap-3 ${sel ? 'bg-indigo-50/50' : ''}`}
                                        >
                                            <div className={`w-6 h-6 rounded-lg flex-shrink-0 mt-0.5 border-2 flex items-center justify-center text-[11px] font-bold transition-colors ${sel ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-foreground/20 text-foreground/30'}`}>
                                                {sel ? orderNum : ''}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[13px] font-semibold text-foreground leading-tight line-clamp-2">{p.paper_data.title}</p>
                                                <p className="text-[11px] text-foreground/35 mt-0.5 truncate">
                                                    {p.paper_data.authors?.slice(0, 2).map(a => a.name).join(', ')} · {p.paper_data.year || '—'}
                                                </p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-foreground/5 flex-shrink-0">
                        <button
                            onClick={handleCompare}
                            disabled={isComparing || selected.length < 2}
                            className="w-full py-3 rounded-xl bg-foreground text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
                        >
                            {isComparing
                                ? 'Comparing papers…'
                                : selected.length < 2
                                    ? 'Select ≥ 2 papers'
                                    : `Compare ${selected.length} Papers ⚖️`}
                        </button>
                    </div>
                </div>

                {/* ─── Comparison Result ─── */}
                <div className="flex flex-col gap-4">
                    {/* Selected papers preview */}
                    {selected.length > 0 && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {selected.map((p, i) => (
                                <div key={p.id} className="bg-white rounded-xl border-2 border-indigo-100 p-3 relative">
                                    <span className="absolute -top-2 -left-2 w-5 h-5 bg-indigo-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                    <p className="text-[12px] font-semibold text-foreground leading-tight line-clamp-2">{p.paper_data.title}</p>
                                    <p className="text-[10px] text-foreground/35 mt-1">{p.paper_data.year}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* AI Result */}
                    <div className="bg-white rounded-2xl border-2 border-foreground/6 shadow-sm overflow-hidden flex-1">
                        {!comparison && !isComparing ? (
                            <div className="flex flex-col items-center justify-center h-[400px] gap-4 px-8 text-center">
                                <span className="text-5xl">⚖️</span>
                                <div>
                                    <h3 className="text-base font-bold text-foreground mb-2">AI Paper Comparison</h3>
                                    <p className="text-sm text-foreground/40 max-w-[360px]">
                                        Select 2–4 papers from your library and click Compare. The AI will analyze research problems,
                                        methodologies, findings, datasets, limitations, and novel contributions.
                                    </p>
                                </div>
                            </div>
                        ) : isComparing ? (
                            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                                <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-foreground/50 font-medium animate-pulse">
                                    AI is comparing {selected.length} papers…
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="px-5 py-3 border-b border-foreground/5 bg-foreground/[0.015] flex items-center justify-between">
                                    <span className="text-[12px] font-bold text-foreground/50">
                                        AI Comparison — {selected.length} papers
                                    </span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(comparison)
                                            showNotification('Copied to clipboard', 'success')
                                        }}
                                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-foreground/5 text-foreground/50 hover:bg-foreground/10 transition-colors"
                                    >
                                        📋 Copy
                                    </button>
                                </div>
                                <div className="p-6 overflow-y-auto max-h-[600px]">
                                    <div className="prose prose-sm max-w-none">
                                        <pre className="whitespace-pre-wrap text-[14px] text-foreground/75 leading-relaxed font-normal" style={{ fontFamily: '"Georgia", serif' }}>
                                            {comparison}
                                        </pre>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
