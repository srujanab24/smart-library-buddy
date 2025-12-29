-- Create books table for the Smart Library System
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  isbn TEXT,
  availability BOOLEAN NOT NULL DEFAULT true,
  rack_number TEXT NOT NULL,
  shelf TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (everyone can view books)
CREATE POLICY "Anyone can view books"
ON public.books
FOR SELECT
USING (true);

-- Create policy for authenticated users to manage books (admin)
CREATE POLICY "Authenticated users can insert books"
ON public.books
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update books"
ON public.books
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete books"
ON public.books
FOR DELETE
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_books_updated_at
BEFORE UPDATE ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample seed data (20+ books)
INSERT INTO public.books (title, author, category, isbn, availability, rack_number, shelf, description, cover_image) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', '978-0743273565', true, 'A1', '1', 'A story of decadence and excess in the Jazz Age.', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'),
('To Kill a Mockingbird', 'Harper Lee', 'Fiction', '978-0061120084', true, 'A1', '2', 'A gripping tale of racial injustice in the American South.', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400'),
('1984', 'George Orwell', 'Science Fiction', '978-0451524935', false, 'A2', '1', 'A dystopian social science fiction novel.', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400'),
('Pride and Prejudice', 'Jane Austen', 'Romance', '978-0141439518', true, 'B1', '1', 'A romantic novel of manners.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'),
('The Catcher in the Rye', 'J.D. Salinger', 'Fiction', '978-0316769488', true, 'A1', '3', 'A story about teenage alienation and loss of innocence.', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
('The Hobbit', 'J.R.R. Tolkien', 'Fantasy', '978-0547928227', true, 'C1', '1', 'A fantasy novel about the adventures of Bilbo Baggins.', 'https://images.unsplash.com/photo-1618666012174-83b441c0bc76?w=400'),
('Harry Potter and the Sorcerers Stone', 'J.K. Rowling', 'Fantasy', '978-0590353427', false, 'C1', '2', 'The first book in the Harry Potter series.', 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400'),
('The Lord of the Rings', 'J.R.R. Tolkien', 'Fantasy', '978-0544003415', true, 'C1', '3', 'An epic high fantasy novel.', 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400'),
('Introduction to Algorithms', 'Thomas H. Cormen', 'Computer Science', '978-0262033848', true, 'D1', '1', 'A comprehensive textbook on algorithms.', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400'),
('Clean Code', 'Robert C. Martin', 'Computer Science', '978-0132350884', true, 'D1', '2', 'A handbook of agile software craftsmanship.', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400'),
('Design Patterns', 'Gang of Four', 'Computer Science', '978-0201633610', false, 'D1', '3', 'Elements of reusable object-oriented software.', 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400'),
('A Brief History of Time', 'Stephen Hawking', 'Science', '978-0553380163', true, 'E1', '1', 'A landmark volume in science writing.', 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400'),
('The Origin of Species', 'Charles Darwin', 'Science', '978-0451529060', true, 'E1', '2', 'The foundation of evolutionary biology.', 'https://images.unsplash.com/photo-1576319155264-99536e0be1ee?w=400'),
('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 'History', '978-0062316097', true, 'F1', '1', 'An exploration of human history and evolution.', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400'),
('Guns, Germs, and Steel', 'Jared Diamond', 'History', '978-0393317558', false, 'F1', '2', 'A study of human civilizations and geography.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
('The Art of War', 'Sun Tzu', 'Philosophy', '978-1590302255', true, 'G1', '1', 'An ancient Chinese military treatise.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'),
('Meditations', 'Marcus Aurelius', 'Philosophy', '978-0140449334', true, 'G1', '2', 'Personal writings of the Roman Emperor.', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400'),
('The Psychology of Money', 'Morgan Housel', 'Finance', '978-0857197689', true, 'H1', '1', 'Timeless lessons on wealth and greed.', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400'),
('Atomic Habits', 'James Clear', 'Self-Help', '978-0735211292', true, 'I1', '1', 'Tiny changes, remarkable results.', 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400'),
('Thinking, Fast and Slow', 'Daniel Kahneman', 'Psychology', '978-0374533557', true, 'I1', '2', 'An exploration of the two systems that drive the way we think.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
('The Lean Startup', 'Eric Ries', 'Business', '978-0307887894', false, 'J1', '1', 'How todays entrepreneurs use continuous innovation.', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400'),
('Zero to One', 'Peter Thiel', 'Business', '978-0804139298', true, 'J1', '2', 'Notes on startups, or how to build the future.', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400'),
('Dune', 'Frank Herbert', 'Science Fiction', '978-0441172719', true, 'A2', '2', 'A science fiction masterpiece set in a desert world.', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400'),
('Foundation', 'Isaac Asimov', 'Science Fiction', '978-0553293357', true, 'A2', '3', 'The first novel in Asimovs Foundation series.', 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400'),
('Crime and Punishment', 'Fyodor Dostoevsky', 'Fiction', '978-0143058144', true, 'A3', '1', 'A psychological study of crime and morality.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400');