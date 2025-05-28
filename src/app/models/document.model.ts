export interface Document {
  id?: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  uploadDate?: Date;
  status?: 'uploading' | 'processing' | 'indexed' | 'failed';
  progress?: number;
} 