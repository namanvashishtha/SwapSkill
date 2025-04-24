import { motion } from "framer-motion";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/home/footer";

export default function TeamPage() {
  const team = [
    {
      name: "Naman Vashishtha",
      role: "Founder & CEO",
      bio: "Naman leads SwapSkill's vision and strategy. With a background in educational technology, he's passionate about democratizing access to learning and building communities.",
      skills: ["Leadership", "Product Strategy", "Educational Technology"]
    },
    {
      name: "Akshita Gupta",
      role: "Chief Operations Officer",
      bio: "Akshita oversees SwapSkill's day-to-day operations. Her expertise in operations and community building ensures that the platform delivers a seamless experience for all users.",
      skills: ["Operations", "Community Building", "User Experience"]
    },
    {
      name: "Rahul Sharma",
      role: "Lead Developer",
      bio: "Rahul is responsible for SwapSkill's technical infrastructure. He has extensive experience in building scalable web applications and user-friendly interfaces.",
      skills: ["Full-stack Development", "Architecture Design", "Performance Optimization"]
    },
    {
      name: "Priya Patel",
      role: "Head of Community",
      bio: "Priya manages our growing community of users. She's focused on creating a safe, inclusive environment where everyone feels empowered to share their skills.",
      skills: ["Community Management", "Content Strategy", "User Engagement"]
    },
    {
      name: "Vikram Singh",
      role: "Growth Marketing Lead",
      bio: "Vikram drives SwapSkill's growth strategies. His data-driven approach helps us reach the right audiences and share our mission with the world.",
      skills: ["Digital Marketing", "Analytics", "Content Creation"]
    },
    {
      name: "Neha Kapoor",
      role: "UX Designer",
      bio: "Neha crafts the user experience across SwapSkill. She works to make our platform intuitive, accessible, and enjoyable for everyone.",
      skills: ["User Research", "UI Design", "Accessibility"]
    }
  ];
  
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Meet Our Team</h1>
              <p className="text-xl mb-8">
                The passionate individuals who are building SwapSkill to transform how people learn and share skills.
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Team Grid */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="h-48 bg-gray-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-32 h-32">
                        <circle cx="50" cy="50" r="50" fill="#E2E8F0" />
                        <circle cx="50" cy="35" r="20" fill="#A0AEC0" />
                        <path d="M50 60 C30 60, 20 80, 20 100 L80 100 C80 80, 70 60, 50 60" fill="#A0AEC0" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                    <p className="text-primary font-medium mb-4">{member.role}</p>
                    <p className="text-gray-600 mb-6">{member.bio}</p>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {member.skills.map(skill => (
                          <span 
                            key={skill} 
                            className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Values Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl font-bold mb-8 text-gray-800">Our Core Values</h2>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-light rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Community First</h3>
                <p className="text-gray-600">
                  We build platforms that strengthen connections and foster a sense of belonging.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white p-6 rounded-lg shadow-md text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-light rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Accessible Learning</h3>
                <p className="text-gray-600">
                  We believe everyone deserves access to quality education, regardless of financial constraints.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-md text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-light rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Safety and Trust</h3>
                <p className="text-gray-600">
                  We prioritize creating a safe environment where members can connect with confidence.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Join the Team */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Join Our Team</h2>
              <p className="text-xl text-gray-600 mb-8">
                We're always looking for passionate individuals to help us build the future of skill-sharing.
              </p>
              <a 
                href="/careers" 
                className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition duration-300"
              >
                View Open Positions
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}