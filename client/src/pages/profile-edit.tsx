import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UploadCloud } from "lucide-react";
import clsx from "clsx";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
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

export default function ProfileEdit() {
  const { user: authUser, updateUserProfile } = useAuth();
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    location: '',
    skillsToTeach: '',
    skillsToLearn: '',
    bio: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch user data
  useEffect(() => {
    if (!authUser) {
      navigate("/auth");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include' // Ensure cookies are sent
        });
        
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        setUser(userData);
        setFormData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          location: userData.location || '',
          skillsToTeach: userData.skillsToTeach ? userData.skillsToTeach.join(', ') : '',
          skillsToLearn: userData.skillsToLearn ? userData.skillsToLearn.join(', ') : '',
          bio: userData.bio || '',
        });
        
        // Set image preview if available
        if (userData.imageUrl) {
          setPreview(userData.imageUrl);
        }
      } catch (err) {
        setError('Error loading profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [authUser, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Convert comma-separated skills to arrays
      const skillsToTeach = formData.skillsToTeach
        ? formData.skillsToTeach.split(',').map(skill => skill.trim()).filter(Boolean)
        : [];
      
      const skillsToLearn = formData.skillsToLearn
        ? formData.skillsToLearn.split(',').map(skill => skill.trim()).filter(Boolean)
        : [];
      
      let updatedUser;
      
      // First update the main profile data
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          location: formData.location,
          skillsToTeach,
          skillsToLearn,
          bio: formData.bio, // Include bio in the main update
        }),
        credentials: 'include', // Ensure cookies are sent
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update profile');
      }
      
      let updatedUserData = await response.json(); // User data from PUT response
      console.log("Profile updated with bio:", formData.bio, "Response data:", updatedUserData);
      
      // Then update image if changed
      if (image) {
        try {
          console.log("Updating image with bio:", formData.bio);
          // updateUserProfile from useAuth sends a POST, updates React Query cache,
          // and returns the updated user from the POST response.
          const userFromImageUpdate = await updateUserProfile({ bio: formData.bio, image });
          
          if (userFromImageUpdate) {
            // If image update was successful and returned user data,
            // this data (from POST) is more current for bio/imageUrl.
            updatedUserData = userFromImageUpdate;
            console.log("Updated user data after image upload:", updatedUserData);
          }
          console.log("Image update (and potentially bio again) via POST completed.");
          // Success toast for image upload is handled within updateUserProfile in use-auth.tsx
        } catch (imageUpdateError) {
          console.error("Error updating image:", imageUpdateError);
          // Don't throw here, we'll still consider the update successful
          // but show a warning. The main profile data (from PUT) might still be saved.
          toast({
            title: "Image Update Issue",
            description: "Profile data saved, but there was an issue updating your image. Please try uploading the image again.",
            variant: "default", // Consider "warning" or make it more distinct
          });
          // updatedUserData remains from the PUT request if image update fails
        }
      }
      
      // Update local component state with the most current data
      setUser(updatedUserData);
      
      // Immediately update the global React Query cache to ensure real-time UI updates
      queryClient.setQueryData(["/api/user"], updatedUserData);
      
      // Force a background refresh of the user data to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      setSuccessMessage('Profile updated successfully!');
      localStorage.setItem("hasCompletedProfile", "true");
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate("/user-dashboard");
      }, 1500);
    } catch (err) {
      console.error("Profile save error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong while saving your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 via-white to-pink-300 overflow-hidden p-4">
        <div className="text-center p-4">
          <Loader2 className="animate-spin w-8 h-8 mx-auto mb-2" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 via-white to-pink-300 overflow-hidden p-4">
      <style>
        {`
          @keyframes slow-pulse {
            0%, 100% {
              opacity: 0.2;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.1);
            }
          }
          .animate-pulse-slow {
            animation: slow-pulse 6s ease-in-out infinite;
          }
        `}
      </style>
      {/* Decorative background blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-[royalblue] opacity-30 rounded-full filter blur-3xl animate-pulse-slow z-0" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-[#FF69B4] opacity-30 rounded-full filter blur-3xl animate-pulse-slow z-0" />
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-10 pointer-events-none" />

      {/* Main card */}
      <Card className="z-20 w-full max-w-md shadow-2xl rounded-2xl bg-white/70 backdrop-blur-md border border-white/30">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-gray-800">
            Edit Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {successMessage}
            </div>
          )}
          
          <div className="flex flex-col space-y-6">
            {/* Profile Image */}
            <div
              className={clsx(
                "w-32 h-32 mx-auto rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition hover:scale-105 cursor-pointer",
                preview ? "bg-cover bg-center" : "bg-gray-200"
              )}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-500 text-center">
                  <UploadCloud className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs">Upload Image</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 text-center">Click or drag & drop to upload</p>

            <Input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="fullName">
                  Full Name
                </label>
                <Input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="email">
                  Email
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="location">
                  Location
                </label>
                <Input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="bio">
                  Bio
                </label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="resize-none rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="skillsToTeach">
                  Skills to Teach (comma-separated)
                </label>
                <Textarea
                  id="skillsToTeach"
                  name="skillsToTeach"
                  value={formData.skillsToTeach}
                  onChange={handleChange}
                  className="resize-none rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="skillsToLearn">
                  Skills to Learn (comma-separated)
                </label>
                <Textarea
                  id="skillsToLearn"
                  name="skillsToLearn"
                  value={formData.skillsToLearn}
                  onChange={handleChange}
                  className="resize-none rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
                  rows={3}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className={clsx(
                "w-full font-semibold rounded-xl transition-all duration-200",
                isSaving ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02]"
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}