import { Paper } from '@/lib/types/paper';

const BASE_URL = 'https://api.openalex.org';

interface OpenAlexWork {
  id: string;
  display_name: string;
  authorships: { author: { display_name: string; id?: string } }[];
  abstract_inverted_index?: Record<string, number[]>;
  publication_year?: number;
  cited_by_count: number;
  doi?: string;
  primary_location?: { landing_page_url?: string };
  host_venue?: { display_name?: string };
  topics?: { display_name: string }[];
}

function reconstructAbstract(invertedIndex: Record<string, number[]> | undefined): string {
  if (!invertedIndex) return '';

  const words: [string, number][] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    positions.forEach(pos => words.push([word, pos]));
  }

  words.sort((a, b) => a[1] - b[1]);
  return words.map(w => w[0]).join(' ').slice(0, 500);
}

export async function searchOpenAlex(query: string, limit = 50): Promise<Paper[]> {
  try {
    const params = new URLSearchParams({
      search: query,
      per_page: limit.toString(),
      'mailto': 'research-flow@example.com', // Required for polite pool
    });

    const response = await fetch(`${BASE_URL}/works?${params}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`OpenAlex API error: ${response.status}`);
    }

    const data = await response.json();
    const works = data.results as OpenAlexWork[];

    return works.map(w => ({
      id: w.id,
      title: w.display_name,
      authors: w.authorships.map(a => ({
        name: a.author.display_name,
        authorId: a.author.id,
      })),
      abstract: reconstructAbstract(w.abstract_inverted_index),
      year: w.publication_year || 0,
      citationCount: w.cited_by_count || 0,
      doi: w.doi?.replace('https://doi.org/', ''),
      url: w.primary_location?.landing_page_url || w.id,
      source: 'openalex' as const,
      venue: w.host_venue?.display_name,
      fieldsOfStudy: w.topics?.map(t => t.display_name).slice(0, 5),
    }));
  } catch (error) {
    console.error('OpenAlex search error:', error);
    return [];
  }
}
