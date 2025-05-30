import { motion } from "framer-motion";
import { useState } from "react";
import { Search, ChevronDown, ChevronUp, MessageSquare, FileText, LifeBuoy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Footer from "@/components/home/footer";

export default function SupportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  const faqs = [
    {
      question: "How do I create an account on SkillSwap?",
      answer: "Creating an account is easy! Click on the 'Sign Up' button in the top right corner of the homepage. You can register using your email address or sign up with your Google or Facebook account. Once you've completed the registration form, you'll receive a verification email. Click the link in the email to verify your account, and you're ready to start using SkillSwap!"
    },
    {
      question: "How does skill exchange work?",
      answer: "SkillSwap operates on a simple principle: you teach what you know and learn what you want. Browse through available skills or users, find someone teaching a skill you want to learn, and propose an exchange where you offer to teach one of your skills in return. Once both parties agree on the details (timing, duration, format), you can schedule sessions through our platform. After completing sessions, both participants provide feedback and ratings."
    },
    {
      question: "Is SkillSwap completely free to use?",
      answer: "SkillSwap offers both free and premium options. The basic account is completely free and allows you to participate in skill exchanges with no monetary cost—you simply exchange your time and knowledge. Premium accounts offer additional features like advanced search filters, priority matching, and the ability to schedule more concurrent exchanges. We also offer SkillSwap Credits that can be used when you don't have a matching skill to offer."
    },
    {
      question: "How do I ensure the quality of teaching I'll receive?",
      answer: "We maintain quality through our comprehensive review and rating system. After each skill exchange, participants rate each other based on teaching ability, knowledge level, communication, and reliability. These ratings are visible on user profiles, helping you make informed decisions. Additionally, we verify the credentials of users who claim professional expertise in certain fields. Look for the 'Verified Skill' badge on profiles."
    },
    {
      question: "What happens if I need to cancel a scheduled session?",
      answer: "We understand that plans can change. You can cancel a scheduled session through your dashboard at least 24 hours in advance without any penalty. For cancellations with less than 24 hours' notice, we encourage you to reschedule rather than cancel. Frequent last-minute cancellations may affect your reliability rating. If you experience a genuine emergency, please contact support, and we'll help resolve the situation fairly."
    },
    {
      question: "How can I report inappropriate behavior?",
      answer: "We take community safety very seriously. If you encounter inappropriate behavior, harassment, or content that violates our community guidelines, please report it immediately. You can do this by clicking the 'Report' button on the user's profile or in your message thread with them. Our moderation team reviews all reports within 24 hours and takes appropriate action. For urgent concerns, please contact our support team directly at namanvashi@gmail.com."
    }
  ];
  
  const filteredFaqs = searchTerm
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faqs;
    
  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Support Center</h1>
              <p className="text-xl mb-8">
                Get help with your SkillSwap account and find answers to common questions
              </p>
              
              <div className="max-w-xl mx-auto">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search for help..."
                    className="w-full py-3 px-4 pr-10 rounded-lg text-gray-800"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Support Options */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white p-6 rounded-lg shadow-lg text-center"
                >
                  <div className="bg-primary-light/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Live Chat</h3>
                  <p className="text-gray-600 mb-4">Chat with our support team in real-time</p>
                  <Button variant="outline" className="w-full">Start Chat</Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white p-6 rounded-lg shadow-lg text-center"
                >
                  <div className="bg-primary-light/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Knowledge Base</h3>
                  <p className="text-gray-600 mb-4">Browse our detailed help articles</p>
                  <Button variant="outline" className="w-full">View Articles</Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white p-6 rounded-lg shadow-lg text-center"
                >
                  <div className="bg-primary-light/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LifeBuoy className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Email Support</h3>
                  <p className="text-gray-600 mb-4">Send us a message and we'll respond ASAP</p>
                  <Button variant="outline" className="w-full">Contact Us</Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-white p-6 rounded-lg shadow-lg text-center"
                >
                  <div className="bg-primary-light/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Support Hours</h3>
                  <p className="text-gray-600 mb-4">Mon-Fri: 9am-6pm<br />Sat: 10am-4pm</p>
                  <Button variant="outline" className="w-full">Check Status</Button>
                </motion.div>
              </div>
              
              {/* FAQs */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                
                {filteredFaqs.length > 0 ? (
                  <div className="space-y-4">
                    {filteredFaqs.map((faq, index) => (
                      <div 
                        key={index} 
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <button
                          className="w-full flex justify-between items-center p-4 text-left font-medium focus:outline-none"
                          onClick={() => toggleFaq(index)}
                        >
                          <span>{faq.question}</span>
                          {expandedFaq === index ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                        
                        {expandedFaq === index && (
                          <div className="p-4 bg-gray-50 border-t border-gray-200">
                            <p className="text-gray-700">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No results found for "{searchTerm}"</p>
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      Clear Search
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Contact Form */}
              <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Still Need Help?</h2>
                <p className="text-gray-600 mb-6">
                  If you couldn't find the answer you were looking for, please fill out the form below and our support team will get back to you as soon as possible.
                </p>
                
                <form 
                  action="https://formspree.io/f/xpwdvevp" 
                  method="POST"
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <Input id="name" name="name" type="text" placeholder="Your name" required />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <Input id="email" name="email" type="email" placeholder="Your email" required />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <Input id="subject" name="subject" type="text" placeholder="What is your question about?" required />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="Please describe your issue in detail"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full md:w-auto">Submit Request</Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}