'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'

interface GraphNode extends d3.SimulationNodeDatum {
    id: string
    title: string
    authors: string
    year: number
    citationCount: number
    type: 'center' | 'reference' | 'citation' | 'expanded'
    url?: string
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
    type: 'reference' | 'citation'
}

interface CitationData {
    nodes: GraphNode[]
    links: GraphLink[]
}

interface TooltipState {
    node: GraphNode
    x: number
    y: number
}

const NODE_COLORS: Record<string, string> = {
    center: '#1a1a1a',
    reference: '#6366f1',
    citation: '#f59e0b',
    expanded: '#10b981',
}

const LINK_COLORS: Record<string, string> = {
    reference: '#6366f1',
    citation: '#f59e0b',
}

function getRadius(d: GraphNode): number {
    if (d.type === 'center') return 22
    const scale = Math.min((d.citationCount || 0) / 200, 1)
    return 8 + scale * 14
}

interface CitationGraphProps {
    paperId: string
    paperTitle: string
}

export default function CitationGraph({ paperId }: CitationGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null)
    const [data, setData] = useState<CitationData>({ nodes: [], links: [] })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [tooltip, setTooltip] = useState<TooltipState | null>(null)
    const [expandingId, setExpandingId] = useState<string | null>(null)
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
    const [nodeCount, setNodeCount] = useState(0)

    const fetchCitations = useCallback(async (id: string): Promise<CitationData | null> => {
        const res = await fetch(`/api/papers/citations?paperId=${encodeURIComponent(id)}`)
        if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            throw new Error(body.error || `API error ${res.status}`)
        }
        return res.json()
    }, [])

    // Load initial data
    const loadInitial = useCallback(() => {
        setIsLoading(true)
        setError(null)
        fetchCitations(paperId)
            .then(result => {
                if (result) {
                    setData(result)
                    setNodeCount(result.nodes.length)
                }
            })
            .catch(err => {
                setError(err.message || 'Could not load citation data.')
            })
            .finally(() => setIsLoading(false))
    }, [paperId, fetchCitations])

    useEffect(() => { loadInitial() }, [loadInitial])

    // Expand a node by fetching its references
    const expandNode = useCallback(async (nodeId: string) => {
        if (expandedIds.has(nodeId) || expandingId) return
        setExpandingId(nodeId)
        try {
            const newData = await fetchCitations(nodeId)
            if (!newData) return
            // Mark as expanded even if no new nodes came back
            setExpandedIds(prev => new Set([...prev, nodeId]))
            setData(prev => {
                const existingIds = new Set(prev.nodes.map(n => n.id))
                const addNodes = newData.nodes
                    .filter(n => !existingIds.has(n.id) && n.type !== 'center')
                    .map(n => ({ ...n, type: 'expanded' as const }))
                const addLinks: GraphLink[] = addNodes.map(n => ({
                    source: nodeId,
                    target: n.id,
                    type: 'reference' as const,
                }))
                const next = {
                    nodes: [...prev.nodes, ...addNodes],
                    links: [...prev.links, ...addLinks],
                }
                setNodeCount(next.nodes.length)
                return next
            })
        } catch (err) {
            console.error('Expand node error:', err)
        } finally {
            setExpandingId(null)
        }
    }, [expandedIds, expandingId, fetchCitations])

    // D3 render (runs whenever data changes)
    useEffect(() => {
        if (!svgRef.current || data.nodes.length === 0) return

        const container = svgRef.current.parentElement
        const width = container?.clientWidth || 800
        const height = container?.clientHeight || 600

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)

        svg.selectAll('*').remove()

        // Arrow markers
        const defs = svg.append('defs')
        for (const type of ['reference', 'citation', 'expanded'] as const) {
            defs.append('marker')
                .attr('id', `arrow-${type}`)
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 26)
                .attr('refY', 0)
                .attr('markerWidth', 6)
                .attr('markerHeight', 6)
                .attr('orient', 'auto')
                .append('path')
                .attr('d', 'M0,-5L10,0L0,5')
                .attr('fill', type === 'reference' ? '#6366f1' : type === 'citation' ? '#f59e0b' : '#10b981')
        }

        // Zoom container
        const g = svg.append('g')
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.15, 4])
            .on('zoom', event => g.attr('transform', event.transform))
        svg.call(zoom)

        // Clone data to avoid D3 mutation issues
        const nodes: GraphNode[] = data.nodes.map(d => ({ ...d }))
        const links: GraphLink[] = data.links.map(l => ({
            source: typeof l.source === 'object' ? (l.source as GraphNode).id : l.source,
            target: typeof l.target === 'object' ? (l.target as GraphNode).id : l.target,
            type: l.type,
        }))

        // Force simulation
        const simulation = d3.forceSimulation<GraphNode>(nodes)
            .force('link', d3.forceLink<GraphNode, GraphLink>(links)
                .id(d => d.id)
                .distance(130)
            )
            .force('charge', d3.forceManyBody<GraphNode>().strength(-380))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide<GraphNode>().radius(d => getRadius(d) + 14))

        // Links
        const link = g.append('g')
            .selectAll<SVGLineElement, GraphLink>('line')
            .data(links)
            .join('line')
            .attr('stroke', d => LINK_COLORS[d.type] || '#94a3b8')
            .attr('stroke-opacity', 0.3)
            .attr('stroke-width', 1.5)
            .attr('marker-end', d => `url(#arrow-${d.type})`)

        // Node groups
        const nodeG = g.append('g')
            .selectAll<SVGGElement, GraphNode>('g')
            .data(nodes)
            .join('g')
            .attr('cursor', d => d.type === 'center' ? 'grab' : 'pointer')
            .call(
                d3.drag<SVGGElement, GraphNode>()
                    .on('start', (event, d) => {
                        if (!event.active) simulation.alphaTarget(0.3).restart()
                        d.fx = d.x; d.fy = d.y
                    })
                    .on('drag', (event, d) => {
                        d.fx = event.x; d.fy = event.y
                    })
                    .on('end', (event, d) => {
                        if (!event.active) simulation.alphaTarget(0)
                        if (d.type !== 'center') { d.fx = null; d.fy = null }
                    })
            )

        // Glow effect for center
        nodeG.filter(d => d.type === 'center')
            .append('circle')
            .attr('r', 32)
            .attr('fill', '#1a1a1a')
            .attr('opacity', 0.06)

        // Main circles
        nodeG.append('circle')
            .attr('r', d => getRadius(d))
            .attr('fill', d => NODE_COLORS[d.type] || '#94a3b8')
            .attr('stroke', 'white')
            .attr('stroke-width', d => d.type === 'center' ? 3 : 2)
            .attr('opacity', 0.92)

        // Labels
        nodeG.filter(d => d.type === 'center' || d.citationCount > 40)
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', d => getRadius(d) + 13)
            .attr('font-size', d => d.type === 'center' ? 11 : 9)
            .attr('font-weight', d => d.type === 'center' ? '700' : '400')
            .attr('fill', '#333')
            .attr('pointer-events', 'none')
            .text(d => d.title.length > 38 ? d.title.slice(0, 38) + '…' : d.title)

        // Hover + click
        nodeG
            .on('mouseenter', function (event, d) {
                d3.select(this).select('circle')
                    .transition().duration(120)
                    .attr('r', getRadius(d) + 4)
                    .attr('opacity', 1)
                const rect = svgRef.current?.getBoundingClientRect()
                if (rect) {
                    setTooltip({ node: d, x: event.clientX - rect.left, y: event.clientY - rect.top })
                }
            })
            .on('mousemove', function (event) {
                const rect = svgRef.current?.getBoundingClientRect()
                if (rect) {
                    setTooltip(prev => prev ? { ...prev, x: event.clientX - rect.left, y: event.clientY - rect.top } : prev)
                }
            })
            .on('mouseleave', function (_, d) {
                d3.select(this).select('circle')
                    .transition().duration(120)
                    .attr('r', getRadius(d))
                    .attr('opacity', 0.92)
                setTooltip(null)
            })
            .on('click', (_, d) => {
                if (d.type !== 'center') expandNode(d.id)
            })

        // Tick update
        simulation.on('tick', () => {
            link
                .attr('x1', d => (d.source as GraphNode).x ?? 0)
                .attr('y1', d => (d.source as GraphNode).y ?? 0)
                .attr('x2', d => (d.target as GraphNode).x ?? 0)
                .attr('y2', d => (d.target as GraphNode).y ?? 0)
            nodeG.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`)
        })

        return () => { simulation.stop() }
    }, [data, expandNode])

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-foreground/40 animate-pulse">Building citation mesh…</p>
            </div>
        )
    }

    if (error) {
        const isRateLimit = error.includes('rate-limit') || error.includes('429') || error.includes('wait')
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
                <span className="text-4xl">{isRateLimit ? '⏳' : '🔍'}</span>
                <div>
                    <p className="text-sm font-semibold text-foreground/60 mb-1">
                        {isRateLimit ? 'Rate limited by Semantic Scholar' : 'Could not load citations'}
                    </p>
                    <p className="text-xs text-foreground/35 max-w-[340px]">{error}</p>
                </div>
                <button
                    onClick={loadInitial}
                    className="px-5 py-2.5 rounded-xl bg-foreground text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                    Retry
                </button>
                {!isRateLimit && (
                    <p className="text-xs text-foreground/30">Citation mesh works for Semantic Scholar papers. Other sources need a DOI.</p>
                )}
            </div>
        )
    }

    const containerWidth = svgRef.current?.clientWidth ?? 800

    return (
        <div className="relative w-full h-full select-none">
            {expandingId && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white border border-foreground/10 rounded-full px-4 py-1.5 text-xs font-semibold text-foreground/60 shadow-sm flex items-center gap-2">
                    <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    Expanding node…
                </div>
            )}
            <div className="absolute bottom-4 left-4 z-10 bg-white/80 backdrop-blur-sm border border-foreground/10 rounded-xl px-3 py-2 text-[11px] text-foreground/50 font-medium">
                {nodeCount} nodes · Scroll to zoom · Drag to pan · Click node to expand
            </div>
            <svg ref={svgRef} className="w-full h-full" />
            {tooltip && (
                <div
                    className="absolute bg-white border border-foreground/10 rounded-xl p-3 shadow-xl text-xs max-w-[250px] z-50 pointer-events-none"
                    style={{
                        left: Math.min(tooltip.x + 14, containerWidth - 270),
                        top: tooltip.y - 10,
                    }}
                >
                    <p className="font-bold text-foreground text-[13px] leading-snug mb-1.5">{tooltip.node.title}</p>
                    {tooltip.node.authors && (
                        <p className="text-foreground/50 truncate">{tooltip.node.authors}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-foreground/35">{tooltip.node.year || 'Unknown'}</span>
                        <span className="text-foreground/35">·</span>
                        <span className="text-foreground/35">{tooltip.node.citationCount} citations</span>
                    </div>
                    {tooltip.node.type !== 'center' && !expandedIds.has(tooltip.node.id) && (
                        <p className="text-indigo-500 font-semibold mt-1.5 text-[11px]">
                            Click to expand references →
                        </p>
                    )}
                    {expandedIds.has(tooltip.node.id) && (
                        <p className="text-emerald-500 font-semibold mt-1.5 text-[11px]">✓ Expanded</p>
                    )}
                </div>
            )}
        </div>
    )
}
