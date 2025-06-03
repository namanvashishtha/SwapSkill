import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Home, Calendar, Book, Settings, User, X, Trash2 } from "lucide-react";
import { queryClient } from "../lib/queryClient";

const data = [
  { name: "Mon", sessions: 2 },
  { name: "Tue", sessions: 4 },
  { name: "Wed", sessions: 1 },
  { name: "Thu", sessions: 3 },
  { name: "Fri", sessions: 5 },
  { name: "Sat", sessions: 2 },
  { name: "Sun", sessions: 0 },
];

export default function UserDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const [skillsToTeach, setSkillsToTeach] = useState<string[]>([]);
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>([]);
  const [newTeachSkill, setNewTeachSkill] = useState("");
  const [newLearnSkill, setNewLearnSkill] = useState("");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isAddingTeachSkill, setIsAddingTeachSkill] = useState(false);
  const [isAddingLearnSkill, setIsAddingLearnSkill] = useState(false);
  const [removingSkill, setRemovingSkill] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [userRating, setUserRating] = useState<{ averageRating: number; totalReviews: number }>({ averageRating: 0, totalReviews: 0 });
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  
  // Fetch user reviews and rating
  const fetchUserReviews = async (userId: number) => {
    try {
      setIsLoadingReviews(true);
      const [reviewsResponse, ratingResponse] = await Promise.all([
        fetch(`/api/users/${userId}/reviews`, { credentials: 'include' }),
        fetch(`/api/users/${userId}/rating`, { credentials: 'include' })
      ]);
      
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData);
      } else {
        console.error('Failed to fetch reviews');
        setReviews([]);
      }
      
      if (ratingResponse.ok) {
        const ratingData = await ratingResponse.json();
        setUserRating(ratingData);
      } else {
        console.error('Failed to fetch rating');
        setUserRating({ averageRating: 0, totalReviews: 0 });
      }
    } catch (error) {
      console.error('Error fetching user reviews and rating:', error);
      setReviews([]);
      setUserRating({ averageRating: 0, totalReviews: 0 });
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Update skills whenever user data changes
  useEffect(() => {
    if (user) {
      setSkillsToTeach(user.skillsToTeach ?? []);
      setSkillsToLearn(user.skillsToLearn ?? []);
      
      // Fetch reviews and rating for the current user
      fetchUserReviews(user.id);
      
      // Log user data for debugging
      console.log("User data in dashboard:", user);
      console.log("Bio:", user.bio);
      console.log("Image URL:", user.imageUrl);
    }
  }, [user]);

  if (isLoading) {
    return <div className="p-6 text-lg">Loading dashboard...</div>;
  }

  const updateSkillsOnServer = async (skillsToTeach: string[], skillsToLearn: string[]) => {
    try {
      // First, get the current user data to include required fields
      if (!user) {
        throw new Error('User data is not available');
      }
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Include required fields from current user data
          fullName: user.fullName || '',
          email: user.email || '',
          location: user.location || '',
          // Include the updated skills
          skillsToTeach,
          skillsToLearn,
          // Preserve other fields
          bio: user.bio || '',
        }),
        credentials: 'include', // Ensure cookies are sent
      });
      
      if (!response.ok) {
        throw new Error('Failed to update skills');
      }
      
      const updatedUserData = await response.json();
      
      // Immediately update the cache with the new user data for real-time UI updates
      queryClient.setQueryData(["/api/user"], updatedUserData);
      
      // Also trigger a background refresh to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      return updatedUserData;
    } catch (error) {
      console.error('Error updating skills:', error);
      throw error;
    }
  };

  const handleAddTeachSkill = async () => {
    if (!newTeachSkill.trim()) {
      toast({
        title: "Error",
        description: "Please enter a skill to add.",
        variant: "destructive",
      });
      return;
    }
    // Case-insensitive check for existing skills
    const trimmedSkill = newTeachSkill.trim();
    const skillExistsAlready = skillsToTeach.some(
      skill => skill.toLowerCase() === trimmedSkill.toLowerCase()
    );
    
    if (skillExistsAlready) {
      toast({
        title: "Error",
        description: "This skill already exists in your 'Skills I Can Teach' list.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedSkills = [...skillsToTeach, newTeachSkill.trim()];
    
    // Immediately update local state for instant UI feedback
    setSkillsToTeach(updatedSkills);
    setIsAddingTeachSkill(true);
    
    try {
      const result = await updateSkillsOnServer(updatedSkills, skillsToLearn);
      console.log("Skill update result:", result);
      
      // Update with the server response data when it comes back
      if (result && result.skillsToTeach) {
        setSkillsToTeach(result.skillsToTeach);
      }
      
      setNewTeachSkill("");
      toast({
        title: "Success",
        description: "Skill added to 'Skills I Can Teach'.",
      });
    } catch (error) {
      console.error("Error adding teach skill:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? `Failed to update skills: ${error.message}` 
          : "Failed to update skills. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingTeachSkill(false);
    }
  };

  const handleAddLearnSkill = async () => {
    if (!newLearnSkill.trim()) {
      toast({
        title: "Error",
        description: "Please enter a skill to add.",
        variant: "destructive",
      });
      return;
    }
    // Case-insensitive check for existing skills
    const trimmedSkill = newLearnSkill.trim();
    const skillExistsAlready = skillsToLearn.some(
      skill => skill.toLowerCase() === trimmedSkill.toLowerCase()
    );
    
    if (skillExistsAlready) {
      toast({
        title: "Error",
        description: "This skill already exists in your 'Skills I Wish to Learn' list.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedSkills = [...skillsToLearn, newLearnSkill.trim()];
    
    // Immediately update local state for instant UI feedback
    setSkillsToLearn(updatedSkills);
    setIsAddingLearnSkill(true);
    
    try {
      const result = await updateSkillsOnServer(skillsToTeach, updatedSkills);
      console.log("Skill update result:", result);
      
      // Update with the server response data when it comes back
      if (result && result.skillsToLearn) {
        setSkillsToLearn(result.skillsToLearn);
      }
      
      setNewLearnSkill("");
      toast({
        title: "Success",
        description: "Skill added to 'Skills I Wish to Learn'.",
      });
    } catch (error) {
      console.error("Error adding learn skill:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? `Failed to update skills: ${error.message}` 
          : "Failed to update skills. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingLearnSkill(false);
    }
  };
  
  const handleRemoveTeachSkill = async (skillToRemove: string) => {
    if (removingSkill) return; // Prevent multiple simultaneous removals
    
    // Immediately update UI for instant feedback
    const updatedSkills = skillsToTeach.filter(skill => skill !== skillToRemove);
    setSkillsToTeach(updatedSkills);
    
    setRemovingSkill(skillToRemove);
    try {
      const result = await updateSkillsOnServer(updatedSkills, skillsToLearn);
      console.log("Skill removal result:", result);
      
      // Update with server response if needed
      if (result && result.skillsToTeach) {
        setSkillsToTeach(result.skillsToTeach);
      }
      
      toast({
        title: "Success",
        description: `"${skillToRemove}" removed from 'Skills I Can Teach'.`,
      });
    } catch (error) {
      console.error("Error removing teach skill:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? `Failed to remove skill: ${error.message}` 
          : "Failed to remove skill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRemovingSkill(null);
    }
  };
  
  const handleRemoveLearnSkill = async (skillToRemove: string) => {
    if (removingSkill) return; // Prevent multiple simultaneous removals
    
    // Immediately update UI for instant feedback
    const updatedSkills = skillsToLearn.filter(skill => skill !== skillToRemove);
    setSkillsToLearn(updatedSkills);
    
    setRemovingSkill(skillToRemove);
    try {
      const result = await updateSkillsOnServer(skillsToTeach, updatedSkills);
      console.log("Skill removal result:", result);
      
      // Update with server response if needed
      if (result && result.skillsToLearn) {
        setSkillsToLearn(result.skillsToLearn);
      }
      
      toast({
        title: "Success",
        description: `"${skillToRemove}" removed from 'Skills I Wish to Learn'.`,
      });
    } catch (error) {
      console.error("Error removing learn skill:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? `Failed to remove skill: ${error.message}` 
          : "Failed to remove skill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRemovingSkill(null);
    }
  };

  return (
    <div className="bg-white text-gray-900 min-h-screen flex flex-col">
      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <motion.aside
          initial={{ width: 64 }}
          animate={{ width: isSidebarExpanded ? 200 : 64 }}
          onHoverStart={() => setIsSidebarExpanded(true)}
          onHoverEnd={() => setIsSidebarExpanded(false)}
          transition={{ duration: 0.3 }}
          className="fixed top-[4.5rem] left-0 h-[calc(100vh-4.5rem)] bg-indigo-700 text-white z-40 shadow-lg overflow-hidden"
        >
          <div className="flex flex-col h-full py-6 space-y-4 px-2">
            <Link href="/profile-edit" className="flex items-center gap-4 px-4 py-3 hover:bg-indigo-600 rounded-lg">
              <User className="w-5 h-5 flex-shrink-0" />
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: isSidebarExpanded ? 1 : 0, width: isSidebarExpanded ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Profile
              </motion.span>
            </Link>
            {/* <Link href="/overview" className="flex items-center gap-4 px-4 py-3 hover:bg-indigo-600 rounded-lg">
              <Home className="w-5 h-5 flex-shrink-0" />
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: isSidebarExpanded ? 1 : 0, width: isSidebarExpanded ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Overview
              </motion.span>
            </Link> */}
            <Link href="/sessions" className="flex items-center gap-4 px-4 py-3 hover:bg-indigo-600 rounded-lg">
              <Calendar className="w-5 h-5 flex-shrink-0" />
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: isSidebarExpanded ? 1 : 0, width: isSidebarExpanded ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Sessions
              </motion.span>
            </Link>
            <Link href="/skills" className="flex items-center gap-4 px-4 py-3 hover:bg-indigo-600 rounded-lg">
              <Book className="w-5 h-5 flex-shrink-0" />
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: isSidebarExpanded ? 1 : 0, width: isSidebarExpanded ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Skills
              </motion.span>
            </Link>
            <Link href="/settings" className="flex items-center gap-4 px-4 py-3 hover:bg-indigo-600 rounded-lg">
              <Settings className="w-5 h-5 flex-shrink-0" />
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: isSidebarExpanded ? 1 : 0, width: isSidebarExpanded ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Settings
              </motion.span>
            </Link>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <motion.div
          className="flex-1 p-8 pt-16 transition-all duration-300"
          animate={{ marginLeft: isSidebarExpanded ? "200px" : "64px" }}
        >
          {/* Header */}
          <header className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-4xl font-semibold">{user?.username || "User"}'s Dashboard</h1>
                <p className="text-gray-500">Here's your activity this week:</p>
              </div>
              <Link href="/profile-edit">
                <div className="relative group">
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt="Profile"
                      className="w-16 h-16 rounded-full border-2 border-indigo-600 object-cover hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-indigo-600 bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-xl hover:scale-105 transition-transform duration-200">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full flex items-center justify-center transition-all duration-200">
                    <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">Edit</span>
                  </div>
                </div>
              </Link>
            </div>
            
            {/* User Bio */}
            {user?.bio && (
              <div className="bg-indigo-50 p-4 rounded-lg shadow-sm mb-4">
                <h3 className="text-sm font-semibold text-indigo-800 mb-1">About Me</h3>
                <p className="text-gray-700">{user.bio}</p>
              </div>
            )}
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-xl transition-shadow bg-white text-gray-800 shadow-md rounded-xl p-6">
              <CardContent>
                <h3 className="text-xl font-semibold">Skills to Share</h3>
                <p className="text-3xl font-bold text-indigo-600">{skillsToTeach.length}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow bg-white text-gray-800 shadow-md rounded-xl p-6">
              <CardContent>
                <h3 className="text-xl font-semibold">Skills to Learn</h3>
                <p className="text-3xl font-bold text-indigo-600">{skillsToLearn.length}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow bg-white text-gray-800 shadow-md rounded-xl p-6">
              <CardContent>
                <h3 className="text-xl font-semibold">Rating</h3>
                {userRating.totalReviews > 0 ? (
                  <div>
                    <p className="text-3xl font-bold text-indigo-600">
                      {userRating.averageRating}⭐
                    </p>
                    <p className="text-sm text-gray-500">
                      Based on {userRating.totalReviews} review{userRating.totalReviews !== 1 ? 's' : ''}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xl font-medium text-gray-500">No ratings yet</p>
                    <p className="text-sm text-gray-400">Complete matches to get rated</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Weekly Sessions</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Skills Sidebar (Mobile/Full View) */}
          <div className="grid lg:grid-cols-2 gap-8 mt-10">
            {/* Skills I Can Teach */}
            <div className="bg-indigo-50 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Skills I Can Teach</h3>
              {skillsToTeach.length > 0 ? (
                <ul className="space-y-2">
                  {skillsToTeach.map((skill, index) => (
                    <li key={index} className="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm">
                      <span className="text-sm">{skill}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveTeachSkill(skill)}
                        disabled={removingSkill !== null}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8"
                      >
                        {removingSkill === skill ? (
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-1" />
                            <span>Remove</span>
                          </>
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm italic">No skills added yet.</p>
              )}
              <div className="mt-4 flex space-x-2">
                <Input
                  placeholder="Add a skill"
                  value={newTeachSkill}
                  onChange={(e) => setNewTeachSkill(e.target.value)}
                  className="bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg p-3"
                />
                <Button
                  onClick={handleAddTeachSkill}
                  disabled={isAddingTeachSkill}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isAddingTeachSkill ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : "Add"}
                </Button>
              </div>
            </div>

            {/* Skills I Wish to Learn */}
            <div className="bg-indigo-50 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Skills I Wish to Learn</h3>
              {skillsToLearn.length > 0 ? (
                <ul className="space-y-2">
                  {skillsToLearn.map((skill, index) => (
                    <li key={index} className="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm">
                      <span className="text-sm">{skill}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveLearnSkill(skill)}
                        disabled={removingSkill !== null}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8"
                      >
                        {removingSkill === skill ? (
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-1" />
                            <span>Remove</span>
                          </>
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm italic">No skills added yet.</p>
              )}
              <div className="mt-4 flex space-x-2">
                <Input
                  placeholder="Add a skill"
                  value={newLearnSkill}
                  onChange={(e) => setNewLearnSkill(e.target.value)}
                  className="bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg p-3"
                />
                <Button
                  onClick={handleAddLearnSkill}
                  disabled={isAddingLearnSkill}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isAddingLearnSkill ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : "Add"}
                </Button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-10">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-semibold mb-6">Reviews</h3>
              
              {isLoadingReviews ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2 text-gray-600">Loading reviews...</span>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <div key={review.id || index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start space-x-3">
                        {/* Reviewer Avatar */}
                        <div className="flex-shrink-0">
                          {review.reviewer?.imageUrl ? (
                            <img
                              src={review.reviewer.imageUrl}
                              alt={review.reviewer.fullName || review.reviewer.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                              {review.reviewer?.username?.charAt(0).toUpperCase() || "?"}
                            </div>
                          )}
                        </div>
                        
                        {/* Review Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {review.reviewer?.fullName || review.reviewer?.username || "Anonymous"}
                              </h4>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-sm ${
                                      i < review.rating ? "text-yellow-400" : "text-gray-300"
                                    }`}
                                  >
                                    ⭐
                                  </span>
                                ))}
                                <span className="text-sm text-gray-500 ml-2">
                                  {review.rating}/5
                                </span>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {review.comment && (
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-500 mb-1">No reviews yet</h4>
                  <p className="text-gray-400">
                    Complete skill exchanges to receive reviews from other users
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}