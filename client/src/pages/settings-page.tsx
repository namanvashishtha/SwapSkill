import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Trash2, Settings, Shield, Bell, User, LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() !== "delete") {
      toast({
        title: "Error",
        description: "Please type 'delete' to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete account");
      }

      toast({
        title: "Account Deleted Successfully",
        description: "Your account and all associated data have been permanently deleted.",
      });

      // Log out the user and redirect to home page
      await logoutMutation.mutateAsync();
      setLocation("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeleteConfirmation("");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setLocation("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="w-8 h-8 text-indigo-600" />
              Settings
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="grid gap-6">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Username</Label>
                    <p className="text-gray-900 font-medium">{user?.username}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                    <p className="text-gray-900 font-medium">{user?.fullName || "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <p className="text-gray-900 font-medium">{user?.email || "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Location</Label>
                    <p className="text-gray-900 font-medium">{user?.location || "Not set"}</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button 
                    onClick={() => setLocation("/profile-edit")}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Password</h3>
                    <p className="text-sm text-gray-600">Change your account password</p>
                  </div>
                  <Button variant="outline" disabled>
                    Change Password
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" disabled>
                    Enable 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Button variant="outline" disabled>
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Push Notifications</h3>
                    <p className="text-sm text-gray-600">Receive push notifications</p>
                  </div>
                  <Button variant="outline" disabled>
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-red-900">Log Out</h3>
                    <p className="text-sm text-red-700">Sign out of your account</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-red-900">Delete Account</h3>
                    <p className="text-sm text-red-700">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">
                          Delete Account Permanently
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                          <p>
                            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                          </p>
                          <p>
                            All your skills, matches, messages, and reviews will be permanently lost.
                          </p>
                          <div className="mt-4">
                            <Label htmlFor="delete-confirmation" className="text-sm font-medium">
                              Type "delete" to confirm:
                            </Label>
                            <Input
                              id="delete-confirmation"
                              value={deleteConfirmation}
                              onChange={(e) => setDeleteConfirmation(e.target.value)}
                              placeholder="Type 'delete' here"
                              className="mt-2"
                            />
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel 
                          onClick={() => {
                            setDeleteConfirmation("");
                            setShowDeleteDialog(false);
                          }}
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={isDeleting || deleteConfirmation.toLowerCase() !== "delete"}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isDeleting ? "Deleting..." : "Delete Account"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
