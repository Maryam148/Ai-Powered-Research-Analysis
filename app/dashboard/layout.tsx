'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setIsLoading(false)
            if (!user) router.push('/auth/login')
        }
        getUser()
    }, [supabase, router])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    const sidebarLinks = [
        { icon: '📊', label: 'Overview', href: '/dashboard' },
        { icon: '🔍', label: 'Search', href: '/dashboard/search' },
        { icon: '📚', label: 'Library', href: '/dashboard/library' },
        { icon: '📝', label: 'Lit Review', href: '/dashboard/literature-review' },
        { icon: '📈', label: 'Trends', href: '/dashboard/trends' },
        { icon: '⚖️', label: 'Compare', href: '/dashboard/compare' },
        { icon: '⚙️', label: 'Settings', href: '/dashboard/settings' },
    ]

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[hsl(40,33%,96%)] flex">
                <div className="w-[250px] border-r border-foreground/5 p-6 bg-white">
                    <Skeleton className="h-10 w-32 mb-8" />
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full mb-2 rounded-xl" />
                    ))}
                </div>
                <div className="flex-1 p-8 space-y-6">
                    <Skeleton className="h-16 w-full rounded-2xl" />
                    <div className="grid grid-cols-3 gap-5">
                        <Skeleton className="h-40 rounded-2xl" />
                        <Skeleton className="h-40 rounded-2xl" />
                        <Skeleton className="h-40 rounded-2xl" />
                    </div>
                </div>
            </div>
        )
    }

    if (!user) return null

    const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Researcher'

    return (
        <div className="min-h-screen bg-[hsl(40,33%,96%)] flex">
            {/* ===== Sticky Sidebar ===== */}
            <aside className="hidden lg:flex flex-col w-[250px] h-screen sticky top-0 border-r border-foreground/5 bg-white flex-shrink-0">
                {/* Brand Name */}
                <Link href="/" className="px-6 py-6 mb-2 block">
                    <span className="text-2xl tracking-wide" style={{ fontFamily: 'var(--font-bungee)', color: 'hsl(45, 100%, 50%)' }}>
                        Research Flow
                    </span>
                </Link>

                {/* Nav */}
                <nav className="flex flex-col gap-1 px-3 flex-1">
                    {sidebarLinks.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${isActive
                                    ? 'bg-foreground text-white shadow-md'
                                    : 'text-black hover:bg-black/5 hover:text-black/80'
                                    }`}
                            >
                                <span className="text-base">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Sign Out */}
                <div className="px-3 pb-5">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold text-red-400 hover:bg-red-50 hover:text-red-500 transition-all w-full"
                    >
                        <span>🚪</span>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* ===== Main Area ===== */}
            <div className="flex-1 overflow-y-auto">
                {children}
            </div>

            {/* ===== Right Sidebar ===== */}
            <aside className="hidden xl:flex flex-col w-[300px] h-screen sticky top-0 border-l border-foreground/5 bg-white p-5 gap-5 flex-shrink-0 overflow-y-auto">
                {/* Profile Card */}
                <div className="text-center pt-2">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-foreground">Profile</h3>
                        <button className="text-foreground/30 hover:text-foreground transition-colors text-sm">✏️</button>
                    </div>
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 border-4 border-teal-100 flex items-center justify-center text-2xl font-bold text-teal-600">
                        {firstName.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-semibold text-foreground">{user.user_metadata?.full_name || firstName} ✅</p>
                    <p className="text-xs text-foreground/35 mt-0.5">Researcher</p>
                </div>

                <hr className="border-foreground/5" />

                {/* Calendar */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <button className="text-foreground/30 hover:text-foreground text-sm transition-colors">‹</button>
                        <span className="text-sm font-semibold text-foreground">February 2026</span>
                        <button className="text-foreground/30 hover:text-foreground text-sm transition-colors">›</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-[10px] text-center">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                            <span key={i} className="text-foreground/30 font-semibold py-1">{d}</span>
                        ))}
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                            <span
                                key={day}
                                className={`py-1 rounded-lg cursor-pointer transition-colors ${day === 24 ? 'bg-foreground text-white font-bold' : 'text-foreground/55 hover:bg-foreground/5'
                                    }`}
                            >
                                {day}
                            </span>
                        ))}
                    </div>
                </div>

                <hr className="border-foreground/5" />

                {/* To Do List */}
                <div>
                    <h3 className="font-bold text-foreground mb-3">To Do List</h3>
                    <div className="space-y-3.5">
                        {[
                            { task: 'Review ML Paper', cat: 'Research', time: '08:00 AM', done: false },
                            { task: 'Update Citations', cat: 'Writing', time: '10:30 AM', done: false },
                            { task: 'Literature Review Draft', cat: 'Writing', time: '02:40 PM', done: false },
                            { task: 'Submit Final Report', cat: 'Academic', time: '04:50 PM', done: true },
                        ].map((item) => (
                            <div key={item.task} className="flex items-start gap-3">
                                <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${item.done ? 'bg-teal-500 border-teal-500 text-white' : 'border-foreground/15 hover:border-foreground/30'
                                    }`}>
                                    {item.done && <span className="text-[10px]">✓</span>}
                                </div>
                                <div>
                                    <p className={`text-sm font-medium leading-tight ${item.done ? 'line-through text-foreground/30' : 'text-foreground'}`}>{item.task}</p>
                                    <p className="text-[11px] text-foreground/30 mt-0.5">
                                        {item.cat} <span className="text-orange-400 ml-1">{item.time}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    )
}
