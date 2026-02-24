'use client'

import { useState, useEffect, useCallback } from 'react'
import { useNotification } from '@/components/ui/notifications'
import { jsPDF } from 'jspdf'
import { papersToBibTeX, papersToAPA, papersToMLA, downloadText } from '@/lib/utils/citations'
import { Paper } from '@/lib/types/paper'

interface SavedPaper {
    id: string
    paper_title: string
    paper_data: Paper
    notes: string | null
    tags: string[] | null
    created_at: string
}

type Tab = 'review' | 'gaps' | 'draft'

const TABS: { key: Tab; label: string; icon: string; description: string }[] = [
    { key: 'review', label: 'Literature Review', icon: '📝', description: 'Structured multi-section review with thematic analysis' },
    { key: 'gaps', label: 'Research Gaps', icon: '🔍', description: 'Identify under-explored areas and future directions' },
    { key: 'draft', label: 'Paper Draft', icon: '✍️', description: 'Generate Introduction, Literature Review & Methodology sections' },
]

export default function DashboardLitReview() {
    const [papers, setPapers] = useState<SavedPaper[]>([])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [activeTab, setActiveTab] = useState<Tab>('review')
    const [content, setContent] = useState<Record<Tab, string>>({ review: '', gaps: '', draft: '' })
    const [isGenerating, setIsGenerating] = useState(false)
    const [isLoadingPapers, setIsLoadingPapers] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const { showNotification } = useNotification()

    const loadPapers = useCallback(async () => {
        try {
            const res = await fetch('/api/papers/library')
            if (!res.ok) throw new Error('Failed')
            const data = await res.json()
            setPapers(data.papers || [])
        } catch {
            showNotification('Failed to load library papers', 'error')
        } finally {
            setIsLoadingPapers(false)
        }
    }, [showNotification])

    useEffect(() => { loadPapers() }, [loadPapers])

    const selectedPapers = papers
        .filter(p => selectedIds.has(p.id))
        .map(p => p.paper_data)

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const selectAll = () => setSelectedIds(new Set(papers.map(p => p.id)))
    const clearAll = () => setSelectedIds(new Set())

    const handleGenerate = async () => {
        if (selectedPapers.length < 2) {
            showNotification('Select at least 2 papers to generate', 'warning')
            return
        }
        setIsGenerating(true)
        try {
            const endpoint =
                activeTab === 'review' ? '/api/ai/literature-review'
                    : activeTab === 'gaps' ? '/api/ai/gap-analysis'
                        : '/api/ai/draft'

            const payload = {
                papers: selectedPapers.map(p => ({
                    title: p.title,
                    authors: p.authors?.map(a => a.name) || [],
                    year: p.year,
                    abstract: p.abstract,
                    fieldsOfStudy: p.fieldsOfStudy || [],
                }))
            }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error('Generation failed')
            const data = await res.json()
            const text = data.review ?? data.gapAnalysis ?? data.draft ?? ''
            setContent(prev => ({ ...prev, [activeTab]: text }))
            showNotification('Generated successfully!', 'success')
        } catch {
            showNotification('Failed to generate. Please try again.', 'error')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSaveReview = async () => {
        const text = content[activeTab]
        if (!text) return
        setIsSaving(true)
        try {
            const title = `${TABS.find(t => t.key === activeTab)?.label} — ${new Date().toLocaleDateString()}`
            const res = await fetch('/api/ai/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content: text,
                    review_type: activeTab,
                    paper_ids: Array.from(selectedIds),
                }),
            })
            if (!res.ok) throw new Error()
            showNotification('Review saved to your account', 'success')
        } catch {
            showNotification('Failed to save review', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    const exportPDF = () => {
        const text = content[activeTab]
        if (!text) return
        const tabLabel = TABS.find(t => t.key === activeTab)?.label || 'Review'
        const doc = new jsPDF()
        const margin = 20
        const maxWidth = 170
        let y = margin

        doc.setFontSize(16); doc.setFont('helvetica', 'bold')
        const titleLines = doc.splitTextToSize(tabLabel, maxWidth)
        doc.text(titleLines, margin, y); y += titleLines.length * 8 + 6

        doc.setFontSize(10); doc.setFont('helvetica', 'italic')
        doc.text(`Generated ${new Date().toLocaleDateString()} · ${selectedPapers.length} papers`, margin, y); y += 12

        doc.setFontSize(11); doc.setFont('helvetica', 'normal')
        const lines = doc.splitTextToSize(text, maxWidth)
        for (const line of lines) {
            if (y > 280) { doc.addPage(); y = margin }
            doc.text(line, margin, y); y += 6
        }
        doc.save(`${tabLabel.replace(/\s+/g, '_')}_${Date.now()}.pdf`)
        showNotification('PDF downloaded', 'success')
    }

    const exportBibTeX = () => {
        const bibtex = papersToBibTeX(selectedPapers)
        downloadText(bibtex, `references_${Date.now()}.bib`, 'text/plain')
        showNotification('BibTeX file downloaded', 'success')
    }

    const exportAPA = () => {
        const apa = papersToAPA(selectedPapers)
        downloadText(apa, `references_APA_${Date.now()}.txt`, 'text/plain')
        showNotification('APA references downloaded', 'success')
    }

    const exportMLA = () => {
        const mla = papersToMLA(selectedPapers)
        downloadText(mla, `references_MLA_${Date.now()}.txt`, 'text/plain')
        showNotification('MLA references downloaded', 'success')
    }

    const exportDOCX = () => {
        const text = content[activeTab]
        if (!text) return
        const tabLabel = TABS.find(t => t.key === activeTab)?.label || 'Review'
        const htmlBody = text
            .split('\n')
            .map(line => {
                if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`
                if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`
                if (line.startsWith('**') && line.endsWith('**')) return `<strong>${line.slice(2, -2)}</strong>`
                return line ? `<p>${line}</p>` : '<br/>'
            })
            .join('\n')

        const html = `<html><head><meta charset="UTF-8"><style>
body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; margin: 1in; }
h1 { font-size: 16pt; text-align: center; margin-bottom: 12pt; }
h2 { font-size: 14pt; margin-top: 20pt; margin-bottom: 6pt; }
p { margin-bottom: 10pt; text-align: justify; }
</style></head><body><h1>${tabLabel}</h1>${htmlBody}</body></html>`

        const blob = new Blob([html], { type: 'application/msword' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `${tabLabel.replace(/\s+/g, '_')}.doc`
        a.click(); URL.revokeObjectURL(url)
        showNotification('Word document downloaded', 'success')
    }

    const currentContent = content[activeTab]

    return (
        <div className="p-6 lg:p-8 max-w-[1200px]">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-1">Literature Review Assistant</h1>
                <p className="text-sm text-foreground/35">Select papers from your library, then generate AI-powered academic content</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

                {/* ─── Left: Paper Selector ─── */}
                <div className="bg-white rounded-2xl border-2 border-foreground/6 shadow-sm overflow-hidden flex flex-col max-h-[80vh]">
                    <div className="p-4 border-b border-foreground/5 flex items-center justify-between flex-shrink-0">
                        <div>
                            <h3 className="text-sm font-bold text-foreground">Your Library</h3>
                            <p className="text-[11px] text-foreground/35 mt-0.5">
                                {selectedIds.size} of {papers.length} selected
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={selectAll} className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors">All</button>
                            <span className="text-foreground/20">|</span>
                            <button onClick={clearAll} className="text-[11px] font-bold text-foreground/35 hover:text-foreground/60 transition-colors">None</button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoadingPapers ? (
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
                                    const selected = selectedIds.has(p.id)
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => toggleSelect(p.id)}
                                            className={`w-full text-left p-4 transition-colors hover:bg-foreground/[0.02] flex items-start gap-3 ${selected ? 'bg-indigo-50/50' : ''}`}
                                        >
                                            <div className={`w-4 h-4 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-colors ${selected ? 'bg-indigo-500 border-indigo-500' : 'border-foreground/20'}`}>
                                                {selected && <span className="text-white text-[9px] font-bold">✓</span>}
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

                    {/* Generate button */}
                    <div className="p-4 border-t border-foreground/5 flex-shrink-0">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || selectedIds.size < 2}
                            className="w-full py-3 rounded-xl bg-foreground text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
                        >
                            {isGenerating
                                ? `Generating ${TABS.find(t => t.key === activeTab)?.label}…`
                                : selectedIds.size < 2
                                    ? `Select ≥ 2 papers to generate`
                                    : `Generate ${TABS.find(t => t.key === activeTab)?.label} ✨`}
                        </button>
                    </div>
                </div>

                {/* ─── Right: Generated Content ─── */}
                <div className="flex flex-col gap-4">
                    {/* Tabs */}
                    <div className="flex gap-2">
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold border-2 transition-all ${activeTab === tab.key
                                    ? 'bg-foreground text-white border-foreground shadow-sm'
                                    : 'bg-white border-foreground/6 text-foreground/50 hover:bg-foreground/5 hover:text-foreground/70'
                                    }`}
                                title={tab.description}
                            >
                                <span>{tab.icon}</span>
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content area */}
                    <div className="bg-white rounded-2xl border-2 border-foreground/6 shadow-sm overflow-hidden flex-1">
                        {!currentContent && !isGenerating ? (
                            <div className="flex flex-col items-center justify-center h-[400px] gap-4 px-8 text-center">
                                <span className="text-5xl">{TABS.find(t => t.key === activeTab)?.icon}</span>
                                <div>
                                    <h3 className="text-base font-bold text-foreground mb-2">
                                        {TABS.find(t => t.key === activeTab)?.label}
                                    </h3>
                                    <p className="text-sm text-foreground/40 max-w-[360px]">
                                        {TABS.find(t => t.key === activeTab)?.description}.{' '}
                                        Select papers from the left panel and click Generate.
                                    </p>
                                </div>
                            </div>
                        ) : isGenerating ? (
                            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                                <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-foreground/50 font-medium animate-pulse">
                                    AI is analyzing {selectedPapers.length} papers…
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Toolbar */}
                                <div className="flex items-center justify-between px-5 py-3 border-b border-foreground/5 bg-foreground/[0.015]">
                                    <span className="text-[12px] font-bold text-foreground/50">
                                        {TABS.find(t => t.key === activeTab)?.label} — {selectedPapers.length} papers
                                    </span>
                                    <div className="flex gap-2 flex-wrap justify-end">
                                        <button onClick={handleSaveReview} disabled={isSaving} className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors">
                                            {isSaving ? 'Saving…' : '💾 Save'}
                                        </button>
                                        <button onClick={exportPDF} className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">📄 PDF</button>
                                        <button onClick={exportDOCX} className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">📝 Word</button>
                                        <button onClick={exportBibTeX} className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors">🔖 BibTeX</button>
                                        <button onClick={exportAPA} className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors">APA</button>
                                        <button onClick={exportMLA} className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors">MLA</button>
                                    </div>
                                </div>

                                {/* Editable textarea */}
                                <textarea
                                    value={currentContent}
                                    onChange={e => setContent(prev => ({ ...prev, [activeTab]: e.target.value }))}
                                    className="w-full p-6 text-[14px] text-foreground/80 leading-relaxed resize-none outline-none font-mono bg-transparent min-h-[500px]"
                                    placeholder="Generated content will appear here…"
                                    style={{ fontFamily: '"Georgia", "Times New Roman", serif', fontSize: '14px' }}
                                />
                            </>
                        )}
                    </div>

                    {/* Citation export for selected papers */}
                    {selectedPapers.length > 0 && (
                        <div className="bg-white rounded-2xl border-2 border-foreground/6 p-4 shadow-sm">
                            <p className="text-[12px] font-bold text-foreground/50 mb-3">Export Citations for {selectedPapers.length} Selected Papers</p>
                            <div className="flex gap-2 flex-wrap">
                                <button onClick={exportBibTeX} className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-foreground/5 text-foreground/60 hover:bg-foreground/10 transition-colors">🔖 BibTeX (.bib)</button>
                                <button onClick={exportAPA} className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-foreground/5 text-foreground/60 hover:bg-foreground/10 transition-colors">APA 7th</button>
                                <button onClick={exportMLA} className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-foreground/5 text-foreground/60 hover:bg-foreground/10 transition-colors">MLA 9th</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
