import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import BookGrid from "@/components/books/BookGrid";
import BookReviews from "@/components/books/BookReviews";
import BorrowButton from "@/components/books/BorrowButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book } from "@/types/book";
import {
  ArrowLeft,
  MapPin,
  User,
  BookOpen,
  Calendar,
  Hash,
  Layers,
} from "lucide-react";

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBook = async () => {
    if (!id) return;

    setLoading(true);
    const { data } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (data) {
      setBook(data);

      // Fetch recommendations (same category, different book)
      const { data: related } = await supabase
        .from("books")
        .select("*")
        .eq("category", data.category)
        .neq("id", id)
        .limit(4);

      if (related) {
        setRecommendations(related);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  const handleBorrow = () => {
    // Refresh book data to update availability
    fetchBook();
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary rounded w-32 mb-8" />
            <div className="grid md:grid-cols-3 gap-8">
              <div className="aspect-[3/4] bg-secondary rounded-2xl" />
              <div className="md:col-span-2 space-y-4">
                <div className="h-10 bg-secondary rounded w-3/4" />
                <div className="h-6 bg-secondary rounded w-1/2" />
                <div className="h-32 bg-secondary rounded" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!book) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Book Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The book you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/search")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>

        {/* Book Details */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Book Cover */}
          <div className="animate-scale-in">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary shadow-lg">
              {book.cover_image ? (
                <img
                  src={book.cover_image}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-24 w-24 text-muted-foreground/50" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <Badge
                  className={`text-sm px-3 py-1 ${
                    book.availability ? "badge-available" : "badge-issued"
                  }`}
                >
                  {book.availability ? "Available" : "Issued"}
                </Badge>
              </div>
            </div>

            {/* Borrow Button */}
            <div className="mt-4">
              <BorrowButton
                bookId={book.id}
                bookTitle={book.title}
                isAvailable={book.availability}
                onBorrow={handleBorrow}
              />
            </div>
          </div>

          {/* Book Info */}
          <div className="md:col-span-2 animate-fade-in">
            <Badge variant="secondary" className="mb-4">
              {book.category}
            </Badge>

            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
              {book.title}
            </h1>

            <p className="flex items-center gap-2 text-lg text-muted-foreground mb-6">
              <User className="h-5 w-5" />
              {book.author}
            </p>

            {book.description && (
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {book.description}
              </p>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Rack</span>
                </div>
                <p className="font-semibold text-lg">{book.rack_number}</p>
              </div>

              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Layers className="h-4 w-4" />
                  <span className="text-sm">Shelf</span>
                </div>
                <p className="font-semibold text-lg">{book.shelf}</p>
              </div>

              {book.isbn && (
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Hash className="h-4 w-4" />
                    <span className="text-sm">ISBN</span>
                  </div>
                  <p className="font-semibold text-sm">{book.isbn}</p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Added</span>
                </div>
                <p className="font-semibold text-sm">
                  {new Date(book.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Location Highlight */}
            <div className="mt-6 p-6 rounded-2xl accent-gradient">
              <div className="flex items-center gap-3">
                <MapPin className="h-8 w-8" />
                <div>
                  <p className="text-sm opacity-80">Find this book at</p>
                  <p className="text-xl font-bold">
                    Rack {book.rack_number}, Shelf {book.shelf}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <BookReviews bookId={book.id} />

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold mb-6">
              Related Books in {book.category}
            </h2>
            <BookGrid books={recommendations} />
          </section>
        )}
      </div>
    </Layout>
  );
};

export default BookDetails;
