'use client'

export default function DashboardTrends() {
    const trending = [
        { topic: 'Large Language Models', growth: '+340%', papers: '12,847', color: '#FFF3B0' },
        { topic: 'Diffusion Models', growth: '+280%', papers: '5,632', color: '#D4F5E9' },
        { topic: 'Federated Learning', growth: '+120%', papers: '3,891', color: '#FFE0C4' },
        { topic: 'Graph Neural Networks', growth: '+95%', papers: '8,234', color: '#F3E8FF' },
        { topic: 'Reinforcement Learning from Human Feedback', growth: '+210%', papers: '2,156', color: '#FFF3B0' },
        { topic: 'Vision Transformers', growth: '+150%', papers: '6,789', color: '#D4F5E9' },
    ]

    const monthlyData = [
        { month: 'Sep', value: 35 },
        { month: 'Oct', value: 52 },
        { month: 'Nov', value: 48 },
        { month: 'Dec', value: 65 },
        { month: 'Jan', value: 78 },
        { month: 'Feb', value: 92 },
    ]
    const maxVal = Math.max(...monthlyData.map(d => d.value))

    return (
        <div className="p-6 lg:p-8 max-w-[1000px]">
            <h1 className="text-2xl font-bold text-foreground mb-1">Research Trends</h1>
            <p className="text-sm text-foreground/35 mb-8">Discover what&apos;s trending in academic research</p>

            {/* Publication Growth Chart */}
            <div className="bg-white rounded-2xl border-2 border-foreground/6 p-6 shadow-sm mb-8">
                <h3 className="font-bold text-foreground mb-5">Publication Growth (Last 6 Months)</h3>
                <div className="flex items-end gap-4 h-[180px]">
                    {monthlyData.map((d) => (
                        <div key={d.month} className="flex flex-col items-center flex-1 gap-1">
                            <div className="w-full max-w-[48px] bg-[hsl(45,100%,75%)] rounded-t-lg hover:bg-[hsl(45,100%,60%)] transition-colors cursor-default" style={{ height: `${(d.value / maxVal) * 100}%` }}></div>
                            <span className="text-[10px] text-foreground/30 mt-2 font-medium">{d.month}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trending Topics */}
            <h3 className="font-bold text-foreground mb-4">Trending Topics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trending.map((item, i) => (
                    <div key={item.topic} className="rounded-2xl border-2 border-foreground/6 p-5 hover:shadow-md hover:translate-y-[-1px] transition-all cursor-pointer" style={{ backgroundColor: item.color }}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[11px] text-foreground/30 font-semibold mb-1">#{i + 1} TRENDING</p>
                                <h4 className="text-sm font-bold text-foreground">{item.topic}</h4>
                            </div>
                            <span className="text-[12px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">{item.growth}</span>
                        </div>
                        <p className="text-[12px] text-foreground/35 mt-2">{item.papers} papers published</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
