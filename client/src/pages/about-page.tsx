import { motion } from "framer-motion";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/home/footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function AboutPage() {
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">About SwapSkill</h1>
              <p className="text-xl mb-8">
                We're on a mission to transform how people learn and share skills in a collaborative economy.
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Our Story */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Story</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  SwapSkill began with a simple observation: people have valuable skills to share, 
                  and everyone wants to learn something new. But traditional learning platforms are 
                  often expensive, while informal skill exchanges lacked structure and safety.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Founded in 2023, our platform connects people who want to learn with those who want 
                  to teach - creating a vibrant community where knowledge is the currency and everyone 
                  has something valuable to offer.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Leadership */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">Our Leadership</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Founder */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-4 overflow-hidden">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <circle cx="50" cy="50" r="50" fill="#E2E8F0" />
                      <circle cx="50" cy="35" r="20" fill="#A0AEC0" />
                      <path d="M50 60 C30 60, 20 80, 20 100 L80 100 C80 80, 70 60, 50 60" fill="#A0AEC0" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-1">Naman Vashishtha</h3>
                  <p className="text-primary text-center mb-4">Founder & CEO</p>
                  <p className="text-gray-600 text-center">
                    With a background in educational technology, Naman is passionate about 
                    democratizing access to learning and building communities.
                  </p>
                </motion.div>
                
                {/* COO */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-4 overflow-hidden">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <circle cx="50" cy="50" r="50" fill="#E2E8F0" />
                      <circle cx="50" cy="35" r="20" fill="#A0AEC0" />
                      <path d="M50 60 C30 60, 20 80, 20 100 L80 100 C80 80, 70 60, 50 60" fill="#A0AEC0" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-1">Akshita Gupta</h3>
                  <p className="text-primary text-center mb-4">COO</p>
                  <p className="text-gray-600 text-center">
                    Akshita brings expertise in operations and community building, 
                    ensuring that SwapSkill delivers a seamless experience for all users.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Vision and Values */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Vision</h2>
                <p className="text-gray-600 mb-10 leading-relaxed">
                  We envision a world where skills are freely exchanged, where passion for teaching meets 
                  eagerness to learn, and where communities grow stronger through shared knowledge.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Values</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="text-primary text-xl mr-3">•</span>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">Community First</h3>
                      <p className="text-gray-600">We build platforms that strengthen connections and foster a sense of belonging.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary text-xl mr-3">•</span>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">Accessible Learning</h3>
                      <p className="text-gray-600">We believe everyone deserves access to quality education, regardless of financial constraints.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary text-xl mr-3">•</span>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">Safety and Trust</h3>
                      <p className="text-gray-600">We prioritize creating a safe environment where members can connect with confidence.</p>
                    </div>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Join Us CTA */}
        <section className="py-16 bg-gradient-to-r from-secondary to-secondary-light text-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
              <p className="text-xl mb-8">
                Be part of the skill-sharing revolution. Connect, learn, and grow with SwapSkill.
              </p>
              <Link href="/auth">
                <Button size="lg" className="bg-white text-secondary hover:bg-gray-100">
                  Sign Up Now
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}