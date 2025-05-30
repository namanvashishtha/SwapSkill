import { motion } from "framer-motion";
import { AlertTriangle, Shield, Lock, Users, MessageSquare, ThumbsUp } from "lucide-react";
import Footer from "@/components/home/footer";

export default function SafetyTipsPage() {
  const safetyTips = [
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Verify Profiles",
      description: "Always check user profiles, reviews, and ratings before agreeing to skill exchanges. Look for verified badges and complete profiles with detailed information."
    },
    {
      icon: <Lock className="h-10 w-10 text-primary" />,
      title: "Protect Personal Information",
      description: "Share personal details only when necessary. Use our platform's messaging system for initial communications and avoid sharing sensitive information like financial details."
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Meet in Public Places",
      description: "For in-person skill exchanges, choose public locations like libraries, cafes, or community centers. Inform someone you trust about your meeting details."
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      title: "Clear Communication",
      description: "Set clear expectations about the skill exchange, including duration, content, and any materials needed. Document agreements through our platform's messaging system."
    },
    {
      icon: <AlertTriangle className="h-10 w-10 text-primary" />,
      title: "Trust Your Instincts",
      description: "If something feels wrong or uncomfortable, it's okay to decline or end a skill exchange. Your safety and comfort are the top priorities."
    },
    {
      icon: <ThumbsUp className="h-10 w-10 text-primary" />,
      title: "Report Concerns",
      description: "Help keep our community safe by reporting suspicious behavior, inappropriate content, or policy violations through our reporting system."
    }
  ];

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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Safety Tips</h1>
              <p className="text-xl">
                Guidelines for safe and secure skill-sharing on SkillSwap
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8 mb-10">
                <h2 className="text-2xl font-bold text-center mb-10">Your Safety is Our Priority</h2>
                
                <p className="text-lg text-gray-700 mb-8">
                  At SkillSwap, we're committed to creating a safe environment for all users. 
                  While we work hard to maintain platform security, following these safety tips 
                  will help ensure your skill-sharing experience remains positive and secure.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                  {safetyTips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-gray-50 p-6 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-4">
                          {tip.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{tip.title}</h3>
                          <p className="text-gray-600">{tip.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Online Safety Checklist</h2>
                
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-primary bg-primary-light/10 rounded">
                    <h3 className="font-semibold text-lg">Before Your First Exchange</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Complete your profile with accurate information</li>
                      <li>Verify your email and phone number</li>
                      <li>Review the other person's profile thoroughly</li>
                      <li>Check ratings and reviews from previous exchanges</li>
                      <li>Discuss expectations clearly through platform messages</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border-l-4 border-primary bg-primary-light/10 rounded">
                    <h3 className="font-semibold text-lg">During Virtual Exchanges</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Use our recommended video conferencing tools</li>
                      <li>Keep conversations professional and on-topic</li>
                      <li>Be punctual and respect scheduled time slots</li>
                      <li>Record sessions only with explicit permission</li>
                      <li>Report any inappropriate behavior immediately</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border-l-4 border-primary bg-primary-light/10 rounded">
                    <h3 className="font-semibold text-lg">For In-Person Exchanges</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Meet in public, well-populated areas</li>
                      <li>Inform a friend or family member about your meeting details</li>
                      <li>Keep valuables secure and be aware of your surroundings</li>
                      <li>Have a backup plan for getting home</li>
                      <li>Trust your instincts if something feels wrong</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-10 p-6 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-xl font-bold text-red-700 mb-3">Emergency Situations</h3>
                  <p className="mb-4">
                    If you ever feel unsafe or threatened during a skill exchange:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Remove yourself from the situation immediately</li>
                    <li>Contact local emergency services if necessary</li>
                    <li>Report the incident to SkillSwap through our emergency reporting system</li>
                    <li>Document any relevant details while they're fresh in your memory</li>
                  </ol>
                  <p className="mt-4 font-medium">
                    Our support team is available 24/7 for urgent safety concerns at <span className="text-red-700">safety@skillswap.com</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}