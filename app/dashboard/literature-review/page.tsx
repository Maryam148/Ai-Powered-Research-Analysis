'use client'

export default function DashboardLitReview() {
    const reviews = [
        { title: 'AI in Healthcare: A Systematic Review', papers: 45, lastUpdated: '2 hours ago', status: 'In Progress', progress: 75 },
        { title: 'Neural Architecture Search Methods', papers: 32, lastUpdated: '1 day ago', status: 'Complete', progress: 100 },
        { title: 'Federated Learning Privacy Survey', papers: 28, lastUpdated: '3 days ago', status: 'Draft', progress: 40 },
    ]

    return (
        <div className="p-6 lg:p-8 max-w-[1000px]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">Literature Review</h1>
                    <p className="text-sm text-foreground/35">AI-powered literature reviews from your saved papers</p>
                </div>
                <button className="px-5 py-2.5 rounded-xl bg-foreground text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
                    + New Review
                </button>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.title} className="bg-white rounded-2xl border-2 border-foreground/6 p-6 shadow-sm hover:shadow-md hover:translate-y-[-1px] transition-all cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-sm font-bold text-foreground mb-1">{review.title}</h3>
                                <p className="text-[12px] text-foreground/35">{review.papers} papers · Updated {review.lastUpdated}</p>
                            </div>
                            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${review.status === 'Complete' ? 'bg-green-50 text-green-600' :
                                    review.status === 'In Progress' ? 'bg-[#FFF3B0] text-[hsl(35,80%,40%)]' :
                                        'bg-orange-50 text-orange-500'
                                }`}>{review.status}</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[hsl(45,100%,50%)] rounded-full transition-all" style={{ width: `${review.progress}%` }}></div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-[11px] text-foreground/30">{review.progress}% complete</span>
                            <div className="flex gap-2">
                                <button className="text-[11px] font-bold text-foreground/35 hover:text-foreground transition-colors">Edit</button>
                                <button className="text-[11px] font-bold text-foreground/35 hover:text-foreground transition-colors">Export</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
