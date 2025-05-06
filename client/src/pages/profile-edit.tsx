import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UploadCloud } from "lucide-react";
import clsx from "clsx";

export default function ProfileEdit() {
  const { user, updateUserProfile } = useAuth();
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bio, setBio] = useState(user?.bio || "");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user?.imageUrl || null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

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
    try {
      await updateUserProfile({ bio, image });
      localStorage.setItem("hasCompletedProfile", "true");
      navigate("/user-dashboard");
    } catch (err) {
      setError("Something went wrong while saving your profile.");
    } finally {
      setIsSaving(false);
    }
  };

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
          <div className="flex flex-col space-y-6">
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

            <Input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />

            <Textarea
              placeholder="Write something cool about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="resize-none rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-400 transition"
            />

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