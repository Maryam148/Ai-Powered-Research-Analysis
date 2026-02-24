export interface Paper {
  id: string;
  title: string;
  authors: Author[];
  abstract: string;
  year: number;
  citationCount: number;
  doi?: string;
  url?: string;
  source: 'semantic-scholar' | 'openalex' | 'crossref';
  venue?: string;
  fieldsOfStudy?: string[];
  aiSummary?: string;
}

export interface Author {
  name: string;
  authorId?: string;
}

export interface PaperSearchResult {
  papers: Paper[];
  total: number;
  offset: number;
}

export interface AutocompleteSuggestion {
  title: string;
  authors: string[];
  year: number;
  paperId?: string;
}
