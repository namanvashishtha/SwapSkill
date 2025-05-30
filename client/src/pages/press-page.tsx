import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Footer from "@/components/home/footer";
import { Link } from "wouter";

export default function PressPage() {
  const pressReleases = [
    {
      id: 1,
      title: "SkillSwap Raises $5M in Seed Funding to Expand Skill-Sharing Platform",
      date: "June 15, 2023",
      excerpt: "SkillSwap, the innovative platform connecting people for skill exchanges, has secured $5 million in seed funding led by Accel Partners with participation from Sequoia India.",
      link: "#"
    },
    {
      id: 2,
      title: "SkillSwap Launches Mobile App for iOS and Android",
      date: "April 3, 2023",
      excerpt: "SkillSwap today announced the launch of its mobile applications for iOS and Android, making skill-sharing more accessible to users on the go.",
      link: "#"
    },
    {
      id: 3,
      title: "SkillSwap Reaches 100,000 User Milestone",
      date: "February 10, 2023",
      excerpt: "SkillSwap has reached 100,000 registered users across India, marking a significant milestone in the company's growth journey.",
      link: "#"
    }
  ];

  const mediaFeatures = [
    {
      id: 1,
      publication: "TechCrunch",
      title: "SkillSwap: The Platform Revolutionizing How We Learn",
      date: "May 20, 2023",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/b9/TechCrunch_logo.svg",
      link: "#"
    },
    {
      id: 2,
      publication: "The Economic Times",
      title: "How SkillSwap is Democratizing Education in India",
      date: "April 12, 2023",
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/9b/The_Economic_Times_logo.svg",
      link: "#"
    },
    {
      id: 3,
      publication: "YourStory",
      title: "SkillSwap Founders on Building a Community-First Platform",
      date: "March 5, 2023",
      logo: "https://yourstory.com/favicon.ico",
      link: "#"
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Press & Media</h1>
              <p className="text-xl mb-8">
                News, press releases, and media resources about SkillSwap
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Press Kit
                </Button>
                <Button size="lg" className="bg-white/20 hover:bg-white/30">
                  Media Inquiries
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Press Releases */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-10 text-center">Press Releases</h2>
              
              <div className="space-y-6">
                {pressReleases.map((release) => (
                  <motion.div
                    key={release.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center text-gray-500 text-sm mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {release.date}
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{release.title}</h3>
                      <p className="text-gray-700 mb-4">{release.excerpt}</p>
                      <Link href={release.link}>
                        <Button variant="outline" className="text-primary">Read Full Release</Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-10 text-center">
                <Button variant="outline" size="lg">View All Press Releases</Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Media Coverage */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-10 text-center">Media Coverage</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mediaFeatures.map((feature) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="h-12 mb-4 flex items-center">
                        <img 
                          src={feature.logo} 
                          alt={feature.publication} 
                          className="h-full object-contain"
                        />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <div className="flex items-center text-gray-500 text-sm mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {feature.date}
                      </div>
                      <Link href={feature.link}>
                        <Button variant="outline" className="w-full text-primary">Read Article</Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-10 text-center">
                <Button variant="outline" size="lg">View All Media Coverage</Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Media Resources */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-10 text-center">Media Resources</h2>
              
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4">Brand Assets</h3>
                      <p className="text-gray-700 mb-4">
                        Download our logo, brand guidelines, and other assets for media use.
                      </p>
                      <Button>Download Brand Kit</Button>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold mb-4">Company Information</h3>
                      <p className="text-gray-700 mb-4">
                        Access fact sheets, founder bios, and company background information.
                      </p>
                      <Button>Download Company Info</Button>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold mb-4">Product Screenshots</h3>
                      <p className="text-gray-700 mb-4">
                        High-resolution screenshots of the SkillSwap platform and mobile apps.
                      </p>
                      <Button>Download Screenshots</Button>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold mb-4">Media Contact</h3>
                      <p className="text-gray-700 mb-4">
                        For press inquiries, please contact our media relations team.
                      </p>
                      <Button>Contact Media Team</Button>
                    </div>
                  </div>
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