export interface RagQuery {
  query: string;
  filters?: {
    [key: string]: any;
  };
}

export interface RagResponse {
  answer: string;
  documents: RagDocument[];
}

export interface RagDocument {
  document: string;
  content: string;
  score: number;
}