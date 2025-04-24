import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import SkillScrollbar from "@/components/home/skill-scrollbar";
import FeaturesSection from "@/components/home/features-section";
import TestimonialSection from "@/components/home/testimonial-section";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="flex-grow">
        <HeroSection />
        <SkillScrollbar />
        <FeaturesSection />
        <TestimonialSection />
      </main>
      <Footer />
    </div>
  );
}
