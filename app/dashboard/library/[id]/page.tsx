'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useNotification } from '@/components/ui/notifications'
import { jsPDF } from 'jspdf'
import { toBibTeX, toAPA, toMLA, downloadText } from '@/lib/utils/citations'
import { Paper } from '@/lib/types/paper'
import Link from 'next/link'

interface SavedPaper {
    id: string
    user_id: string
    paper_title: string
    paper_doi: string | null
    paper_data: Paper
    notes: string | null
    tags: string[] | null
    created_at: string
}

export default function InsightsPage() {
    const params = useParams()
    const router = useRouter()
    const { id } = params as { id: string }

    const [savedPaper, setSavedPaper] = useState<SavedPaper | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSummarizing, setIsSummarizing] = useState(false)
    const [notes, setNotes] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')
    const [isSavingNotes, setIsSavingNotes] = useState(false)
    const [showExportMenu, setShowExportMenu] = useState(false)
    const exportRef = useRef<HTMLDivElement>(null)
    const { showNotification } = useNotification()

    const fetchPaper = useCallback(async () => {
        try {
            const res = await fetch(`/api/papers/library/${id}`)
            if (!res.ok) {
                if (res.status === 404) {
                    showNotification('Paper not found in your library', 'error')
                    router.push('/dashboard/library')
                    return
                }
                throw new Error('Failed to fetch paper')
            }
            const data = await res.json()
            setSavedPaper(data.paper)
            setNotes(data.paper.notes || '')
            setTags(data.paper.tags || [])
        } catch (error) {
            console.error(error)
            showNotification('Failed to load paper details', 'error')
        } finally {
            setIsLoading(false)
        }
    }, [id, router, showNotification])

    useEffect(() => {
        if (!id) return
        fetchPaper()
    }, [id, fetchPaper])

    // Close export menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
                setShowExportMenu(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSummarize = async (paperRecord: SavedPaper) => {
        const paper = paperRecord.paper_data
        if (!paper.abstract) {
            showNotification('No abstract available to summarize.', 'warning')
            return
        }
        setIsSummarizing(true)
        try {
            const response = await fetch('/api/ai/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: paper.title,
                    authors: paper.authors?.map(a => a.name) || [],
                    abstract: paper.abstract,
                }),
            })
            if (!response.ok) throw new Error('Failed to generate summary')
            const { summary } = await response.json()

            const updatedRecord = { ...paperRecord, paper_data: { ...paper, aiSummary: summary } }
            setSavedPaper(updatedRecord)

            await fetch(`/api/papers/save/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aiSummary: summary }),
            })
            showNotification('Insights generated successfully.', 'success')
        } catch (err) {
            console.error(err)
            showNotification('Failed to generate AI insights.', 'error')
        } finally {
            setIsSummarizing(false)
        }
    }

    const saveNotes = async () => {
        if (!savedPaper) return
        setIsSavingNotes(true)
        try {
            await fetch(`/api/papers/library/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes }),
            })
            showNotification('Notes saved', 'success')
        } catch {
            showNotification('Failed to save notes', 'error')
        } finally {
            setIsSavingNotes(false)
        }
    }

    const addTag = async (tag: string) => {
        const trimmed = tag.trim()
        if (!trimmed || tags.includes(trimmed)) { setTagInput(''); return }
        const next = [...tags, trimmed]
        setTags(next)
        setTagInput('')
        try {
            await fetch(`/api/papers/library/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags: next }),
            })
        } catch {
            showNotification('Failed to save tag', 'error')
        }
    }

    const removeTag = async (tag: string) => {
        const next = tags.filter(t => t !== tag)
        setTags(next)
        try {
            await fetch(`/api/papers/library/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags: next }),
            })
        } catch {
            showNotification('Failed to remove tag', 'error')
        }
    }

    const downloadPDF = () => {
        if (!savedPaper || !savedPaper.paper_data.aiSummary) {
            showNotification('Please wait for insights to generate.', 'warning')
            return
        }
        const paper = savedPaper.paper_data
        try {
            const doc = new jsPDF()
            const marginLeft = 20, marginTop = 20, maxWidth = 170
            let y = marginTop

            doc.setFontSize(16); doc.setFont('helvetica', 'bold')
            const titleLines = doc.splitTextToSize(paper.title, maxWidth)
            doc.text(titleLines, marginLeft, y); y += titleLines.length * 8

            y += 5; doc.setFontSize(12); doc.setFont('helvetica', 'italic')
            const authLines = doc.splitTextToSize(paper.authors?.map(a => a.name).join(', ') || '', maxWidth)
            doc.text(authLines, marginLeft, y); y += authLines.length * 7

            y += 10; doc.setFontSize(14); doc.setFont('helvetica', 'bold')
            doc.text('Abstract', marginLeft, y); y += 8
            doc.setFontSize(11); doc.setFont('helvetica', 'normal')
            const absLines = doc.splitTextToSize(paper.abstract || '', maxWidth)
            doc.text(absLines, marginLeft, y); y += absLines.length * 6

            y += 10; if (y > 250) { doc.addPage(); y = marginTop }
            doc.setFontSize(14); doc.setFont('helvetica', 'bold')
            doc.text('AI Insights & Analysis', marginLeft, y); y += 8
            doc.setFontSize(11); doc.setFont('helvetica', 'normal')
            const sumLines = doc.splitTextToSize(paper.aiSummary || '', maxWidth)
            for (const line of sumLines) {
                if (y > 280) { doc.addPage(); y = marginTop }
                doc.text(line, marginLeft, y); y += 6
            }

            if (notes) {
                y += 10; if (y > 250) { doc.addPage(); y = marginTop }
                doc.setFontSize(14); doc.setFont('helvetica', 'bold')
                doc.text('My Notes', marginLeft, y); y += 8
                doc.setFontSize(11); doc.setFont('helvetica', 'normal')
                const noteLines = doc.splitTextToSize(notes, maxWidth)
                for (const line of noteLines) {
                    if (y > 280) { doc.addPage(); y = marginTop }
                    doc.text(line, marginLeft, y); y += 6
                }
            }

            doc.save(`${paper.title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_Insights.pdf`)
            showNotification('PDF downloaded successfully.', 'success')
        } catch (error) {
            console.error(error)
            showNotification('Failed to export PDF.', 'error')
        }
    }

    if (isLoading) {
        return (
            <div className="p-6 lg:p-10 max-w-[1200px] mx-auto min-h-screen">
                <div className="h-4 w-24 bg-foreground/10 rounded animate-pulse mb-8" />
                <div className="h-10 w-3/4 bg-foreground/10 rounded animate-pulse mb-4" />
                <div className="h-4 w-1/2 bg-foreground/10 rounded animate-pulse mb-12" />
                <div className="space-y-4">
                    <div className="h-48 w-full bg-foreground/10 rounded-2xl animate-pulse" />
                    <div className="h-64 w-full bg-foreground/10 rounded-2xl animate-pulse" />
                </div>
            </div>
        )
    }

    if (!savedPaper) return null

    const paper = savedPaper.paper_data
    const hasInsights = !!paper.aiSummary
    const isSS = paper.source === 'semantic-scholar'
    // paper.id is the Semantic Scholar paper ID; paper.doi is used as fallback for other sources
    const citationMeshHref = isSS
        ? `/dashboard/citation-mesh?paperId=${encodeURIComponent(paper.id)}&title=${encodeURIComponent(paper.title)}&source=${paper.source}&back=/dashboard/library`
        : paper.doi
            ? `/dashboard/citation-mesh?doi=${encodeURIComponent(paper.doi)}&title=${encodeURIComponent(paper.title)}&source=${paper.source}&back=/dashboard/library`
            : null

    return (
        <div className="relative min-h-screen bg-[hsl(40,33%,96%)]">
            {/* Top Navigation */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-foreground/5 p-4 lg:px-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/library" className="flex items-center gap-2 text-sm font-semibold text-foreground/50 hover:text-foreground transition-colors bg-foreground/5 px-3 py-1.5 rounded-lg">
                        ← Back to Library
                    </Link>
                </div>
                <div className="flex gap-2">
                    {/* Citation Mesh button */}
                    {citationMeshHref && (
                        <Link
                            href={citationMeshHref}
                            className="px-4 py-2 bg-indigo-50 border-2 border-indigo-100 text-indigo-600 font-semibold text-[13px] rounded-xl hover:bg-indigo-100 transition-colors"
                        >
                            🕸️ Citation Mesh
                        </Link>
                    )}
                    <a href={paper.url} target="_blank" rel="noopener noreferrer"
                        className="px-4 py-2 bg-white border-2 border-foreground/10 text-foreground font-semibold text-[13px] rounded-xl hover:bg-foreground/5 transition-colors shadow-sm">
                        View Source ↗
                    </a>
                    {/* Export dropdown */}
                    <div ref={exportRef} className="relative">
                        <button
                            onClick={() => setShowExportMenu(v => !v)}
                            className="px-4 py-2 bg-white border-2 border-foreground/10 text-foreground font-semibold text-[13px] rounded-xl hover:bg-foreground/5 transition-colors shadow-sm"
                        >
                            Export ↓
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 top-12 bg-white rounded-2xl border-2 border-foreground/8 shadow-xl z-30 w-52 overflow-hidden">
                                <button onClick={() => { downloadPDF(); setShowExportMenu(false) }} className="w-full text-left px-4 py-3 text-sm font-semibold text-foreground hover:bg-foreground/5 transition-colors flex items-center gap-2">
                                    <span>📄</span> Download PDF
                                </button>
                                <button onClick={() => { downloadText(toBibTeX(paper), `${paper.title.slice(0, 20)}.bib`); setShowExportMenu(false) }} className="w-full text-left px-4 py-3 text-sm font-semibold text-foreground hover:bg-foreground/5 transition-colors flex items-center gap-2">
                                    <span>🔖</span> BibTeX (.bib)
                                </button>
                                <button onClick={() => { downloadText(toAPA(paper), `${paper.title.slice(0, 20)}_APA.txt`); setShowExportMenu(false) }} className="w-full text-left px-4 py-3 text-sm font-semibold text-foreground hover:bg-foreground/5 transition-colors flex items-center gap-2">
                                    <span>📋</span> APA 7th Edition
                                </button>
                                <button onClick={() => { downloadText(toMLA(paper), `${paper.title.slice(0, 20)}_MLA.txt`); setShowExportMenu(false) }} className="w-full text-left px-4 py-3 text-sm font-semibold text-foreground hover:bg-foreground/5 transition-colors flex items-center gap-2">
                                    <span>📋</span> MLA 9th Edition
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6 lg:p-10 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* ─── Left Column ─── */}
                <div className="lg:col-span-7 space-y-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-foreground/10 rounded-full text-[11px] font-bold text-foreground/50 uppercase tracking-widest mb-4 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-indigo-400" />
                            {paper.source}
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-foreground leading-[1.1] tracking-tight mb-4">
                            {paper.title}
                        </h1>
                        <p className="text-base text-foreground/60 font-medium">
                            {paper.authors?.map(a => a.name).join(', ')} • {paper.year || 'Unknown Year'}
                        </p>
                        {paper.citationCount > 0 && (
                            <p className="text-sm font-semibold text-[hsl(45,100%,40%)] mt-2 flex items-center gap-1.5">
                                <span>📄</span> {paper.citationCount} Citations
                            </p>
                        )}
                        {paper.fieldsOfStudy && paper.fieldsOfStudy.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {paper.fieldsOfStudy.map(f => (
                                    <span key={f} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-foreground/5 text-foreground/50">{f}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    <hr className="border-foreground/10" />

                    {/* Abstract */}
                    <div>
                        <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                            <span>📝</span> Abstract
                        </h3>
                        {paper.abstract ? (
                            <p className="text-[15px] text-foreground/70 leading-relaxed">{paper.abstract}</p>
                        ) : (
                            <div className="p-6 bg-white border-2 border-dashed border-foreground/10 rounded-2xl text-center">
                                <p className="text-foreground/40 font-semibold text-sm">No abstract available for this paper.</p>
                            </div>
                        )}
                    </div>

                    <hr className="border-foreground/10" />

                    {/* Notes */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <span>🗒️</span> My Notes
                            </h3>
                            {isSavingNotes && <span className="text-[11px] text-foreground/40 animate-pulse">Saving…</span>}
                        </div>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            onBlur={saveNotes}
                            placeholder="Add your notes, highlights, and thoughts about this paper…"
                            rows={5}
                            className="w-full px-4 py-3 rounded-xl border-2 border-foreground/8 text-sm text-foreground/80 placeholder:text-foreground/25 outline-none focus:border-[hsl(45,100%,50%)] transition-colors resize-y bg-white leading-relaxed"
                        />
                        <p className="text-[11px] text-foreground/25 mt-1.5">Auto-saves when you click away</p>
                    </div>

                    {/* Tags */}
                    <div>
                        <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                            <span>🏷️</span> Tags
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF3B0] border border-amber-200 text-[12px] font-semibold text-amber-800 group">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="text-amber-500 hover:text-red-500 transition-colors ml-0.5 leading-none">×</button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) } }}
                                placeholder="Add a tag (press Enter)"
                                className="flex-1 px-3 py-2 rounded-xl border-2 border-foreground/8 text-sm outline-none focus:border-[hsl(45,100%,50%)] transition-colors bg-white"
                            />
                            <button onClick={() => addTag(tagInput)} className="px-4 py-2 rounded-xl bg-foreground/10 text-foreground font-semibold text-sm hover:bg-foreground/15 transition-colors">
                                Add
                            </button>
                        </div>
                    </div>
                </div>

                {/* ─── Right Column: AI Insights ─── */}
                <div className="lg:col-span-5">
                    <div className="sticky top-[100px]">
                        {!hasInsights && !isSummarizing ? (
                            <div className="bg-white rounded-3xl p-8 border-2 border-foreground/10 shadow-sm text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3">
                                    <span className="text-3xl">🧠</span>
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Unlock AI Insights</h3>
                                <p className="text-[14px] text-foreground/60 mb-6 font-medium">
                                    Generate a structured academic analysis covering the problem, methodology, and key findings.
                                </p>
                                <button
                                    onClick={() => handleSummarize(savedPaper)}
                                    className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
                                >
                                    Generate Insights ✨
                                </button>
                            </div>
                        ) : !hasInsights && isSummarizing ? (
                            <div className="bg-gradient-to-b from-indigo-50 to-purple-50 rounded-3xl p-8 border-2 border-indigo-100 shadow-inner text-center relative overflow-hidden">
                                <div className="w-16 h-16 bg-white shadow-md rounded-2xl flex items-center justify-center mx-auto mb-5 animate-pulse">
                                    <span className="text-3xl">⚙️</span>
                                </div>
                                <h3 className="text-lg font-bold text-indigo-900 mb-2">Analyzing Paper…</h3>
                                <p className="text-[13px] text-indigo-600/70 font-medium">
                                    Reading abstract and metadata to synthesize key insights.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 rounded-[2rem] p-[3px] shadow-2xl">
                                <div className="bg-white rounded-[calc(2rem-3px)] p-8 relative overflow-hidden">
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl" />
                                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-50 rounded-full blur-3xl" />
                                    <div className="flex flex-col items-center justify-center text-center mb-8 relative z-10">
                                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 mb-4">
                                            <span className="text-2xl text-white">✨</span>
                                        </div>
                                        <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
                                            AI Analysis
                                        </h2>
                                    </div>
                                    <div className="relative z-10">
                                        <div className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                                            {paper.aiSummary}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
