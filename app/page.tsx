'use client'

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!dashboardRef.current) return;

      const rect = dashboardRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how far the element is through the viewport
      // Start animation when element enters viewport, complete when it reaches center
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;

      // Progress: 0 when element is at bottom of viewport, 1 when at center or above
      const rawProgress = 1 - (elementCenter - viewportCenter) / (windowHeight / 2);
      const progress = Math.max(0, Math.min(1, rawProgress));

      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Interpolate tilt: starts at 12deg rotateX, ends at 0
  const tiltDeg = 12 * (1 - scrollProgress);
  // Interpolate scale: starts at 0.92, ends at 1
  const scale = 0.92 + 0.08 * scrollProgress;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section relative overflow-hidden">
        <div className="container mx-auto px-4 pt-16 pb-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-foreground">
              ACCELERATE YOUR
              <br />
              RESEARCH WITH EASE
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Everything you need is in one place, so you can focus on discovering
              papers, generating AI summaries, and building a lasting
              research experience.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
              <Link href="/search">
                <Button
                  size="lg"
                  className="hero-cta-primary text-base px-8 py-6 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Start for free
                </Button>
              </Link>
              <Link href="/dashboard" className="group">
                <span className="inline-flex items-center gap-2 text-base font-medium text-foreground hover:text-primary transition-colors">
                  View Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>

            {/* Trust Line */}
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <span className="text-lg">🏆</span>
              AI-powered multi-source research assistant
            </p>
          </div>
        </div>

        {/* Dashboard Preview — Tilting on Scroll */}
        <div className="container mx-auto px-4 pb-20 pt-8">
          <div
            ref={dashboardRef}
            className="max-w-5xl mx-auto"
            style={{
              perspective: '1200px',
            }}
          >
            <div
              className="dashboard-preview-card"
              style={{
                transform: `rotateX(${tiltDeg}deg) scale(${scale})`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              <Image
                src="/dashboard-screenshot.png"
                alt="ReSearch Flow Dashboard Preview"
                width={1200}
                height={800}
                className="w-full h-auto rounded-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="hero-section py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-sm border-2 border-foreground bg-hero-accent text-xs font-bold tracking-widest uppercase">
              Problem
            </div>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-foreground uppercase">
              Research should
              <br />
              not be hard
            </h2>

            {/* Subtitle */}
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Many researchers waste time switching tools, lose
              track of papers, and struggle to keep reviews comprehensive.
            </p>
          </div>

          {/* Problem Cards */}
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
            <div className="problem-card p-8 rounded-2xl border-2 border-foreground bg-card">
              <div className="w-10 h-10 rounded-full bg-hero-accent border-2 border-foreground flex items-center justify-center mb-6">
                <span className="text-foreground font-bold text-lg">✕</span>
              </div>
              <h3 className="font-black text-lg uppercase mb-4 leading-tight">
                Too many tools
                <br />
                break flow
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Jumping between databases for papers, citations, summaries, and notes breaks your flow every day.
              </p>
            </div>

            <div className="problem-card p-8 rounded-2xl border-2 border-foreground bg-card">
              <div className="w-10 h-10 rounded-full bg-hero-accent border-2 border-foreground flex items-center justify-center mb-6">
                <span className="text-foreground font-bold text-lg">✕</span>
              </div>
              <h3 className="font-black text-lg uppercase mb-4 leading-tight">
                No clear view
                <br />
                of progress
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                You don&apos;t know which papers are most relevant or how your literature review is progressing overall.
              </p>
            </div>

            <div className="problem-card p-8 rounded-2xl border-2 border-foreground bg-card">
              <div className="w-10 h-10 rounded-full bg-hero-accent border-2 border-foreground flex items-center justify-center mb-6">
                <span className="text-foreground font-bold text-lg">✕</span>
              </div>
              <h3 className="font-black text-lg uppercase mb-4 leading-tight">
                Most researchers
                <br />
                lose focus fast
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Researchers get overwhelmed and drop out before finishing even their best literature reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="hero-section py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-sm border-2 border-foreground bg-hero-accent text-xs font-bold tracking-widest uppercase">
              Benefits
            </div>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-foreground uppercase">
              Everything is built to
              <br />
              help you research better
            </h2>

            {/* Subtitle */}
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              From discovering papers to tracking progress, the platform
              simplifies your work and improves the research experience.
            </p>
          </div>

          {/* Bento Grid — exact Didasko layout */}
          <div className="max-w-[1100px] mx-auto space-y-5">
            {/* Row 1 — large yellow left (7fr) + smaller white right (5fr) */}
            <div className="grid md:grid-cols-12 gap-5">
              <div className="md:col-span-7 bento-card p-8 md:p-10 rounded-2xl border-2 border-foreground bg-[#FFF3B0] min-h-[300px] flex">
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-black text-2xl md:text-[26px] uppercase mb-3 leading-tight text-foreground">
                      Multi-Source Search
                      <br />
                      That Works
                    </h3>
                    <p className="text-foreground/65 text-sm leading-relaxed max-w-[280px]">
                      Search across Semantic Scholar, OpenAlex, and CrossRef using one unified search bar made for real researchers.
                    </p>
                  </div>
                </div>
                {/* Course card snippet */}
                <div className="hidden md:flex items-end ml-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200 w-[180px] shadow-sm">
                    <div className="w-9 h-9 bg-blue-100 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-blue-500 text-sm">📄</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground">Basic: HTML and CSS</p>
                    <div className="flex gap-3 mt-3 text-[10px] text-muted-foreground">
                      <span>📄 24</span><span>📋 8</span><span>👥 99</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 bento-card p-8 md:p-10 rounded-2xl border-2 border-foreground bg-card min-h-[300px] flex flex-col justify-center">
                <h3 className="font-black text-2xl md:text-[26px] uppercase mb-3 leading-tight text-foreground">
                  Built-in AI
                  <br />
                  Automation
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[240px]">
                  Generate summaries, literature reviews, and citations without lifting a finger.
                </p>
              </div>
            </div>

            {/* Row 2 — smaller white left (5fr) + large mint right (7fr) */}
            <div className="grid md:grid-cols-12 gap-5">
              <div className="md:col-span-5 bento-card p-8 md:p-10 rounded-2xl border-2 border-foreground bg-card min-h-[300px] flex flex-col justify-center">
                <h3 className="font-black text-2xl md:text-[26px] uppercase mb-3 leading-tight text-foreground">
                  One place for
                  <br />
                  everything
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[240px]">
                  No need to jump between tools. Manage papers, summaries, and analytics from one dashboard.
                </p>
              </div>

              <div className="md:col-span-7 bento-card p-8 md:p-10 rounded-2xl border-2 border-foreground bg-[#D4F5E9] min-h-[300px] flex">
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-black text-2xl md:text-[26px] uppercase mb-3 leading-tight text-foreground">
                      Track how
                      <br />
                      research progresses
                    </h3>
                    <p className="text-foreground/65 text-sm leading-relaxed max-w-[280px]">
                      See which papers are trending, which areas need more coverage, and your overall progress.
                    </p>
                  </div>
                </div>
                {/* Gauge chart snippet */}
                <div className="hidden md:flex items-center ml-4">
                  <div className="bg-white rounded-xl p-5 border border-gray-200 w-[200px] text-center shadow-sm">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-teal-400 inline-block"></span>
                        Point Progress
                      </span>
                      <span>Monthly ▾</span>
                    </div>
                    <div className="relative w-24 h-14 mx-auto mb-1">
                      <svg viewBox="0 0 100 55" className="w-full h-full">
                        <path d="M 8 50 A 42 42 0 0 1 92 50" fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />
                        <path d="M 8 50 A 42 42 0 0 1 75 15" fill="none" stroke="#2dd4bf" strokeWidth="8" strokeLinecap="round" />
                        <circle cx="75" cy="15" r="4" fill="#f97316" />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-foreground">Your Point: <span className="text-sm">8,966</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3 — peach left (6fr) + mint right (6fr) */}
            <div className="grid md:grid-cols-12 gap-5">
              <div className="md:col-span-6 bento-card p-8 md:p-10 rounded-2xl border-2 border-foreground bg-[#FFE0C4] min-h-[300px] flex">
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-black text-2xl md:text-[26px] uppercase mb-3 leading-tight text-foreground">
                      Fun smooth
                      <br />
                      way to explore
                    </h3>
                    <p className="text-foreground/65 text-sm leading-relaxed max-w-[280px]">
                      Keep researchers engaged with clean design, fast navigation, and mobile-friendly layouts.
                    </p>
                  </div>
                </div>
                {/* Leaderboard snippet */}
                <div className="hidden md:flex items-end ml-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200 w-[200px] shadow-sm">
                    <p className="text-xs font-bold mb-3 text-foreground">Leader Board</p>
                    <div className="flex text-[9px] text-muted-foreground gap-6 mb-2 uppercase tracking-wide">
                      <span className="w-8">Rank</span>
                      <span>Name</span>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold w-4 text-foreground">1</span>
                        <span className="text-green-500 text-[10px]">▲</span>
                        <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                        <span className="text-foreground text-[11px]">Charlie Rawal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold w-4 text-foreground">2</span>
                        <span className="text-red-500 text-[10px]">▼</span>
                        <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                        <span className="text-foreground text-[11px]">Ariana Agarwal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-6 bento-card p-8 md:p-10 rounded-2xl border-2 border-foreground bg-[#D4F5E9] min-h-[300px] flex flex-col justify-center">
                <h3 className="font-black text-2xl md:text-[26px] uppercase mb-3 leading-tight text-foreground">
                  Quick setup no
                  <br />
                  tech stress
                </h3>
                <p className="text-foreground/65 text-sm leading-relaxed max-w-[280px]">
                  Start your research in minutes, not weeks, with no need for complex tools or setup.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — Workflow Section */}
      <section className="bg-[#FDDCB5] py-24 overflow-hidden">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-sm border-2 border-foreground bg-hero-accent text-xs font-bold tracking-widest uppercase">
              How it work
            </div>

            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-foreground uppercase">
              Simple workflow
              <br />
              powerful results
            </h2>
          </div>

          {/* Step 1 — text left, card right */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-6">
            <div className="md:text-left">
              <h3 className="font-black text-xl md:text-2xl uppercase mb-3 leading-tight text-foreground">
                Search papers fast
              </h3>
              <p className="text-foreground/60 text-sm leading-relaxed max-w-[320px]">
                Find papers across multiple databases using a simple search, built for researchers who want results fast and a clean workflow from day one.
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="bg-[#FFF3B0] rounded-2xl border-2 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-[380px]">
                <div className="flex gap-4">
                  {/* Course card 1 */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 flex-1">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-blue-500 text-sm">📄</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground">Basic: HTML and CSS</p>
                    <div className="flex gap-2 mt-2 text-[10px] text-muted-foreground">
                      <span>📄 24</span><span>📋 8</span>
                    </div>
                  </div>
                  {/* Course card 2 */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 flex-1">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-orange-500 text-sm">✦</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground">Branding Design</p>
                    <div className="flex gap-2 mt-2 text-[10px] text-muted-foreground">
                      <span>📄 24</span><span>📋 8</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Curved arrow 1 — pointing down-left */}
          <div className="flex justify-center my-4">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-foreground">
              <path d="M55 5 C55 30, 25 30, 25 55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="4 4" />
              <path d="M20 48 L25 57 L32 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>

          {/* Step 2 — card left, text right */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mb-6">
            <div className="flex justify-center md:justify-start order-2 md:order-1">
              <div className="bg-white rounded-2xl border-2 border-foreground p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-[380px]">
                {/* Chart header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-orange-400"></span>
                    <span className="text-[11px] text-muted-foreground">Study</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-orange-200"></span>
                    <span className="text-[11px] text-muted-foreground">Exams</span>
                  </div>
                </div>
                {/* Bar chart */}
                <div className="flex items-end gap-3 h-[120px]">
                  {[
                    { h1: 40, h2: 25, label: 'Jan' },
                    { h1: 55, h2: 35, label: 'Feb' },
                    { h1: 65, h2: 30, label: 'Mar' },
                    { h1: 50, h2: 40, label: 'Apr' },
                    { h1: 45, h2: 30, label: 'May' },
                  ].map((bar) => (
                    <div key={bar.label} className="flex flex-col items-center flex-1 gap-1">
                      <div className="flex gap-0.5 items-end w-full justify-center">
                        <div className="w-3 bg-orange-400 rounded-t-sm" style={{ height: `${bar.h1}px` }}></div>
                        <div className="w-3 bg-orange-200 rounded-t-sm" style={{ height: `${bar.h2}px` }}></div>
                      </div>
                      <span className="text-[9px] text-muted-foreground mt-1">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="md:text-left order-1 md:order-2">
              <h3 className="font-black text-xl md:text-2xl uppercase mb-3 leading-tight text-foreground">
                Focus on your research
              </h3>
              <p className="text-foreground/60 text-sm leading-relaxed max-w-[320px]">
                Send reminders, track activity, and make learning interactive with smart tools that boost focus, motivation, and research progress over time.
              </p>
            </div>
          </div>

          {/* Curved arrow 2 — pointing down-right */}
          <div className="flex justify-center my-4">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-foreground">
              <path d="M25 5 C25 30, 55 30, 55 55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="4 4" />
              <path d="M48 48 L55 57 L60 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>

          {/* Step 3 — text left, card right */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="md:text-left">
              <h3 className="font-black text-xl md:text-2xl uppercase mb-3 leading-tight text-foreground">
                Track. Learn. Improve.
              </h3>
              <p className="text-foreground/60 text-sm leading-relaxed max-w-[320px]">
                Use built-in analytics to see what works, update your content, and grow your research using real-time data that helps you improve every step.
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="bg-[#F3E8FF] rounded-2xl border-2 border-foreground p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-[380px]">
                <p className="text-base font-bold mb-4 text-foreground">Leader Board</p>
                <div className="flex text-[10px] text-muted-foreground gap-8 mb-3 uppercase tracking-wider">
                  <span className="w-10">Rank</span>
                  <span>Name</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="font-bold w-6 text-foreground">1</span>
                    <span className="text-green-500 text-sm">▲</span>
                    <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300"></div>
                    <span className="text-foreground text-sm font-medium">Charlie Rawal</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold w-6 text-foreground">2</span>
                    <span className="text-red-500 text-sm">▼</span>
                    <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300"></div>
                    <span className="text-foreground text-sm font-medium">Ariana Agarwal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="hero-section py-24">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-foreground uppercase">
              Common questions
              <br />
              answered clearly
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Here are clear answers to the most common questions we
              get from researchers and teams using the platform.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="max-w-[700px] mx-auto space-y-4">
            {[
              'Can I cancel anytime?',
              'Do I need to download or install anything?',
              'Is there a free trial available?',
              'Can I search multiple databases at once?',
              'How many papers can I save?',
              'Do researchers need their own account?',
            ].map((question) => (
              <div
                key={question}
                className="faq-item flex items-center justify-between p-5 md:p-6 rounded-xl border-2 border-foreground bg-card cursor-pointer"
              >
                <span className="font-black text-sm md:text-base uppercase tracking-wide text-foreground">
                  {question}
                </span>
                <div className="w-9 h-9 rounded-full bg-hero-accent border-2 border-foreground flex items-center justify-center flex-shrink-0 ml-4">
                  <span className="text-foreground font-bold text-base leading-none">›</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#D4F5E9] py-8">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <Link href="/" className="flex items-center">
              <span className="text-2xl tracking-wide" style={{ fontFamily: 'var(--font-bungee)', color: 'hsl(45, 100%, 50%)' }}>
                Research Flow
              </span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-8">
              {['Benefits', 'How it work', 'Testimonials', 'Pricing'].map((link) => (
                <span key={link} className="text-sm font-medium text-foreground/70 hover:text-foreground cursor-pointer transition-colors">
                  {link}
                </span>
              ))}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {['𝕏', '📷', '🔗'].map((icon, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-hero-accent border-2 border-foreground flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                  <span className="text-foreground text-sm">{icon}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-sm text-foreground/50">
              © 2026 ReSearch Flow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
