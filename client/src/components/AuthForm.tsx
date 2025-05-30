import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  location: z.string().min(2, "Location is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

interface AuthFormProps {
  isSignup?: boolean;
  scrollToTop?: () => void;
}

export default function AuthForm({ isSignup = false, scrollToTop }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(isSignup ? 'signup' : 'login');
  const { loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      location: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Set the initial mode based on the isSignup prop
  useEffect(() => {
    console.log("AuthForm: isSignup prop changed to", isSignup);
    setMode(isSignup ? 'signup' : 'login');
  }, [isSignup]);
  
  // Log the current mode for debugging
  useEffect(() => {
    console.log("AuthForm: Current mode is", mode);
  }, [mode]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [mode]);

  useEffect(() => {
    loginForm.reset();
    signupForm.reset();
  }, [mode]);

    const onLoginSubmit = async (data: LoginFormData) => {
      try {
        // Use the mutation directly and wait for it to complete
        await loginMutation.mutateAsync(data);
        
        // Show success toast
        toast({
          title: "Login successful",
          description: "Welcome back to SwapSkill!",
        });
        
        // Force a reload of the page to ensure all state is properly updated
        window.location.href = "/user-dashboard";
      } catch (error) {
        console.error("Login error:", error);
        // Error handling is already done in the mutation
      }
    };

    const onSignupSubmit = async (data: SignupFormData) => {
      try {
        const { confirmPassword, fullName, email, location, ...userData } = data;
        
        // Use the mutation directly and wait for it to complete
        await registerMutation.mutateAsync({ 
          ...userData,
          fullName,
          email,
          location,
          skillsToTeach: null,
          skillsToLearn: null
        });
        
        // Show success toast
        toast({
          title: "Registration successful",
          description: "Registration successful, please complete your profile.",
        });
        
        localStorage.setItem("hasCompletedProfile", "false");
        
        // Force a reload of the page to ensure all state is properly updated
        window.location.href = "/profile-edit";
        signupForm.reset();
      } catch (error) {
        console.error("Registration error:", error);
        // Error handling is already done in the mutation
      }
    };

  const toggleMode = () => {
    if (mode === 'login') {
      console.log("Toggling from login to signup");
      window.scrollTo(0, 0);
      scrollToTop?.();
      // Force a full page navigation to ensure query parameters are properly handled
      window.location.href = '/auth?signup=true';
      setMode('signup');
    } else {
      console.log("Toggling from signup to login");
      window.scrollTo(0, 0);
      // Force a full page navigation to ensure query parameters are properly handled
      window.location.href = '/auth';
      setMode('login');
      scrollToTop?.();
    }
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        {mode === 'login' ? (
          <>
            <Form {...loginForm}>
              <form key="login" onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Button variant="link" onClick={toggleMode} className="p-0 h-auto">
                  Sign up
                </Button>
              </p>
            </div>
          </>
        ) : (
          <>
            <Form {...signupForm}>
              <form key="signup" onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
                <FormField
                  control={signupForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Choose a unique username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Create a secure password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Button variant="link" onClick={toggleMode} className="p-0 h-auto">
                  Login
                </Button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
// This code defines an authentication form component that allows users to log in or sign up.
// It uses React Hook Form for form handling and Zod for validation. The form switches between login and signup modes based on the `isSignup` prop.
// The login and signup schemas are defined using Zod, and the form submission is handled with mutations from a custom `useAuth` hook.
// The component also uses a custom `useToast` hook for displaying success messages.