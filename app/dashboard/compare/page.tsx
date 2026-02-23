'use client'

export default function DashboardCompare() {
    return (
        <div className="p-6 lg:p-8 max-w-[1000px]">
            <h1 className="text-2xl font-bold text-foreground mb-1">Compare Papers</h1>
            <p className="text-sm text-foreground/35 mb-8">Side-by-side comparison of research papers</p>

            <div className="grid grid-cols-2 gap-5 mb-6">
                {['Paper A', 'Paper B'].map((label) => (
                    <div key={label} className="bg-white rounded-2xl border-2 border-dashed border-foreground/10 p-8 text-center hover:border-[hsl(45,100%,50%)] transition-colors cursor-pointer group">
                        <span className="text-3xl mb-3 block">📄</span>
                        <p className="text-sm font-semibold text-foreground/35 group-hover:text-foreground/60">Drop or select {label}</p>
                        <p className="text-[11px] text-foreground/20 mt-1">Click to search and select a paper</p>
                    </div>
                ))}
            </div>

            {/* Comparison Table */}
            <div className="bg-white rounded-2xl border-2 border-foreground/6 shadow-sm overflow-hidden">
                <div className="grid grid-cols-3 text-[12px] font-bold text-foreground/30 uppercase tracking-wider bg-foreground/[0.02]">
                    <span className="px-6 py-4 border-b border-foreground/5">Metric</span>
                    <span className="px-6 py-4 border-b border-foreground/5 text-center">Paper A</span>
                    <span className="px-6 py-4 border-b border-foreground/5 text-center">Paper B</span>
                </div>
                {[
                    { metric: 'Year Published', a: '—', b: '—' },
                    { metric: 'Citations', a: '—', b: '—' },
                    { metric: 'Methodology', a: '—', b: '—' },
                    { metric: 'Sample Size', a: '—', b: '—' },
                    { metric: 'Key Findings', a: '—', b: '—' },
                ].map((row) => (
                    <div key={row.metric} className="grid grid-cols-3 text-sm border-b border-foreground/4 last:border-0 hover:bg-foreground/[0.02] transition-colors">
                        <span className="px-6 py-3.5 font-medium text-foreground">{row.metric}</span>
                        <span className="px-6 py-3.5 text-center text-foreground/30">{row.a}</span>
                        <span className="px-6 py-3.5 text-center text-foreground/30">{row.b}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
