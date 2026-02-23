'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function DashboardOverview() {
  const [user, setUser] = useState<User | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [supabase])

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Researcher'
  const greeting = currentTime.getHours() < 12 ? 'Good Morning' : currentTime.getHours() < 17 ? 'Good Afternoon' : 'Good Evening'

  const stats = [
    { label: 'Papers Found', value: '2,847', change: '+12%', icon: '📄', bg: '#FFF3B0' },
    { label: 'Reviews Generated', value: '156', change: '+8%', icon: '📝', bg: '#D4F5E9' },
    { label: 'Hours Saved', value: '340', change: '+23%', icon: '⏱️', bg: '#FFE0C4' },
    { label: 'Citations Tracked', value: '1,203', change: '+5%', icon: '🔗', bg: '#F3E8FF' },
  ]

  const recentPapers = [
    { title: 'Deep Learning for Medical Image Analysis', authors: 'Smith, J. et al.', year: 2024, citations: 342, status: 'Read' },
    { title: 'Transformer Models in NLP: A Comprehensive Survey', authors: 'Chen, L. et al.', year: 2024, citations: 521, status: 'Saved' },
    { title: 'Federated Learning Privacy Challenges', authors: 'Patel, R. et al.', year: 2023, citations: 189, status: 'New' },
    { title: 'Graph Neural Networks for Drug Discovery', authors: 'Kim, S. et al.', year: 2024, citations: 276, status: 'Read' },
  ]

  const weeklyActivity = [
    { day: 'Mon', papers: 12, hours: 3.5 },
    { day: 'Tue', papers: 8, hours: 2.1 },
    { day: 'Wed', papers: 15, hours: 4.2 },
    { day: 'Thu', papers: 6, hours: 1.8 },
    { day: 'Fri', papers: 20, hours: 5.0 },
    { day: 'Sat', papers: 4, hours: 1.2 },
    { day: 'Sun', papers: 2, hours: 0.5 },
  ]

  const maxPapers = Math.max(...weeklyActivity.map(d => d.papers))

  const todos = [
    { task: 'Finish literature review on CNNs', due: 'Today', done: false },
    { task: 'Export bibliography for thesis Ch.3', due: 'Today', done: false },
    { task: 'Review flagged duplicates', due: 'Tomorrow', done: false },
    { task: 'Submit conference summary', due: 'Done', done: true },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting}, {firstName} 👋</h1>
          <p className="text-sm text-foreground/35 mt-1">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            {' · '}
            <span className="tabular-nums">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border-2 border-foreground/8 rounded-xl px-4 py-2.5 w-[260px] shadow-sm">
          <span className="text-foreground/25">🔍</span>
          <input type="text" placeholder="Search papers..." className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-foreground/25" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border-2 border-foreground/6 p-5 hover:shadow-md transition-all cursor-default" style={{ backgroundColor: stat.bg }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{stat.change}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-[12px] text-foreground/40 font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-foreground/6 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-foreground">Weekly Activity</h3>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-400"></span><span className="text-[11px] text-foreground/35">Papers</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-200"></span><span className="text-[11px] text-foreground/35">Hours</span></div>
            </div>
          </div>
          <div className="flex items-end gap-3 h-[160px]">
            {weeklyActivity.map((d) => (
              <div key={d.day} className="flex flex-col items-center flex-1 gap-1">
                <div className="flex gap-1 items-end w-full justify-center">
                  <div className="w-5 bg-orange-400 rounded-t-md transition-all hover:opacity-80" style={{ height: `${(d.papers / maxPapers) * 100}%` }}></div>
                  <div className="w-5 bg-orange-200 rounded-t-md transition-all hover:opacity-80" style={{ height: `${(d.hours / 5) * 100}%` }}></div>
                </div>
                <span className="text-[10px] text-foreground/30 mt-2 font-medium">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* To Do */}
        <div className="bg-white rounded-2xl border-2 border-foreground/6 p-6 shadow-sm">
          <h3 className="font-bold text-foreground mb-4">To Do</h3>
          <div className="space-y-3">
            {todos.map((item) => (
              <div key={item.task} className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center cursor-pointer transition-colors ${item.done ? 'bg-teal-500 border-teal-500 text-white' : 'border-foreground/12 hover:border-foreground/25'
                  }`}>
                  {item.done && <span className="text-[10px]">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-medium leading-tight ${item.done ? 'line-through text-foreground/25' : 'text-foreground'}`}>{item.task}</p>
                  <span className={`text-[10px] font-semibold mt-0.5 inline-block ${item.due === 'Today' ? 'text-orange-500' : item.due === 'Done' ? 'text-green-500' : 'text-foreground/30'}`}>{item.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Papers */}
      <div className="bg-white rounded-2xl border-2 border-foreground/6 p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-foreground">Recent Papers</h3>
          <Link href="/dashboard/search" className="text-[12px] font-semibold text-foreground/35 hover:text-foreground/60 transition-colors">View all →</Link>
        </div>
        <div className="space-y-0">
          <div className="grid grid-cols-[1fr_120px_80px_80px_80px] text-[11px] text-foreground/30 font-semibold uppercase tracking-wider pb-3 border-b border-foreground/5">
            <span>Title</span><span>Authors</span><span>Year</span><span>Cited</span><span>Status</span>
          </div>
          {recentPapers.map((paper) => (
            <div key={paper.title} className="grid grid-cols-[1fr_120px_80px_80px_80px] items-center py-3.5 border-b border-foreground/4 last:border-0 hover:bg-foreground/[0.02] transition-colors cursor-pointer group">
              <span className="text-sm font-medium text-foreground group-hover:text-foreground/80 truncate pr-4">{paper.title}</span>
              <span className="text-[12px] text-foreground/40 truncate">{paper.authors}</span>
              <span className="text-[12px] text-foreground/40">{paper.year}</span>
              <span className="text-[12px] text-foreground/40">{paper.citations}</span>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full w-fit ${paper.status === 'Read' ? 'bg-green-50 text-green-600' :
                paper.status === 'Saved' ? 'bg-blue-50 text-blue-600' :
                  'bg-orange-50 text-orange-600'
                }`}>{paper.status}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
