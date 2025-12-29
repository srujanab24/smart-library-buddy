export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string | null;
  availability: boolean;
  rack_number: string;
  shelf: string;
  description: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
}

export type BookCategory = 
  | 'Fiction'
  | 'Science Fiction'
  | 'Fantasy'
  | 'Romance'
  | 'Computer Science'
  | 'Science'
  | 'History'
  | 'Philosophy'
  | 'Finance'
  | 'Self-Help'
  | 'Psychology'
  | 'Business';
