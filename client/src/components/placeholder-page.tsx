import { motion } from "framer-motion";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/home/footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface PlaceholderPageProps {
  title: string;
  description: string;
  comingSoon?: boolean;
}

export default function PlaceholderPage({ title, description, comingSoon = true }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary-light text-white py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{title}</h1>
              <p className="text-xl">
                {description}
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Content */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              {comingSoon ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="relative mb-12">
                    <svg className="w-48 h-48 mx-auto text-primary/20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h2 className="text-3xl font-bold text-primary">Coming Soon</h2>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-xl mb-10">
                    We're currently developing this page to provide you with the best possible experience.
                    Check back soon for updates!
                  </p>
                  
                  <Link href="/">
                    <Button size="lg" className="bg-primary hover:bg-primary-dark">
                      Return to Homepage
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <p className="text-gray-600 text-xl mb-10">
                    Content for {title} will be displayed here.
                  </p>
                  
                  <Link href="/">
                    <Button size="lg" className="bg-primary hover:bg-primary-dark">
                      Return to Homepage
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}