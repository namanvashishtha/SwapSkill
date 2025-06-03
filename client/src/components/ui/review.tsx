import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating, StarRatingDisplay } from '@/components/ui/star-rating';
import { useToast } from '@/hooks/use-toast';
import { User } from 'lucide-react';

interface Review {
  id: number;
  reviewerId: number;
  revieweeId: number;
  matchId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer?: {
    id: number;
    username: string;
    fullName: string | null;
    imageUrl: string | null;
  };
}

interface ReviewFormProps {
  revieweeId: number;
  matchId: number;
  onReviewSubmitted?: () => void;
  className?: string;
}

export function ReviewForm({ revieweeId, matchId, onReviewSubmitted, className }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/${revieweeId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || undefined,
          matchId,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });

      // Reset form
      setRating(0);
      setComment('');
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Leave a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <StarRating
              rating={rating}
              interactive
              onRatingChange={setRating}
              size="lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Comment (optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              className="resize-none"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || rating === 0}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface ReviewListProps {
  reviews: Review[];
  className?: string;
}

export function ReviewList({ reviews, className }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        No reviews yet
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {review.reviewer?.imageUrl ? (
                  <img
                    src={review.reviewer.imageUrl}
                    alt={review.reviewer.fullName || review.reviewer.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">
                      {review.reviewer?.fullName || review.reviewer?.username || 'Anonymous'}
                    </p>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {review.comment && (
                  <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface UserRatingProps {
  userId: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function UserRating({ userId, size = 'md', showText = true, className }: UserRatingProps) {
  const [rating, setRating] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/rating`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setRating(data);
        }
      } catch (error) {
        console.error('Error fetching user rating:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [userId]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-5 w-24 rounded"></div>;
  }

  return (
    <StarRatingDisplay
      rating={rating.averageRating}
      totalReviews={rating.totalReviews}
      size={size}
      showText={showText}
      className={className}
    />
  );
}