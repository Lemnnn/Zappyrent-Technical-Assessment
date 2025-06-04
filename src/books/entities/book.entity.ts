export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  year: number;
  coverImageURL?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}
