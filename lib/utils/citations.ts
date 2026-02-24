import { Paper } from '@/lib/types/paper'

// ── BibTeX ────────────────────────────────────────────────────────────────────
export function toBibTeX(paper: Paper): string {
  const firstLastName =
    paper.authors[0]?.name.split(' ').at(-1) ?? 'Unknown'
  const year = paper.year || 0
  const key = `${firstLastName.replace(/\s+/g, '')}${year}`
  const authors = paper.authors.map(a => a.name).join(' and ')

  const lines = [
    `@article{${key},`,
    `  title     = {${paper.title}},`,
    `  author    = {${authors}},`,
    `  year      = {${year}},`,
  ]
  if (paper.venue) lines.push(`  journal   = {${paper.venue}},`)
  if (paper.doi) lines.push(`  doi       = {${paper.doi}},`)
  if (paper.url) lines.push(`  url       = {${paper.url}},`)
  lines.push('}')
  return lines.join('\n')
}

// ── APA 7th ───────────────────────────────────────────────────────────────────
function formatAuthorAPA(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length < 2) return name
  const lastName = parts.at(-1)!
  const initials = parts
    .slice(0, -1)
    .map(p => p[0] + '.')
    .join(' ')
  return `${lastName}, ${initials}`
}

export function toAPA(paper: Paper): string {
  const year = paper.year ? `(${paper.year})` : '(n.d.)'
  let authors = ''

  if (paper.authors.length === 0) {
    authors = 'Unknown Author'
  } else if (paper.authors.length <= 20) {
    const formatted = paper.authors.map(a => formatAuthorAPA(a.name))
    if (formatted.length === 1) {
      authors = formatted[0]
    } else {
      authors = formatted.slice(0, -1).join(', ') + ', & ' + formatted.at(-1)
    }
  } else {
    const formatted = paper.authors.slice(0, 19).map(a => formatAuthorAPA(a.name))
    authors = formatted.join(', ') + ', ... ' + formatAuthorAPA(paper.authors.at(-1)!.name)
  }

  const venue = paper.venue ? ` *${paper.venue}*.` : ''
  const doi = paper.doi
    ? ` https://doi.org/${paper.doi}`
    : paper.url
    ? ` ${paper.url}`
    : ''

  return `${authors} ${year}. ${paper.title}.${venue}${doi}`
}

// ── MLA 9th ───────────────────────────────────────────────────────────────────
export function toMLA(paper: Paper): string {
  if (paper.authors.length === 0) return `"${paper.title}." ${paper.year ?? 'n.d.'}.`

  const first = paper.authors[0]
  const firstParts = first.name.trim().split(' ')
  const firstFormatted =
    firstParts.length >= 2
      ? `${firstParts.at(-1)}, ${firstParts.slice(0, -1).join(' ')}`
      : first.name

  let authorStr = firstFormatted
  if (paper.authors.length === 2) {
    authorStr += `, and ${paper.authors[1].name}`
  } else if (paper.authors.length > 2) {
    authorStr += ', et al'
  }

  const venue = paper.venue ? ` *${paper.venue}*,` : ''
  const doi = paper.doi
    ? ` https://doi.org/${paper.doi}`
    : paper.url
    ? ` ${paper.url}`
    : ''
  const year = paper.year ?? 'n.d.'

  return `${authorStr}. "${paper.title}."${venue} ${year},${doi}.`
}

// ── Bulk export helpers ───────────────────────────────────────────────────────
export function papersToBibTeX(papers: Paper[]): string {
  return papers.map(toBibTeX).join('\n\n')
}

export function papersToAPA(papers: Paper[]): string {
  return papers
    .map((p, i) => `[${i + 1}] ${toAPA(p)}`)
    .join('\n\n')
}

export function papersToMLA(papers: Paper[]): string {
  return papers
    .map((p, i) => `${i + 1}. ${toMLA(p)}`)
    .join('\n\n')
}

// ── Download helper ───────────────────────────────────────────────────────────
export function downloadText(content: string, filename: string, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
