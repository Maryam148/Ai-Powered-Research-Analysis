'use client'

import { useState, useEffect } from 'react'

const SCENE_DURATION = 4000 // 4s per scene
const TOTAL_SCENES = 5

export function ExplainerAnimation() {
    const [scene, setScene] = useState(0)
    const [typedText, setTypedText] = useState('')
    const [showCards, setShowCards] = useState(false)

    // Scene cycling
    useEffect(() => {
        const interval = setInterval(() => {
            setScene((prev) => (prev + 1) % TOTAL_SCENES)
        }, SCENE_DURATION)
        return () => clearInterval(interval)
    }, [])

    // Typing animation for scene 0
    useEffect(() => {
        if (scene === 0) {
            const text = 'Machine Learning in Healthcare'
            let i = 0
            setTypedText('')
            setShowCards(false)
            const typing = setInterval(() => {
                setTypedText(text.slice(0, i + 1))
                i++
                if (i >= text.length) {
                    clearInterval(typing)
                    setTimeout(() => setShowCards(true), 300)
                }
            }, 60)
            return () => clearInterval(typing)
        }
    }, [scene])

    // Scene triggers
    useEffect(() => {
        if (scene === 1) { setShowCards(true); }
        if (scene === 2) { setShowCards(false) }
        // other scenes just CSS animate
    }, [scene])

    return (
        <div className="explainer-container">
            {/* Floating particles */}
            <div className="explainer-particles">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="particle" style={{
                        left: `${10 + (i * 12) % 80}%`,
                        top: `${15 + (i * 17) % 70}%`,
                        animationDelay: `${i * 0.8}s`,
                        width: `${4 + (i % 3) * 3}px`,
                        height: `${4 + (i % 3) * 3}px`,
                    }} />
                ))}
            </div>

            {/* Scene content */}
            <div className="explainer-viewport">
                {/* Scene 0: Smart Topic Search */}
                <div className={`explainer-scene ${scene === 0 ? 'scene-active' : 'scene-hidden'}`}>
                    <div className="scene-label">Start With a Topic</div>
                    <div className="search-bar-anim">
                        <div className="search-icon">🔍</div>
                        <span className="typed-text">{scene === 0 ? typedText : ''}</span>
                        <span className="cursor-blink">|</span>
                    </div>
                    <div className="scene-sublabel">Find relevant research instantly.</div>
                    {showCards && scene === 0 && (
                        <div className="paper-cards-anim">
                            {['Neural Networks for Diagnosis', 'Deep Learning in Radiology', 'Predictive Models'].map((t, i) => (
                                <div key={t} className="paper-card-mini" style={{ animationDelay: `${i * 0.15}s` }}>
                                    <div className="paper-card-dot" style={{ background: ['#818cf8', '#34d399', '#f59e0b'][i] }} />
                                    <span>{t}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Scene 1: Metadata Preview */}
                <div className={`explainer-scene ${scene === 1 ? 'scene-active' : 'scene-hidden'}`}>
                    <div className="scene-label">Scan Key Insights</div>
                    <div className="metadata-cards">
                        {[
                            { title: 'Deep Learning for Medical Imaging', authors: 'Smith, Johnson et al.', citations: 342 },
                            { title: 'Clinical NLP: A Review', authors: 'Chen, Williams et al.', citations: 189 },
                            { title: 'Predictive Analytics in ICU', authors: 'Patel, Brown et al.', citations: 256 },
                        ].map((paper, i) => (
                            <div key={paper.title} className="metadata-card" style={{ animationDelay: `${i * 0.2}s` }}>
                                <div className="metadata-title">{paper.title}</div>
                                <div className="metadata-authors">{paper.authors}</div>
                                <div className="metadata-abstract">This study explores novel approaches to integrating AI with clinical workflows...</div>
                                <div className="metadata-badge">
                                    <span>📊 {paper.citations}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="scene-sublabel">Authors • Abstract • Citations</div>
                </div>

                {/* Scene 2: Citation Mesh */}
                <div className={`explainer-scene ${scene === 2 ? 'scene-active' : 'scene-hidden'}`}>
                    <div className="scene-label">Explore Research Connections</div>
                    <div className="citation-mesh">
                        <svg viewBox="0 0 300 200" className="mesh-svg">
                            {/* Connection lines */}
                            <line x1="150" y1="100" x2="60" y2="40" className="mesh-line" style={{ animationDelay: '0.2s' }} />
                            <line x1="150" y1="100" x2="240" y2="50" className="mesh-line" style={{ animationDelay: '0.4s' }} />
                            <line x1="150" y1="100" x2="80" y2="160" className="mesh-line" style={{ animationDelay: '0.6s' }} />
                            <line x1="150" y1="100" x2="230" y2="150" className="mesh-line" style={{ animationDelay: '0.8s' }} />
                            <line x1="150" y1="100" x2="150" y2="30" className="mesh-line" style={{ animationDelay: '0.3s' }} />
                            <line x1="60" y1="40" x2="150" y2="30" className="mesh-line" style={{ animationDelay: '1s' }} />
                            <line x1="240" y1="50" x2="150" y2="30" className="mesh-line" style={{ animationDelay: '1.1s' }} />
                            {/* Nodes */}
                            <circle cx="150" cy="100" r="14" className="mesh-node mesh-center" />
                            <circle cx="60" cy="40" r="8" className="mesh-node mesh-outer" style={{ animationDelay: '0.2s' }} />
                            <circle cx="240" cy="50" r="9" className="mesh-node mesh-outer" style={{ animationDelay: '0.4s' }} />
                            <circle cx="80" cy="160" r="7" className="mesh-node mesh-outer" style={{ animationDelay: '0.6s' }} />
                            <circle cx="230" cy="150" r="8" className="mesh-node mesh-outer" style={{ animationDelay: '0.8s' }} />
                            <circle cx="150" cy="30" r="10" className="mesh-node mesh-outer" style={{ animationDelay: '0.3s' }} />
                        </svg>
                    </div>
                </div>

                {/* Scene 3: AI Summary + Trends */}
                <div className={`explainer-scene ${scene === 3 ? 'scene-active' : 'scene-hidden'}`}>
                    <div className="scene-label">AI-Powered Analysis</div>
                    <div className="ai-split">
                        <div className="ai-summary-card">
                            <div className="ai-btn">✨ Generate Summary</div>
                            <div className="ai-typing">
                                <span className="ai-line" style={{ animationDelay: '0.3s' }}>This systematic review examines the</span>
                                <span className="ai-line" style={{ animationDelay: '0.8s' }}>intersection of machine learning and</span>
                                <span className="ai-line" style={{ animationDelay: '1.3s' }}>clinical decision support systems...</span>
                            </div>
                        </div>
                        <div className="ai-trends-card">
                            <div className="mini-chart">
                                {[35, 55, 45, 70, 60, 80, 75].map((h, i) => (
                                    <div key={i} className="chart-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
                                ))}
                            </div>
                            <div className="keyword-cloud">
                                {['NLP', 'CNN', 'Transformer', 'BERT', 'GAN'].map((w, i) => (
                                    <span key={w} className="kw-tag" style={{ animationDelay: `${i * 0.15}s` }}>{w}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="scene-sublabel">Summaries & Research Trends</div>
                </div>

                {/* Scene 4: Draft & Export */}
                <div className={`explainer-scene ${scene === 4 ? 'scene-active' : 'scene-hidden'}`}>
                    <div className="scene-label">From Research to Draft — Faster</div>
                    <div className="export-view">
                        <div className="doc-preview">
                            <div className="doc-section" style={{ animationDelay: '0.2s' }}>
                                <div className="doc-heading">1. Introduction</div>
                                <div className="doc-lines">
                                    <div className="doc-line" /><div className="doc-line" /><div className="doc-line short" />
                                </div>
                            </div>
                            <div className="doc-section" style={{ animationDelay: '0.5s' }}>
                                <div className="doc-heading">2. Literature Review</div>
                                <div className="doc-lines">
                                    <div className="doc-line" /><div className="doc-line" /><div className="doc-line" /><div className="doc-line short" />
                                </div>
                            </div>
                            <div className="doc-section" style={{ animationDelay: '0.8s' }}>
                                <div className="doc-heading">3. Methodology</div>
                                <div className="doc-lines">
                                    <div className="doc-line" /><div className="doc-line short" />
                                </div>
                            </div>
                        </div>
                        <div className="export-icons">
                            {[
                                { icon: '📄', label: 'PDF' },
                                { icon: '📝', label: 'DOCX' },
                                { icon: '📚', label: 'BibTeX' },
                            ].map((exp, i) => (
                                <div key={exp.label} className="export-icon" style={{ animationDelay: `${0.8 + i * 0.2}s` }}>
                                    <span className="export-emoji">{exp.icon}</span>
                                    <span className="export-label">{exp.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress dots */}
            <div className="scene-dots">
                {Array.from({ length: TOTAL_SCENES }).map((_, i) => (
                    <div key={i} className={`scene-dot ${scene === i ? 'dot-active' : ''}`} />
                ))}
            </div>
        </div>
    )
}
