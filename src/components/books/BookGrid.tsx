import { Book } from "@/types/book";
import BookCard from "./BookCard";
import { BookX } from "lucide-react";

interface BookGridProps {
  books: Book[];
  loading?: boolean;
}

const BookGrid = ({ books, loading }: BookGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse"
          >
            <div className="aspect-[3/4] bg-secondary" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-secondary rounded w-3/4" />
              <div className="h-4 bg-secondary rounded w-1/2" />
              <div className="h-4 bg-secondary rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-16">
        <BookX className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-display text-xl font-semibold mb-2">No Books Found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book, index) => (
        <div
          key={book.id}
          className="animate-fade-in opacity-0"
          style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
        >
          <BookCard book={book} />
        </div>
      ))}
    </div>
  );
};

export default BookGrid;
