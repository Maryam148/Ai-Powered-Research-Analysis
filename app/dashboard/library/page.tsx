'use client'

import { useState, useEffect } from 'react'
import { useNotification } from '@/components/ui/notifications'
import Link from 'next/link'

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

interface SavedPaper {
    id: string;
    user_id: string;
    paper_title: string;
    paper_doi: string | null;
    paper_data: Paper;
    notes: string | null;
    tags: string[] | null;
    created_at: string;
}

export default function LibraryPage() {
    const [papers, setPapers] = useState<SavedPaper[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const { showNotification } = useNotification()

    useEffect(() => {
        fetchLibrary()
    }, [])

    const fetchLibrary = async () => {
        try {
            const res = await fetch('/api/papers/library')
            if (!res.ok) throw new Error('Failed to fetch library')
            const data = await res.json()
            setPapers(data.papers || [])
        } catch (error) {
            console.error(error)
            showNotification('Failed to load library', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            const res = await fetch(`/api/papers/library?id=${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')
            setPapers(prev => prev.filter(p => p.id !== id))
            showNotification('Paper removed from library', 'success')
        } catch (error) {
            console.error(error)
            showNotification('Failed to delete paper', 'error')
        } finally {
            setDeletingId(null)
        }
    }

    // Removed handleSummarize and downloadPDF as they are now on individual pages

    if (isLoading) {
        return (
            <div className="p-6 lg:p-8 max-w-[1000px]">
                <h1 className="text-2xl font-bold text-foreground mb-1">My Library</h1>
                <p className="text-sm text-foreground/35 mb-6">Loading your saved papers...</p>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 max-w-[1000px]">
            <h1 className="text-2xl font-bold text-foreground mb-1">My Library</h1>
            <p className="text-sm text-foreground/35 mb-6">Manage your saved papers, read later, and generate downloadable summaries.</p>

            <div className="space-y-4">
                {papers.length === 0 && !isLoading && (
                    <div className="text-center py-16 border-2 border-dashed border-foreground/10 rounded-2xl bg-white">
                        <span className="text-4xl mb-3 block">📚</span>
                        <p className="text-foreground/40 font-medium text-sm">Your library is empty. Save papers from the search page to read them later.</p>
                    </div>
                )}

                {papers.map((savedPaper) => {
                    const paper = savedPaper.paper_data;
                    return (
                        <div key={savedPaper.id} className="bg-white rounded-2xl border-2 border-foreground/6 p-5 shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all group">
                            <a href={paper.url} target="_blank" rel="noopener noreferrer" className="block">
                                <h3 className="text-sm font-bold text-foreground group-hover:text-[hsl(45,100%,45%)] mb-1.5 transition-colors">{paper.title}</h3>
                                <p className="text-[12px] text-foreground/35 mb-2 truncate">
                                    {paper.authors?.map(a => a.name).join(', ')} · {paper.year || 'Unknown Year'}
                                </p>
                                {paper.abstract && (
                                    <p className="text-[13px] text-foreground/45 leading-relaxed line-clamp-2 mb-3">{paper.abstract}</p>
                                )}
                            </a>

                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-foreground/5">
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-foreground/5 text-foreground/60 uppercase tracking-wider">
                                    {paper.source}
                                </span>
                                <div className="flex-1"></div>

                                <Link
                                    href={`/dashboard/library/${savedPaper.id}`}
                                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors ${!paper.abstract ? 'text-foreground/30 pointer-events-none' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                        }`}
                                    title={!paper.abstract ? "No abstract available" : "View Insights"}
                                >
                                    {paper.aiSummary ? 'View Analysis 🧠' : 'Generate Insights ✨'}
                                </Link>

                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(savedPaper.id); }}
                                    disabled={deletingId === savedPaper.id}
                                    className="text-[11px] font-bold text-red-400 hover:text-red-500 transition-colors ml-2"
                                >
                                    {deletingId === savedPaper.id ? 'Removing...' : 'Remove'}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
