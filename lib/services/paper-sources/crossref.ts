import { Paper } from '@/lib/types/paper';

const BASE_URL = 'https://api.crossref.org';

interface CrossRefWork {
  DOI: string;
  title: string[];
  author?: { given?: string; family: string }[];
  abstract?: string;
  published?: { 'date-parts': number[][] };
  'is-referenced-by-count'?: number;
  URL?: string;
  'container-title'?: string[];
  subject?: string[];
}

export async function searchCrossRef(query: string, limit = 50): Promise<Paper[]> {
  try {
    const params = new URLSearchParams({
      query: query,
      rows: limit.toString(),
      'mailto': 'research-flow@example.com',
    });

    const response = await fetch(`${BASE_URL}/works?${params}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`CrossRef API error: ${response.status}`);
    }

    const data = await response.json();
    const items = data.message.items as CrossRefWork[];

    return items.map(item => {
      const year = item.published?.['date-parts']?.[0]?.[0] || 0;
      const authors = item.author?.map(a => ({
        name: `${a.given || ''} ${a.family}`.trim(),
      })) || [];

      return {
        id: item.DOI,
        title: item.title?.[0] || '',
        authors,
        abstract: item.abstract || '',
        year,
        citationCount: item['is-referenced-by-count'] || 0,
        doi: item.DOI,
        url: item.URL || `https://doi.org/${item.DOI}`,
        source: 'crossref' as const,
        venue: item['container-title']?.[0],
        fieldsOfStudy: item.subject?.slice(0, 5),
      };
    });
  } catch (error) {
    console.error('CrossRef search error:', error);
    return [];
  }
}
