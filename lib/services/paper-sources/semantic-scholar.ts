import { Paper } from '@/lib/types/paper';

const BASE_URL = 'https://api.semanticscholar.org/graph/v1';

interface SemanticScholarPaper {
  paperId: string;
  title: string;
  authors: { name: string; authorId?: string }[];
  abstract?: string;
  year?: number;
  citationCount: number;
  externalIds?: { DOI?: string };
  url?: string;
  venue?: string;
  fieldsOfStudy?: string[];
}

export async function searchSemanticScholar(query: string, limit = 50): Promise<Paper[]> {
  try {
    const params = new URLSearchParams({
      query,
      limit: limit.toString(),
      fields: 'paperId,title,authors,abstract,year,citationCount,externalIds,url,venue,fieldsOfStudy',
    });

    const headers: HeadersInit = {};
    if (process.env.SEMANTIC_SCHOLAR_API_KEY) {
      headers['x-api-key'] = process.env.SEMANTIC_SCHOLAR_API_KEY;
    }

    const response = await fetch(`${BASE_URL}/paper/search?${params}`, {
      headers,
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limited');
      }
      throw new Error(`Semantic Scholar API error: ${response.status}`);
    }

    const data = await response.json();
    const papers = data.data as SemanticScholarPaper[];

    return papers.map(p => ({
      id: p.paperId,
      title: p.title,
      authors: p.authors.map(a => ({ name: a.name, authorId: a.authorId })),
      abstract: p.abstract || '',
      year: p.year || 0,
      citationCount: p.citationCount || 0,
      doi: p.externalIds?.DOI,
      url: p.url || `https://www.semanticscholar.org/paper/${p.paperId}`,
      source: 'semantic-scholar' as const,
      venue: p.venue,
      fieldsOfStudy: p.fieldsOfStudy,
    }));
  } catch (error) {
    console.error('Semantic Scholar search error:', error);
    return [];
  }
}

export async function autocompleteSemanticScholar(query: string): Promise<any[]> {
  try {
    const params = new URLSearchParams({ query });

    const headers: HeadersInit = {};
    if (process.env.SEMANTIC_SCHOLAR_API_KEY) {
      headers['x-api-key'] = process.env.SEMANTIC_SCHOLAR_API_KEY;
    }

    const response = await fetch(`${BASE_URL}/paper/autocomplete?${params}`, {
      headers,
      next: { revalidate: 300 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.matches?.slice(0, 8) || [];
  } catch (error) {
    console.error('Autocomplete error:', error);
    return [];
  }
}
