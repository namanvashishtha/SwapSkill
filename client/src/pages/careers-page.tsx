import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Footer from "@/components/home/footer";
import { Link } from "wouter";
import { useState } from "react";
import ApplicationDialog from "@/components/application-dialog";

export default function CareersPage() {
  const [openApplicationDialogOpen, setOpenApplicationDialogOpen] = useState(false);
  const [jobApplicationDialogOpen, setJobApplicationDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    // The form submission is now handled by the Formspree React SDK
    // Just update the UI state for the dialog
    setFormSubmitted(true);
    
    // Log that the form is being submitted
    console.log("Form is being submitted to Formspree via React SDK");
  };
  
  const handleApplyNow = (job: any) => {
    setSelectedJob(job);
    setJobApplicationDialogOpen(true);
  };
  const jobOpenings = [
    {
      id: 1,
      title: "Fullstack Developer",
      department: "Engineering",
      location: "Remote (India)",
      type: "Full-time",
      description: "We're looking for a talented Fullstack Developer to join our engineering team and help build the future of skill-sharing platforms.",
      responsibilities: [
        "Design, develop, and maintain web applications using React, Node.js, and TypeScript",
        "Collaborate with product managers, designers, and other engineers to deliver high-quality features",
        "Write clean, maintainable, and efficient code",
        "Implement responsive designs and ensure cross-browser compatibility",
        "Optimize applications for maximum speed and scalability",
        "Participate in code reviews and contribute to engineering best practices"
      ],
      requirements: [
        "3+ years of experience in fullstack development",
        "Proficiency in React, Node.js, TypeScript, and modern JavaScript",
        "Experience with RESTful APIs and GraphQL",
        "Familiarity with database technologies (MongoDB, PostgreSQL)",
        "Understanding of server-side rendering and state management",
        "Knowledge of CI/CD pipelines and deployment strategies",
        "Excellent problem-solving skills and attention to detail",
        "Strong communication and collaboration abilities"
      ]
    },
    {
      id: 2,
      title: "Growth Management Head",
      department: "Marketing",
      location: "Remote (India)",
      type: "Full-time",
      description: "We're seeking an experienced Growth Management Head to lead our growth initiatives and help scale our user base and engagement.",
      responsibilities: [
        "Develop and execute growth strategies to increase user acquisition, activation, and retention",
        "Build and lead a team of growth marketers, analysts, and product specialists",
        "Identify key metrics and KPIs to measure growth performance",
        "Collaborate with product, engineering, and design teams to implement growth experiments",
        "Analyze user behavior data to identify opportunities for optimization",
        "Manage growth marketing budget and ensure efficient resource allocation",
        "Stay updated on industry trends and best practices in growth marketing"
      ],
      requirements: [
        "5+ years of experience in growth marketing or related field",
        "Proven track record of driving user growth in consumer tech or marketplace businesses",
        "Strong analytical skills and experience with data-driven decision making",
        "Experience with A/B testing, funnel optimization, and user acquisition channels",
        "Knowledge of growth frameworks and methodologies",
        "Excellent leadership and team management abilities",
        "Strategic thinking and ability to prioritize initiatives based on impact",
        "Strong communication skills and ability to work cross-functionally"
      ]
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Careers at SkillSwap</h1>
              <p className="text-xl mb-8">
                Join our team and help us transform how people learn and share skills
              </p>
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                View Open Positions
              </Button>
            </motion.div>
          </div>
        </section>
        
        {/* Why Join Us */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-10 text-center">Why Join SkillSwap?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="w-12 h-12 bg-primary-light/20 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Meaningful Impact</h3>
                  <p className="text-gray-600">
                    Build products that help people learn new skills, connect with others, and transform their lives through knowledge sharing.
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="w-12 h-12 bg-primary-light/20 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Flexible Work</h3>
                  <p className="text-gray-600">
                    Enjoy remote-first culture, flexible hours, and a healthy work-life balance that allows you to do your best work.
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="w-12 h-12 bg-primary-light/20 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Growth Opportunities</h3>
                  <p className="text-gray-600">
                    Develop your skills, take on new challenges, and advance your career in a supportive environment that values continuous learning.
                  </p>
                </motion.div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-primary-light/10 p-8">
                  <h3 className="text-2xl font-bold mb-4">Our Benefits</h3>
                  <p className="text-gray-700 mb-6">
                    We believe in taking care of our team members and providing the support they need to thrive.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Competitive salary and equity packages</span>
                    </div>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Comprehensive health insurance</span>
                    </div>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Flexible work arrangements</span>
                    </div>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Home office stipend</span>
                    </div>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Learning and development budget</span>
                    </div>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Generous paid time off</span>
                    </div>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Regular team retreats</span>
                    </div>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Wellness programs and mental health support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Open Positions */}
        <section className="py-16 bg-gray-100" id="open-positions">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-10 text-center">Open Positions</h2>
              
              <div className="space-y-6">
                {jobOpenings.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex flex-wrap justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold">{job.title}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-3 py-1 bg-primary-light/20 text-primary-dark rounded-full text-sm">
                              {job.department}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                              {job.location}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                              {job.type}
                            </span>
                          </div>
                        </div>
                        <Button 
                          className="mt-2 md:mt-0"
                          onClick={() => handleApplyNow(job)}
                        >
                          Apply Now
                        </Button>
                      </div>
                      
                      <p className="text-gray-700 mb-6">{job.description}</p>
                      
                      <div className="mb-6">
                        <h4 className="font-bold text-lg mb-2">Key Responsibilities:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {job.responsibilities.map((item, index) => (
                            <li key={index} className="text-gray-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-lg mb-2">Requirements:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {job.requirements.map((item, index) => (
                            <li key={index} className="text-gray-700">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-12 bg-white rounded-lg shadow-md p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Don't see a position that fits?</h3>
                <p className="text-gray-700 mb-6">
                  We're always looking for talented individuals to join our team. Send us your resume and tell us how you can contribute to SkillSwap.
                </p>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => setOpenApplicationDialogOpen(true)}
                >
                  Send Open Application
                </Button>
              </div>
              
              {/* Open Application Dialog */}
              <ApplicationDialog
                open={openApplicationDialogOpen}
                onOpenChange={setOpenApplicationDialogOpen}
                title="Open Application"
                description="Tell us about yourself and how you can contribute to SkillSwap."
                formSubmitted={formSubmitted}
                onSubmit={handleSubmit}
                onClose={() => {
                  setOpenApplicationDialogOpen(false);
                  // Reset form state after dialog is closed
                  setTimeout(() => setFormSubmitted(false), 300);
                }}
                formType="open"
              />
              
              {/* Job Application Dialog */}
              <ApplicationDialog
                open={jobApplicationDialogOpen}
                onOpenChange={setJobApplicationDialogOpen}
                title={selectedJob ? `Apply for ${selectedJob.title}` : 'Apply for Position'}
                description={selectedJob ? `Complete the form below to apply for the ${selectedJob.title} position.` : 'Complete the form below to apply.'}
                formSubmitted={formSubmitted}
                onSubmit={handleSubmit}
                onClose={() => {
                  setJobApplicationDialogOpen(false);
                  // Reset form state after dialog is closed
                  setTimeout(() => setFormSubmitted(false), 300);
                }}
                formType="job"
                jobTitle={selectedJob?.title}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}