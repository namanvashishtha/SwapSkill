
import Footer from "@/components/home/footer";
import AuthForm from "@/components/AuthForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  // Parse query parameters from location
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const isSignup = searchParams.get("signup") === "true";

  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
     
      
      <div className="flex-grow py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Left side: Auth forms */}
              <div className="p-8">
                <h2 className="text-3xl font-poppins font-bold mb-6 multi-color-hover">
                  Join SwapSkill
                </h2>
                
                <AuthForm isSignup={isSignup} />
              </div>
              
              {/* Right side: Hero content */}
              <div className="gradient-bg text-white p-8 flex flex-col justify-center relative hidden md:block">
                <div className="z-10 relative">
                  <h3 className="text-2xl font-bold mb-4">
                    Trade Talents, Not Cash
                  </h3>
                  <p className="mb-6">
                    Join our community of passionate learners and skilled teachers
                    to exchange knowledge and grow together.
                  </p>
                  <ul className="space-y-2">
                    {[
                      "Find people with skills you want to learn",
                      "Teach others what you're good at",
                      "Connect and grow your network",
                      "Build meaningful relationships",
                    ].map((item, index) => (
                      <li key={index} className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                  <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#ffffff" d="M47.7,-61.1C62.3,-51.1,75.3,-37.6,79.9,-21.8C84.5,-6,80.8,12.1,73.3,28.2C65.9,44.3,54.8,58.3,40.4,65.5C26,72.7,8.4,72.9,-8.9,70.4C-26.2,67.8,-43.1,62.5,-54.6,51.5C-66.1,40.5,-72.2,23.9,-74.1,6.5C-76,-10.9,-73.9,-29.1,-64.4,-42.2C-54.9,-55.3,-38,-63.2,-22.1,-72.5C-6.2,-81.8,8.7,-92.6,23.5,-88.5C38.2,-84.5,53,-71.5,47.7,-61.1Z" transform="translate(100 100)" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </motion.div>
  );
}
