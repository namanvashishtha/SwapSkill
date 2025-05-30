import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Calendar, User, Clock, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import Footer from "@/components/home/footer";

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const blogPosts = [
    {
      id: 1,
      title: "5 Ways to Make the Most of Your Skill Exchange Sessions",
      excerpt: "Maximize your learning potential with these proven strategies for effective skill exchanges. From preparation to follow-up, these tips will help you get the most value from every session.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      author: "Emma Rodriguez",
      authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      date: "June 15, 2023",
      readTime: "8 min read",
      category: "Tips & Tricks",
      featured: true
    },
    {
      id: 2,
      title: "The Psychology of Skill Acquisition: How We Learn New Abilities",
      excerpt: "Understanding the cognitive processes behind learning can help you become a more efficient learner. This article explores the science of skill acquisition and practical applications.",
      image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      author: "Dr. Michael Chen",
      authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      date: "May 28, 2023",
      readTime: "12 min read",
      category: "Learning Science",
      featured: true
    },
    {
      id: 3,
      title: "From Novice to Expert: One User's Journey Learning Photography",
      excerpt: "Sarah Johnson shares her experience going from complete beginner to professional photographer through skill exchanges on our platform. An inspiring story of dedication and community.",
      image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      author: "Sarah Johnson",
      authorImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      date: "April 12, 2023",
      readTime: "10 min read",
      category: "Success Stories",
      featured: false
    },
    {
      id: 4,
      title: "The Future of Learning: How Skill-Sharing is Disrupting Education",
      excerpt: "Traditional education is being transformed by peer-to-peer learning platforms. Discover how skill-sharing communities are creating new opportunities for accessible, practical education.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      author: "James Wilson",
      authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      date: "March 5, 2023",
      readTime: "15 min read",
      category: "Industry Insights",
      featured: false
    },
    {
      id: 5,
      title: "Building Community Through Shared Knowledge",
      excerpt: "How skill exchanges create meaningful connections beyond just learning. Explore the social impact of knowledge sharing and how it builds stronger, more resilient communities.",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      author: "Aisha Patel",
      authorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      date: "February 18, 2023",
      readTime: "9 min read",
      category: "Community",
      featured: false
    },
    {
      id: 6,
      title: "Teaching What You Know: A Beginner's Guide",
      excerpt: "Nervous about teaching others? This guide provides practical advice for first-time teachers on our platform, helping you share your skills with confidence and effectiveness.",
      image: "https://images.unsplash.com/photo-1544531585-9847b68c8c86?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      author: "David Martinez",
      authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      date: "January 30, 2023",
      readTime: "7 min read",
      category: "Tips & Tricks",
      featured: false
    }
  ];
  
  const categories = [
    "All Categories",
    "Tips & Tricks",
    "Learning Science",
    "Success Stories",
    "Industry Insights",
    "Community",
    "Platform Updates"
  ];
  
  const filteredPosts = searchTerm
    ? blogPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : blogPosts;
    
  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">SkillSwap Blog</h1>
              <p className="text-xl mb-8">
                Tips, stories, and insights from the world of skill-sharing
              </p>
              
              <div className="max-w-xl mx-auto">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search articles..."
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
        
        {/* Categories */}
        <section className="py-8 border-b border-gray-200">
          <div className="container mx-auto px-6">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    index === 0 
                      ? "bg-primary text-white" 
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>
        
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold mb-10 text-center">Featured Articles</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {featuredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                  >
                    <div className="h-64 overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <span className="bg-primary-light/20 text-primary-dark px-3 py-1 rounded-full text-sm font-medium">
                          {post.category}
                        </span>
                        <span className="mx-2 text-gray-400">•</span>
                        <div className="flex items-center text-gray-500 text-sm">
                          <Clock className="h-4 w-4 mr-1" />
                          {post.readTime}
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-3">{post.title}</h3>
                      <p className="text-gray-600 mb-4">{post.excerpt}</p>
                      
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center">
                          <img 
                            src={post.authorImage} 
                            alt={post.author}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <p className="font-medium">{post.author}</p>
                            <p className="text-gray-500 text-sm">{post.date}</p>
                          </div>
                        </div>
                        
                        <Link href={`/blog/${post.id}`}>
                          <Button variant="ghost" className="text-primary hover:text-primary-dark">
                            Read More <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* Regular Posts */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-10 text-center">Latest Articles</h2>
            
            {regularPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-3">
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                          {post.category}
                        </span>
                        <span className="mx-2 text-gray-400">•</span>
                        <div className="flex items-center text-gray-500 text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {post.readTime}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          <img 
                            src={post.authorImage} 
                            alt={post.author}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <div>
                            <p className="font-medium text-sm">{post.author}</p>
                            <p className="text-gray-500 text-xs">{post.date}</p>
                          </div>
                        </div>
                        
                        <Link href={`/blog/${post.id}`}>
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                            Read
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-600 mb-4">No articles found matching "{searchTerm}"</p>
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              </div>
            )}
            
            {/* Pagination */}
            {regularPosts.length > 0 && (
              <div className="mt-16 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button size="sm" className="bg-primary text-white">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <span className="px-2">...</span>
                  <Button variant="outline" size="sm">8</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </nav>
              </div>
            )}
          </div>
        </section>
        
        {/* Newsletter */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto bg-primary-light/10 rounded-lg p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
                <p className="text-gray-600">
                  Get the latest articles, tips, and insights delivered directly to your inbox.
                </p>
              </div>
              
              <form 
                action="https://formspree.io/f/xpwdvevp" 
                method="POST"
                className="flex flex-col md:flex-row gap-4"
              >
                <Input
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  className="md:flex-grow"
                  required
                />
                <input type="hidden" name="form-name" value="newsletter" />
                <Button type="submit" className="bg-primary hover:bg-primary-dark">
                  Subscribe
                </Button>
              </form>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}