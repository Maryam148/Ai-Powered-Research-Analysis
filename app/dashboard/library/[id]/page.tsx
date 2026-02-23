'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useNotification } from '@/components/ui/notifications'
import { jsPDF } from 'jspdf'
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

export default function InsightsPage() {
    const params = useParams()
    const router = useRouter()
    const { id } = params as { id: string }

    const [savedPaper, setSavedPaper] = useState<SavedPaper | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSummarizing, setIsSummarizing] = useState(false)
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

            // Auto summarize if missing
            if (data.paper && !data.paper.paper_data.aiSummary) {
                // To avoid passing handleSummarize which causes crazy circular dependency trees, we'll wait for user action
                // Or if we really want it auto, handleSummarize could be extracted but for now commenting out auto-summarize
                // handleSummarize(data.paper)
            }
        } catch (error) {
            console.error(error)
            showNotification('Failed to load paper details', 'error')
        } finally {
            setIsLoading(false)
        }
    }, [id, router, showNotification])

    useEffect(() => {
        if (!id) return;
        fetchPaper()
    }, [id, fetchPaper])

    const handleSummarize = async (paperRecord: SavedPaper) => {
        const paper = paperRecord.paper_data;
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
                    abstract: paper.abstract
                })
            })

            if (!response.ok) throw new Error('Failed to generate summary')

            const { summary } = await response.json()

            // Update local state
            const updatedPaperRecord = { ...paperRecord, paper_data: { ...paper, aiSummary: summary } };
            setSavedPaper(updatedPaperRecord)

            // Persist the summary to the database so it's cached
            await fetch(`/api/papers/save/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aiSummary: summary })
            })

            showNotification('Insights generated successfully.', 'success')
        } catch (err) {
            console.error('Summarize error:', err)
            showNotification('Failed to generate AI insights.', 'error')
        } finally {
            setIsSummarizing(false)
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

            // Margins and setup
            const marginLeft = 20;
            const marginTop = 20;
            const maxWidth = 170;
            let currentY = marginTop;

            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            const titleLines = doc.splitTextToSize(paper.title, maxWidth);
            doc.text(titleLines, marginLeft, currentY);
            currentY += titleLines.length * 8;

            currentY += 5;
            doc.setFontSize(12);
            doc.setFont("helvetica", "italic");
            const authorsText = paper.authors?.map(a => a.name).join(', ') || 'Unknown Authors';
            const authorsLines = doc.splitTextToSize(authorsText, maxWidth);
            doc.text(authorsLines, marginLeft, currentY);
            currentY += authorsLines.length * 7;

            currentY += 10;
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Abstract", marginLeft, currentY);
            currentY += 8;

            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            const abstractLines = doc.splitTextToSize(paper.abstract || "No abstract available.", maxWidth);
            doc.text(abstractLines, marginLeft, currentY);
            currentY += abstractLines.length * 6;

            currentY += 10;
            if (currentY > 250) {
                doc.addPage();
                currentY = marginTop;
            }

            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("AI Insights & Analysis", marginLeft, currentY);
            currentY += 8;

            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            const summaryLines = doc.splitTextToSize(paper.aiSummary || "", maxWidth);

            for (let i = 0; i < summaryLines.length; i++) {
                if (currentY > 280) {
                    doc.addPage();
                    currentY = marginTop;
                }
                doc.text(summaryLines[i], marginLeft, currentY);
                currentY += 6;
            }

            doc.save(`${paper.title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_Insights.pdf`);
            showNotification('PDF downloaded successfully.', 'success')
        } catch (error) {
            console.error('PDF generation error:', error);
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

    if (!savedPaper) return null;

    const paper = savedPaper.paper_data;
    const hasInsights = !!paper.aiSummary;

    return (
        <div className="relative min-h-screen bg-[hsl(40,33%,96%)]">

            {/* Top Navigation */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-foreground/5 p-4 lg:px-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/library" className="flex items-center gap-2 text-sm font-semibold text-foreground/50 hover:text-foreground transition-colors bg-foreground/5 px-3 py-1.5 rounded-lg">
                        <span>←</span> Back to Library
                    </Link>
                </div>
                <div className="flex gap-3">
                    <a
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white border-2 border-foreground/10 text-foreground font-semibold text-[13px] rounded-xl hover:bg-foreground/5 transition-colors shadow-sm"
                    >
                        View Original Source
                    </a>
                    {hasInsights && (
                        <button
                            onClick={downloadPDF}
                            className="px-4 py-2 bg-foreground text-white font-semibold text-[13px] rounded-xl hover:bg-foreground/90 transition-all shadow-md flex items-center gap-2"
                        >
                            <span>📄</span> Download Research PDF
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6 lg:p-10 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Paper Details */}
                <div className="lg:col-span-7 space-y-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-foreground/10 rounded-full text-[11px] font-bold text-foreground/50 uppercase tracking-widest mb-4 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
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
                    </div>

                    <hr className="border-foreground/10" />

                    <div>
                        <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                            <span>📝</span> Abstract
                        </h3>
                        {paper.abstract ? (
                            <p className="text-[15px] text-foreground/70 leading-relaxed">
                                {paper.abstract}
                            </p>
                        ) : (
                            <div className="p-6 bg-white border-2 border-dashed border-foreground/10 rounded-2xl text-center">
                                <span className="text-2xl opacity-50 mb-2 block">🤷‍♂️</span>
                                <p className="text-foreground/40 font-semibold text-sm">No abstract is available for this paper.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: AI Insights */}
                <div className="lg:col-span-5">
                    <div className="sticky top-[100px]">
                        {!hasInsights && !isSummarizing ? (
                            <div className="bg-white rounded-3xl p-8 border-2 border-foreground/10 shadow-sm text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3">
                                    <span className="text-3xl">🧠</span>
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Unlock AI Insights</h3>
                                <p className="text-[14px] text-foreground/60 mb-6 font-medium">
                                    Generate a structured, academic analysis of this paper summarizing the problem, methodology, and key findings.
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
                                {/* Scanning animation effect */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent h-12 w-full animate-[scan_2s_ease-in-out_infinite]"></div>
                                <div className="w-16 h-16 bg-white shadow-md rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10 animate-pulse">
                                    <span className="text-3xl">⚙️</span>
                                </div>
                                <h3 className="text-lg font-bold text-indigo-900 mb-2 relative z-10">Analyzing Paper...</h3>
                                <p className="text-[13px] text-indigo-600/70 font-medium relative z-10">
                                    Our AI is currently reading the abstract and metadata to synthesize key insights.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 rounded-[2rem] p-[3px] shadow-2xl relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2rem] opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-700"></div>

                                <div className="bg-white rounded-[calc(2rem-3px)] h-full w-full p-8 relative z-10 overflow-hidden">
                                    {/* Deco */}
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl"></div>
                                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-50 rounded-full blur-3xl"></div>

                                    <div className="flex flex-col items-center justify-center text-center mb-8 relative z-10">
                                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 mb-4">
                                            <span className="text-2xl text-white">✨</span>
                                        </div>
                                        <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
                                            AI Analysis
                                        </h2>
                                    </div>

                                    <div className="prose prose-sm prose-indigo relative z-10">
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

            {/* Custom Animation Keyframes for the scanner */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scan {
                    0% { top: -100px; }
                    100% { top: 100%; }
                }
            `}} />
        </div>
    )
}
