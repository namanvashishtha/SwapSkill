import { motion } from "framer-motion";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/home/footer";

export default function CommunityGuidelinesPage() {
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Community Guidelines</h1>
              <p className="text-xl">
                Our shared values and expectations for the SwapSkill community
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Guidelines Content */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Our Community Principles</h2>
                <p className="text-gray-600 mb-6">
                  SwapSkill is built on the principles of mutual respect, learning, and community growth. 
                  These guidelines help ensure our platform remains a safe, positive, and enriching 
                  environment for everyone.
                </p>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">Respect and Inclusion</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                      <li>Treat all community members with respect and kindness.</li>
                      <li>Embrace diversity and be inclusive to people of all backgrounds.</li>
                      <li>Avoid language or behavior that could be considered discriminatory or offensive.</li>
                      <li>Listen actively and be open to different perspectives and experiences.</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">Quality Teaching and Learning</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                      <li>Be honest about your skill level and experience when offering to teach.</li>
                      <li>Prepare adequately for teaching sessions to provide value to learners.</li>
                      <li>Be punctual and respect agreed-upon schedules.</li>
                      <li>Provide constructive feedback that helps others grow.</li>
                      <li>As a learner, show up prepared and engaged.</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">Safety and Trust</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                      <li>Prioritize in-person meetings in public spaces when possible.</li>
                      <li>Respect personal boundaries and privacy.</li>
                      <li>Report any concerning behavior or safety issues to the SwapSkill team.</li>
                      <li>Never share someone else's personal information without permission.</li>
                      <li>Be honest in all interactions and honor your commitments.</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">Content and Communication</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                      <li>Keep profile information and skill descriptions accurate and appropriate.</li>
                      <li>Avoid promoting external services or products without permission.</li>
                      <li>Use clear and positive communication in all interactions.</li>
                      <li>Provide honest reviews that are helpful to the community.</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">Prohibited Activities</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                      <li>Harassment, bullying, or intimidation of any kind.</li>
                      <li>Discrimination based on race, gender, religion, sexual orientation, disability, etc.</li>
                      <li>Sharing inappropriate or offensive content.</li>
                      <li>Creating fake accounts or misrepresenting yourself.</li>
                      <li>Using the platform primarily for commercial purposes.</li>
                      <li>Engaging in illegal activities or promoting harmful behavior.</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">Enforcement and Reporting</h3>
                    <p className="text-gray-600 mb-3">
                      Our team reviews reports of guideline violations and may take actions including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                      <li>Issuing warnings</li>
                      <li>Temporarily restricting account features</li>
                      <li>Permanently removing accounts for serious violations</li>
                    </ul>
                    <p className="text-gray-600 mt-3">
                      If you encounter behavior that violates our guidelines, please report it through 
                      our reporting system or contact our support team directly.
                    </p>
                  </div>
                </div>
                
                <div className="mt-10 pt-6 border-t border-gray-200">
                  <p className="text-gray-600 italic">
                    These guidelines are regularly reviewed and updated to ensure they reflect our 
                    community's needs. Last updated: April 2025.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}