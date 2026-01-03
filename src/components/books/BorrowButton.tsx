import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Loader2, Calendar, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BorrowButtonProps {
  bookId: string;
  bookTitle: string;
  isAvailable: boolean;
  onBorrow?: () => void;
}

const BorrowButton = ({ bookId, bookTitle, isAvailable, onBorrow }: BorrowButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [borrowing, setBorrowing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBorrow = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setBorrowing(true);

    // Check if user already has this book borrowed
    const { data: existingBorrowing } = await supabase
      .from("book_borrowings")
      .select("id")
      .eq("book_id", bookId)
      .eq("user_id", user.id)
      .eq("status", "borrowed")
      .maybeSingle();

    if (existingBorrowing) {
      toast({
        title: "Already Borrowed",
        description: "You already have this book borrowed.",
        variant: "destructive",
      });
      setBorrowing(false);
      setDialogOpen(false);
      return;
    }

    // Create borrowing record
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days loan period

    const { error: borrowError } = await supabase
      .from("book_borrowings")
      .insert({
        book_id: bookId,
        user_id: user.id,
        due_date: dueDate.toISOString(),
      });

    if (borrowError) {
      toast({
        title: "Error",
        description: "Failed to borrow the book. Please try again.",
        variant: "destructive",
      });
      setBorrowing(false);
      return;
    }

    // Update book availability
    await supabase
      .from("books")
      .update({ availability: false })
      .eq("id", bookId);

    setSuccess(true);
    setBorrowing(false);
    
    toast({
      title: "Book Borrowed!",
      description: `You have successfully borrowed "${bookTitle}". Due date: ${dueDate.toLocaleDateString()}`,
    });

    onBorrow?.();
  };

  if (!isAvailable) {
    return (
      <Button disabled className="w-full" size="lg">
        <BookOpen className="mr-2 h-5 w-5" />
        Currently Unavailable
      </Button>
    );
  }

  if (!user) {
    return (
      <Button asChild className="w-full" size="lg">
        <Link to="/auth">
          <BookOpen className="mr-2 h-5 w-5" />
          Login to Borrow
        </Link>
      </Button>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <BookOpen className="mr-2 h-5 w-5" />
          Borrow This Book
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <DialogTitle className="text-center">Book Borrowed Successfully!</DialogTitle>
              <DialogDescription className="text-center">
                You have borrowed "{bookTitle}". Please return it within 14 days.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button onClick={() => navigate("/my-books")} className="w-full">
                View My Books
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full">
                Continue Browsing
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Borrowing</DialogTitle>
              <DialogDescription>
                You are about to borrow this book. The loan period is 14 days.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <h4 className="font-semibold mb-2">{bookTitle}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Due Date: {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBorrow} disabled={borrowing}>
                {borrowing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Borrow"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BorrowButton;
