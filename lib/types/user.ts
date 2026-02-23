export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Search {
  id: string;
  user_id: string;
  query: string;
  results_count: number;
  created_at: string;
}

export interface SavedPaper {
  id: string;
  user_id: string;
  paper_doi?: string;
  paper_title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paper_data: any;
  notes?: string;
  created_at: string;
}

export interface GeneratedReview {
  id: string;
  user_id: string;
  title: string;
  content: string;
  paper_ids: string[];
  created_at: string;
}
