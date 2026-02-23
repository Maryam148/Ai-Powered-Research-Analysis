import levenshtein from 'fast-levenshtein';
import { Paper } from '@/lib/types/paper';

export function isDuplicate(paper: Paper, existing: Paper[]): boolean {
  // Check DOI match first (fastest and most reliable)
  if (paper.doi && existing.some(p => p.doi === paper.doi)) {
    return true;
  }

  // Fuzzy title match with normalized strings
  const normalizedTitle = paper.title.toLowerCase().replace(/[^a-z0-9]/g, '');

  return existing.some(p => {
    const existingNorm = p.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const distance = levenshtein.get(normalizedTitle, existingNorm);
    return distance < 3;
  });
}

export function deduplicatePapers(papers: Paper[]): Paper[] {
  const unique: Paper[] = [];

  for (const paper of papers) {
    if (!isDuplicate(paper, unique)) {
      unique.push(paper);
    }
  }

  return unique;
}
