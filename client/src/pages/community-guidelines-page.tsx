import { motion } from "framer-motion";
import Footer from "@/components/home/footer";

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
                Our community standards for a positive and respectful skill-sharing experience
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 mb-10">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-primary mb-6">Welcome to the SkillSwap Community</h2>
                
                <p className="mb-6">
                  At SkillSwap, we believe in the power of knowledge sharing and mutual growth. Our platform is designed to connect people who want to learn with those who want to teach. To ensure a positive experience for everyone, we've established these community guidelines.
                </p>
                
                <h3 className="text-xl font-semibold mt-8 mb-4">Respect and Inclusivity</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Treat all community members with respect, regardless of their background, skill level, or experience.</li>
                  <li>Use inclusive language and avoid discriminatory comments or behavior.</li>
                  <li>Be patient with beginners and remember that everyone starts somewhere.</li>
                  <li>Appreciate cultural differences and diverse perspectives.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-8 mb-4">Quality Interactions</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide constructive feedback that helps others improve.</li>
                  <li>Be honest about your skill level and expertise.</li>
                  <li>Honor your commitments to teaching or learning sessions.</li>
                  <li>Communicate clearly and promptly with your skill exchange partners.</li>
                  <li>Prepare adequately for your sessions to make them valuable for all participants.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-8 mb-4">Content Guidelines</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Share content that is relevant, accurate, and helpful.</li>
                  <li>Respect intellectual property rights and give proper attribution when using others' work.</li>
                  <li>Do not share inappropriate, offensive, or harmful content.</li>
                  <li>Avoid spamming or excessive self-promotion.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-8 mb-4">Safety and Privacy</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Protect your personal information and respect others' privacy.</li>
                  <li>Report suspicious behavior or safety concerns to our moderation team.</li>
                  <li>Use secure communication channels for your skill exchanges.</li>
                  <li>Never share login credentials or sensitive information.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-8 mb-4">Conflict Resolution</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Address disagreements directly and respectfully with the involved parties.</li>
                  <li>If unable to resolve a conflict, seek assistance from our community moderators.</li>
                  <li>Provide honest feedback through our rating system to help maintain community quality.</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-8 mb-4">Enforcement</h3>
                <p className="mb-6">
                  Violations of these guidelines may result in warnings, temporary restrictions, or permanent removal from the platform, depending on the severity and frequency of the violations. Our moderation team reviews all reported concerns and takes appropriate action to maintain a positive community environment.
                </p>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-8">
                  <p className="font-medium">Remember:</p>
                  <p>Our community thrives when everyone contributes positively. By following these guidelines, you help create a space where skills can be shared freely and respectfully, benefiting everyone involved.</p>
                </div>
                
                <p className="mt-8">
                  These guidelines may be updated periodically. We encourage you to review them regularly to stay informed about our community standards.
                </p>
                
                <p className="mt-6">
                  Thank you for being part of the SwapSkill community!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}