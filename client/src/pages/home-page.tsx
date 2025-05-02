import Navbar from "@/components/layout/navbar";
import HeroSection from "@/components/home/hero-section";
import SkillScrollbar from "@/components/home/skill-scrollbar";
import FeaturesSection from "@/components/home/features-section";
import TestimonialSection from "@/components/home/testimonial-section";
import Footer from "@/components/home/footer";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      
      <HeroSection />
      <SkillScrollbar />
      <FeaturesSection />
      <TestimonialSection />
      <Footer />
    </motion.div>
  );
}
