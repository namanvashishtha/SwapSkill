import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: (SelectUser & { bio?: string; imageUrl?: string | null }) | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  updateUserProfile: (data: { bio: string; image: File | null }) => Promise<(SelectUser & { bio?: string; imageUrl?: string | null }) | undefined>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        console.log("Attempting login for user:", credentials.username);
        const res = await apiRequest("POST", "/api/login", credentials);
        
        // Check for non-200 responses and handle them appropriately
        if (!res.ok) {
          const errorData = await res.json().catch(() => null) || { message: `Error: ${res.status} ${res.statusText}` };
          console.error("Login API error:", errorData);
          throw new Error(errorData.message || "Login failed");
        }
        
        const userData = await res.json();
        console.log("API login successful for:", userData.username);
        return userData;
      } catch (error) {
        console.error("Login mutation error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      console.log("Login successful, updating user state:", user);
      // Set the user data immediately to ensure it's available
      queryClient.setQueryData(["/api/user"], user);
      // Then invalidate the query to refresh the data in the background
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Verify the session was properly established
      setTimeout(async () => {
        try {
          const verifyResponse = await fetch('/api/user', { 
            credentials: 'include',
            headers: { 'Accept': 'application/json' }
          });
          console.log("Session verification status:", verifyResponse.status);
        } catch (e) {
          console.error("Session verification failed:", e);
        }
      }, 100);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
      // Note: Navigation is handled in the component using the mutation
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      // Set the user data immediately to ensure it's available
      queryClient.setQueryData(["/api/user"], user);
      // Then invalidate the query to refresh the data in the background
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Registration successful",
        description: `Welcome to SwapSkill, ${user.username}!`,
      });
      // Note: Navigation is handled in the component using the mutation
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      console.log("Logout successful, clearing user state");
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      // Note: Navigation is handled in the component using the mutation
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUserProfile = async (data: { bio: string; image: File | null }): Promise<(SelectUser & { bio?: string; imageUrl?: string | null }) | undefined> => {
    try {
      console.log("updateUserProfile called with:", data);
      const formData = new FormData();
      // Make sure bio is properly sent even if it's empty
      formData.append("bio", data.bio !== undefined ? data.bio : '');
      if (data.image) {
        formData.append("image", data.image);
      }
      console.log("Sending formData with bio:", data.bio);
      const res = await fetch("/api/user/profile", {
        method: "POST",
        body: formData,
        // Add credentials to ensure cookies are sent
        credentials: "include",
      });
      
      if (!res.ok) {
        // Check the content type to handle HTML responses
        const contentType = res.headers.get("content-type");
        let errorMessage = "Failed to update profile";
        
        if (contentType && contentType.includes("application/json")) {
          // Try to parse JSON response
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } catch (jsonError) {
            console.error("Failed to parse error response as JSON:", jsonError);
          }
        } else {
          // For non-JSON responses (like HTML error pages)
          errorMessage = `Server error (${res.status}): Failed to update profile. Server returned HTML.`; // More specific message
        }
        
        toast({
          title: "Profile update failed",
          description: errorMessage,
          variant: "destructive",
        });
        throw new Error(errorMessage); // Ensure error is thrown
      }
      
      // Check content type to handle the response appropriately
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        try {
          // Parse JSON directly if the content type is JSON
          const updatedUser = await res.json();
          
          // Immediately update the cache with the new user data for real-time UI updates
          queryClient.setQueryData(["/api/user"], updatedUser);
          
          // Also trigger a background refresh to ensure consistency across components
          // This is important for components that might be using this data
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          }, 100);
          
          toast({
            title: "Profile updated",
            description: "Your profile has been updated successfully!",
          });
          
          return updatedUser;
        } catch (jsonError) {
          console.error("Failed to parse JSON response:", jsonError);
          // Still consider it a success but refresh data
          toast({
            title: "Profile updated",
            description: "Your profile has been updated successfully!",
          });
          
          // Refresh the user data
          queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          // Even if parsing fails, the request was successful, so we might not have user data to return directly.
          // Consider fetching it or relying on the invalidation. For now, return undefined.
          return undefined;
        }
      } else {
        // Handle non-JSON successful responses
        console.log("Non-JSON response received with content type:", contentType);
        
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully!",
        });
        
        // Refresh the user data
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        // No user data to return directly from a non-JSON response.
        return undefined;
      }
    } catch (error) {
      // If the error is an instance of Error and its message doesn't already indicate
      // that it's a "Failed to update profile" error (which would have been toasted already),
      // then toast a generic error.
      if (error instanceof Error && !error.message.includes("Failed to update profile")) {
        toast({
          title: "Profile update error",
          description: error.message || "An unexpected error occurred while updating your profile.",
          variant: "destructive",
        });
      }
      // Always re-throw the error so the calling component can handle it.
      // This ensures that the .catch() block in ProfileEdit's handleSave will trigger.
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}