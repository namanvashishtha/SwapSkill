import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const isSignup = location.includes("signup=true");

  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-poppins">
            {isSignup ? "Create Your Account" : "Welcome Back"}
          </h2>
          {isSignup ? (
            <p className="mt-2 text-center text-sm text-gray-600">
              Join the skill-sharing community
            </p>
          ) : (
            <p className="mt-2 text-center text-sm text-gray-600">
              Ready to continue swapping skills?
            </p>
          )}
        </div>

        <AuthForm isSignup={isSignup} />
      </div>
      <Footer />
    </>
  );
}
