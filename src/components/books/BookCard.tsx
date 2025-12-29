import { Link } from "react-router-dom";
import { MapPin, User, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Book } from "@/types/book";

interface BookCardProps {
  book: Book;
}

const BookCard = ({ book }: BookCardProps) => {
  return (
    <Link to={`/book/${book.id}`} className="group">
      <article className="book-card card-gradient rounded-2xl border border-border overflow-hidden h-full">
        {/* Book Cover */}
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
          {book.cover_image ? (
            <img
              src={book.cover_image}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Availability Badge */}
          <div className="absolute top-3 right-3">
            <Badge
              className={
                book.availability
                  ? "badge-available"
                  : "badge-issued"
              }
            >
              {book.availability ? "Available" : "Issued"}
            </Badge>
          </div>
        </div>

        {/* Book Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-display font-semibold text-lg line-clamp-2 group-hover:text-accent transition-colors">
              {book.title}
            </h3>
            <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
              <User className="h-3.5 w-3.5" />
              <span className="text-sm">{book.author}</span>
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Badge variant="secondary" className="text-xs">
              {book.category}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>Rack {book.rack_number}, Shelf {book.shelf}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default BookCard;
