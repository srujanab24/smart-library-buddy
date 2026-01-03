import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface BorrowedBook {
  id: string;
  book_id: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  status: string;
  book: {
    id: string;
    title: string;
    author: string;
    cover_image: string | null;
    category: string;
  };
}

const MyBooks = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [borrowings, setBorrowings] = useState<BorrowedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBorrowings();
    }
  }, [user]);

  const fetchBorrowings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("book_borrowings")
      .select(`
        id,
        book_id,
        borrowed_at,
        due_date,
        returned_at,
        status,
        book:books(id, title, author, cover_image, category)
      `)
      .eq("user_id", user?.id)
      .order("borrowed_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your borrowed books.",
        variant: "destructive",
      });
    } else {
      setBorrowings(data as unknown as BorrowedBook[]);
    }
    setLoading(false);
  };

  const handleReturn = async (borrowingId: string, bookId: string) => {
    setReturningId(borrowingId);
    
    // Update borrowing status
    const { error: borrowError } = await supabase
      .from("book_borrowings")
      .update({
        status: "returned",
        returned_at: new Date().toISOString(),
      })
      .eq("id", borrowingId);

    if (borrowError) {
      toast({
        title: "Error",
        description: "Failed to return the book. Please try again.",
        variant: "destructive",
      });
      setReturningId(null);
      return;
    }

    // Update book availability
    await supabase
      .from("books")
      .update({ availability: true })
      .eq("id", bookId);

    toast({
      title: "Book Returned!",
      description: "Thank you for returning the book.",
    });
    
    fetchBorrowings();
    setReturningId(null);
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status === "borrowed";
    
    if (status === "returned") {
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
          <CheckCircle className="h-3 w-3 mr-1" />
          Returned
        </Badge>
      );
    }
    
    if (isOverdue) {
      return (
        <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
        <Clock className="h-3 w-3 mr-1" />
        Borrowed
      </Badge>
    );
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">My Books</h1>
          <p className="text-muted-foreground">
            Track your borrowed books and return history
          </p>
        </div>

        {borrowings.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">
                No Borrowed Books
              </h2>
              <p className="text-muted-foreground mb-6">
                You haven't borrowed any books yet. Start exploring our library!
              </p>
              <Button onClick={() => navigate("/search")}>
                Find Books
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {borrowings.map((borrowing) => (
              <Card key={borrowing.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Book Cover */}
                    <Link
                      to={`/book/${borrowing.book.id}`}
                      className="sm:w-24 h-32 sm:h-auto flex-shrink-0 bg-secondary"
                    >
                      {borrowing.book.cover_image ? (
                        <img
                          src={borrowing.book.cover_image}
                          alt={borrowing.book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </Link>

                    {/* Book Details */}
                    <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(borrowing.status, borrowing.due_date)}
                          <Badge variant="secondary" className="text-xs">
                            {borrowing.book.category}
                          </Badge>
                        </div>
                        <Link
                          to={`/book/${borrowing.book.id}`}
                          className="font-display font-semibold text-lg hover:text-primary transition-colors"
                        >
                          {borrowing.book.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          by {borrowing.book.author}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Borrowed: {new Date(borrowing.borrowed_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {new Date(borrowing.due_date).toLocaleDateString()}
                          </span>
                          {borrowing.returned_at && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Returned: {new Date(borrowing.returned_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {borrowing.status !== "returned" && (
                        <Button
                          onClick={() => handleReturn(borrowing.id, borrowing.book_id)}
                          disabled={returningId === borrowing.id}
                          className="sm:w-auto"
                        >
                          {returningId === borrowing.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Returning...
                            </>
                          ) : (
                            "Return Book"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyBooks;
