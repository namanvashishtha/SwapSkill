import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, User, BookOpen, GraduationCap, Loader2, MessageCircle } from 'lucide-react';
import { UserRating, ReviewForm, ReviewList } from '@/components/ui/review';
import { useLocation } from 'wouter';

interface UserProfile {
  id: number;
  username: string;
  fullName: string | null;
  email: string | null;
  location: string | null;
  skillsToTeach: string[] | null;
  skillsToLearn: string[] | null;
  bio?: string;
  imageUrl?: string | null;
}

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

interface Match {
  id: number;
  fromUserId: number;
  toUserId: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export default function UserProfileView() {
  const [, params] = useRoute('/user/:userId');
  const [, navigate] = useLocation();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const userId = params?.userId ? parseInt(params.userId) : null;

  useEffect(() => {
    if (!userId) {
      navigate('/match');
      return;
    }

    fetchUserProfile();
    fetchReviews();
    fetchMatches();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await response.json();
      setUserProfile(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/reviews`, {
        credentials: 'include',
      });

      if (response.ok) {
        const reviewsData = await response.json();
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches', {
        credentials: 'include',
      });

      if (response.ok) {
        const matchesData = await response.json();
        setMatches(matchesData);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const getAcceptedMatch = () => {
    return matches.find(match => 
      match.status === 'accepted' && 
      ((match.fromUserId === currentUser?.id && match.toUserId === userId) ||
       (match.toUserId === currentUser?.id && match.fromUserId === userId))
    );
  };

  const hasReviewedUser = () => {
    return reviews.some(review => review.reviewerId === currentUser?.id);
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    fetchReviews();
    toast({
      title: "Review Submitted",
      description: "Thank you for your feedback!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-8 h-8 mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
          <Button onClick={() => navigate('/match')} className="mt-4">
            Back to Matches
          </Button>
        </div>
      </div>
    );
  }

  const acceptedMatch = getAcceptedMatch();
  const canReview = acceptedMatch && !hasReviewedUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/match')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Matches
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  {userProfile.imageUrl ? (
                    <img
                      src={userProfile.imageUrl}
                      alt={userProfile.fullName || userProfile.username}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-white shadow-lg">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  {userProfile.fullName || userProfile.username}
                </CardTitle>
                {userProfile.location && (
                  <div className="flex items-center justify-center text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    {userProfile.location}
                  </div>
                )}
                <div className="mt-4">
                  <UserRating userId={userProfile.id} size="md" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {userProfile.bio && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">About</h3>
                    <p className="text-gray-600 text-sm">{userProfile.bio}</p>
                  </div>
                )}

                {/* Skills they teach */}
                {userProfile.skillsToTeach && userProfile.skillsToTeach.length > 0 && (
                  <div>
                    <div className="flex items-center mb-2">
                      <GraduationCap className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="font-medium text-gray-700">Can teach:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.skillsToTeach.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills they want to learn */}
                {userProfile.skillsToLearn && userProfile.skillsToLearn.length > 0 && (
                  <div>
                    <div className="flex items-center mb-2">
                      <BookOpen className="w-4 h-4 mr-2 text-green-500" />
                      <span className="font-medium text-gray-700">Wants to learn:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.skillsToLearn.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {acceptedMatch && (
                  <div className="pt-4 space-y-2">
                    <Button className="w-full" onClick={() => navigate('/chat')}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    {canReview && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowReviewForm(!showReviewForm)}
                      >
                        {showReviewForm ? 'Cancel Review' : 'Leave a Review'}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reviews Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Review Form */}
            {showReviewForm && acceptedMatch && (
              <ReviewForm
                revieweeId={userProfile.id}
                matchId={acceptedMatch.id}
                onReviewSubmitted={handleReviewSubmitted}
              />
            )}

            {/* Reviews List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="animate-spin w-6 h-6 mx-auto mb-2" />
                    <p className="text-gray-500">Loading reviews...</p>
                  </div>
                ) : (
                  <ReviewList reviews={reviews} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}