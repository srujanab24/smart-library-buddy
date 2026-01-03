import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Star, User, Loader2, Edit2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  profile?: {
    full_name: string | null;
  };
}

interface BookReviewsProps {
  bookId: string;
}

const BookReviews = ({ bookId }: BookReviewsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("book_reviews")
      .select(`
        id,
        user_id,
        rating,
        review_text,
        created_at,
        profile:profiles(full_name)
      `)
      .eq("book_id", bookId)
      .order("created_at", { ascending: false });

    if (data) {
      const reviewsWithProfiles = data as unknown as Review[];
      setReviews(reviewsWithProfiles);
      
      // Find user's review if logged in
      if (user) {
        const myReview = reviewsWithProfiles.find(r => r.user_id === user.id);
        if (myReview) {
          setUserReview(myReview);
          setUserRating(myReview.rating);
          setReviewText(myReview.review_text || "");
        }
      }
    }
    setLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to leave a review.",
        variant: "destructive",
      });
      return;
    }

    if (userRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    if (userReview) {
      // Update existing review
      const { error } = await supabase
        .from("book_reviews")
        .update({
          rating: userRating,
          review_text: reviewText || null,
        })
        .eq("id", userReview.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update your review.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Review Updated!",
          description: "Your review has been updated.",
        });
        setEditingReview(null);
        fetchReviews();
      }
    } else {
      // Create new review
      const { error } = await supabase
        .from("book_reviews")
        .insert({
          book_id: bookId,
          user_id: user.id,
          rating: userRating,
          review_text: reviewText || null,
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to submit your review.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Review Submitted!",
          description: "Thank you for your review.",
        });
        fetchReviews();
      }
    }

    setSubmitting(false);
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;

    const { error } = await supabase
      .from("book_reviews")
      .delete()
      .eq("id", userReview.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete your review.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Review Deleted",
        description: "Your review has been removed.",
      });
      setUserReview(null);
      setUserRating(0);
      setReviewText("");
      fetchReviews();
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const StarRating = ({ rating, interactive = false, size = "md" }: { rating: number; interactive?: boolean; size?: "sm" | "md" }) => {
    const sizeClass = size === "sm" ? "h-4 w-4" : "h-6 w-6";
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setUserRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}
          >
            <Star
              className={`${sizeClass} ${
                star <= (interactive ? (hoverRating || rating) : rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-xl">
            Reviews & Ratings
          </CardTitle>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(averageRating)} />
              <span className="font-semibold">{averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Write Review Section */}
        {user ? (
          !userReview || editingReview ? (
            <div className="space-y-4 p-4 rounded-xl bg-secondary/50 border border-border">
              <h4 className="font-medium">
                {userReview ? "Edit Your Review" : "Write a Review"}
              </h4>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Your Rating</p>
                <StarRating rating={userRating} interactive />
              </div>
              <div>
                <Textarea
                  placeholder="Share your thoughts about this book... (optional)"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmitReview} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : userReview ? (
                    "Update Review"
                  ) : (
                    "Submit Review"
                  )}
                </Button>
                {editingReview && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingReview(null);
                      setUserRating(userReview?.rating || 0);
                      setReviewText(userReview?.review_text || "");
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Your Review</p>
                  <StarRating rating={userReview.rating} size="sm" />
                  {userReview.review_text && (
                    <p className="mt-2 text-sm">{userReview.review_text}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingReview(userReview.id)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDeleteReview}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="text-center p-4 rounded-xl bg-secondary/50 border border-border">
            <p className="text-muted-foreground mb-2">
              Login to leave a review
            </p>
            <Button asChild variant="outline">
              <Link to="/auth">Login / Sign Up</Link>
            </Button>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No reviews yet. Be the first to review this book!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews
              .filter((r) => r.user_id !== user?.id)
              .map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-xl bg-secondary/30 border border-border"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {review.profile?.full_name || "Anonymous"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                      {review.review_text && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {review.review_text}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookReviews;
