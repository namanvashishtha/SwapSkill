import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Footer from "@/components/home/footer";

export default function SuccessStoriesPage() {
  const successStories = [
    {
      name: "Sarah Johnson",
      title: "From Corporate Job to Classical Dance Instructor",
      skills: ["Bharatanatyam", "Dance Choreography"],
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      quote: "SkillSwap helped me reconnect with my passion for Bharatanatyam and turn it into a fulfilling career. I exchanged my digital marketing expertise for classical dance training with a renowned guru.",
      story: "I was working in a multinational company in Bangalore, but always felt something was missing. I had learned Bharatanatyam as a child but gave it up to focus on my corporate career. Through SkillSwap, I connected with Guru Lakshmi, who has been teaching classical dance for over 30 years. She wanted to expand her dance school's online presence but didn't know where to begin. We made a perfect match - I helped her create a digital marketing strategy, build a website, and manage social media, while she helped me refine my dance techniques and deepen my understanding of the art form. After a year of consistent practice and mentorship, I was confident enough to perform at local cultural events. Today, I teach Bharatanatyam part-time at a cultural center in Indiranagar and have never felt more fulfilled. What started as a skill exchange has blossomed into a beautiful journey of rediscovering my cultural roots."
    },
    {
      name: "Michael Anderson",
      title: "Engineering Student to App Developer",
      skills: ["Mobile App Development", "Flutter"],
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      quote: "As an engineering student in Pune, I was struggling with theoretical knowledge but no practical skills. SkillSwap connected me with a senior developer who mentored me in Flutter development.",
      story: "During my third year of engineering at a college in Pune, I realized that the curriculum wasn't preparing me for real-world software development. I wanted to learn mobile app development but couldn't afford expensive courses. On SkillSwap, I found Vikram, a senior developer at a tech startup in Mumbai who needed help with content writing for his technical blog. Being passionate about explaining technical concepts, I offered to write articles for his blog in exchange for Flutter development mentorship. We set up weekly virtual sessions where he guided me through building progressively complex apps. Within six months, I had developed enough skills to create a local bus tracking app for my college campus, which gained popularity among students. This project became the highlight of my resume and helped me secure an internship at a leading tech company in Hyderabad. Vikram continues to be my mentor, and I'm now paying it forward by teaching basic programming to junior students through SkillSwap."
    },
    {
      name: "Emily Wilson",
      title: "Transforming Traditional Recipes into a Culinary Business",
      skills: ["South Indian Cooking", "Food Photography"],
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      quote: "My grandmother's recipes were treasures I wanted to preserve and share. Through SkillSwap, I learned food photography and digital marketing in exchange for teaching authentic Tamil cuisine.",
      story: "I grew up in Chennai watching my grandmother prepare traditional Tamil dishes with such precision and love. After she passed away, I realized her recipes would be lost if I didn't document them properly. I had all the culinary knowledge but lacked the skills to present it professionally. On SkillSwap, I connected with Ananya, a professional photographer from Delhi, who wanted to learn authentic South Indian cooking. We created a perfect exchange - she taught me food styling and photography techniques, while I taught her how to make the perfect dosas, sambhar, and other Tamil specialties. Another exchange with Rohit, a digital marketing professional from Kolkata, helped me create an Instagram page and a blog. Within a year, my 'Ammama's Kitchen' Instagram account gained over 50,000 followers, and I started receiving requests for cooking workshops. I now run weekend cooking classes in Chennai and have published an e-cookbook featuring my grandmother's recipes with my own photography. What began as a personal project to preserve family traditions has turned into a thriving culinary business."
    },
    {
      name: "Robert Miller",
      title: "Corporate Professional to Yoga Entrepreneur",
      skills: ["Yoga Instruction", "Meditation Techniques"],
      image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      quote: "After 15 years in the corporate world, I wanted to pursue my passion for yoga. SkillSwap helped me exchange my business expertise for advanced yoga training with a certified instructor.",
      story: "Working as a senior manager at an IT company in Gurgaon left me stressed and disconnected from myself. Yoga had been my sanctuary for years, but I wanted to deepen my practice and possibly make it my second career. Through SkillSwap, I met Guru Sundar, a certified yoga instructor with 20 years of experience who wanted to expand his yoga studio but lacked business acumen. We created a mutually beneficial arrangement - I helped him develop a business plan, streamline operations, and implement a digital booking system for his yoga studio, while he provided me with intensive training in advanced asanas, pranayama, and meditation techniques. After six months of dedicated practice and mentorship, I completed my yoga teacher certification and started offering weekend classes at a local community center. The positive response encouraged me to gradually transition from my corporate job to teaching yoga full-time. Today, I run 'Shanti Yoga' in Noida, offering classes that specifically cater to corporate professionals dealing with stress and burnout. My background in the corporate world helps me connect with my clients on a deeper level, understanding their challenges firsthand."
    },
    {
      name: "Jessica Taylor",
      title: "Self-Taught Artist to Professional Illustrator",
      skills: ["Digital Illustration", "Character Design"],
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      quote: "Growing up in Lucknow, I always sketched but never thought art could be a career. SkillSwap connected me with a professional illustrator who transformed my hobby into a profession.",
      story: "Art was always considered just a hobby in my family, with engineering or medicine being the 'real career options.' While pursuing my engineering degree in Lucknow, I continued sketching in my free time but lacked formal training. On SkillSwap, I connected with Vivek, a professional illustrator from Mumbai who worked with major publishing houses. He needed help improving his English writing skills for international clients, and as an avid reader with good language skills, I could help. Our exchange was life-changing - I edited his emails and project proposals, while he taught me digital illustration techniques, character design, and how to use professional software. He also guided me on building a portfolio and approaching clients. Within a year, I started getting small freelance projects illustrating children's stories. After graduating, instead of pursuing engineering, I took the leap to become a full-time illustrator. Today, I work with several publishing houses creating illustrations for children's books, and recently illustrated my first graphic novel based on Indian mythology. My parents, who were initially skeptical, are now my biggest supporters after seeing my work in print and my growing client list."
    },
    {
      name: "David Thompson",
      title: "From Music Enthusiast to Carnatic Vocal Performer",
      skills: ["Carnatic Music", "Vocal Performance"],
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      quote: "I always loved Carnatic music but couldn't afford formal training. Through SkillSwap, I exchanged my web development skills for lessons with an accomplished vocalist from Chennai.",
      story: "Growing up in a middle-class family in Coimbatore, I was always drawn to Carnatic music but formal training with established teachers was financially out of reach. While working as a web developer, I joined SkillSwap hoping to find a music teacher. I was fortunate to connect with Vidya, a renowned Carnatic vocalist from Chennai who needed a website for her music school. Our arrangement was perfect - I built and maintained her website and online student portal, while she provided me with weekly Carnatic vocal lessons over video calls. She was patient with my adult learning curve and tailored the lessons to my voice and abilities. After two years of rigorous practice and her expert guidance, I performed my first full-length concert at a local temple festival. The positive response from the audience and my guru's encouragement gave me the confidence to continue pursuing music alongside my tech career. I now perform regularly at cultural events across Tamil Nadu and have started teaching beginners. Carnatic music has added a dimension of fulfillment to my life that I never thought possible, and it all began with a simple skill exchange."
    },
    {
      name: "Jennifer Davis",
      title: "Homemaker to Financial Literacy Coach",
      skills: ["Personal Finance", "Investment Planning"],
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      quote: "After managing my family's finances successfully for years, I wanted to help other women become financially independent. SkillSwap helped me formalize my knowledge and build a coaching business.",
      story: "As a homemaker in Jaipur, I had been managing my family's finances for 15 years, learning about investments and growing our savings significantly. I wanted to share this knowledge, especially with women who often remain uninvolved in financial decisions. However, I lacked formal credentials and business know-how. Through SkillSwap, I connected with Amit, a certified financial planner from Mumbai who wanted to improve his Hindi to connect better with clients from smaller cities. Our exchange was ideal - he helped me structure my practical knowledge into a comprehensive financial literacy curriculum and guided me through certification processes, while I helped him become fluent in conversational Hindi with the right regional nuances. With his mentorship, I started conducting free financial literacy workshops for women in my community. The response was overwhelming, with many participants requesting personalized guidance. This encouraged me to start 'Arthshastra for Women,' offering financial coaching services specifically designed for women at different life stages. Today, I work with clients across Rajasthan, helping homemakers, working women, and widows take control of their finances. What began as sharing informal knowledge has become a fulfilling second career that empowers other women while providing me with financial independence."
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Success Stories</h1>
              <p className="text-xl">
                Read about how SkillSwap has helped people learn, grow, and transform their lives
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Real People, Real Skills, Real Results</h2>
                <p className="text-xl text-gray-600">
                  These stories showcase the power of skill-sharing and community learning.
                </p>
              </div>
              
              <div className="space-y-16">
                {successStories.map((story, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                  >
                    <div className="md:flex">
                      <div className="md:flex-shrink-0 md:w-1/3 bg-primary-light/10">
                        <div className="h-full flex flex-col items-center justify-center p-8">
                          <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-primary-light">
                            <img 
                              src={story.image} 
                              alt={story.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="text-xl font-bold text-center">{story.name}</h3>
                          <div className="flex items-center mt-2 mb-4">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current text-yellow-500" />
                            ))}
                          </div>
                          <div className="flex flex-wrap justify-center gap-2">
                            {story.skills.map((skill, i) => (
                              <span 
                                key={i}
                                className="px-3 py-1 bg-primary-light/20 text-primary-dark rounded-full text-sm font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="p-8 md:w-2/3">
                        <h2 className="text-2xl font-bold mb-4">{story.title}</h2>
                        <div className="mb-6 italic text-gray-600 border-l-4 border-primary-light pl-4 py-2">
                          "{story.quote}"
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {story.story}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-20 bg-primary-light/10 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Share Your Success Story</h2>
                <p className="text-lg mb-6">
                  Has SkillSwap helped you learn a new skill or transform your career? 
                  We'd love to hear about it and possibly feature your story!
                </p>
                <button className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                  Submit Your Story
                </button>
              </div>
              
              <div className="mt-16 text-center">
                <h2 className="text-2xl font-bold mb-6">Success by the Numbers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                    <div className="text-gray-600">Successful Skill Exchanges</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-4xl font-bold text-primary mb-2">85%</div>
                    <div className="text-gray-600">Users Report Career Advancement</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-4xl font-bold text-primary mb-2">92%</div>
                    <div className="text-gray-600">Satisfaction Rate</div>
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