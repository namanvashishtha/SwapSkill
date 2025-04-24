import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <div className="gradient-bg text-white min-h-[600px] md:min-h-[700px] flex items-center relative overflow-hidden">
      {/* Decorative background shape */}
      <div className="absolute top-0 right-0 opacity-10">
        <svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(300,300)">
            <path d="M141.9,-196.3C184.1,-178.9,219.2,-141.8,239.4,-96.5C259.7,-51.3,265.2,2.1,252.5,50.6C239.8,99.1,208.9,142.6,169.1,173C129.3,203.4,80.7,220.7,29.6,232.2C-21.5,243.7,-75.1,249.4,-120.9,232.1C-166.7,214.9,-204.8,174.7,-226.9,128.1C-249,81.5,-255.2,28.5,-246.6,-21.4C-238.1,-71.2,-214.7,-117.9,-179.5,-140.7C-144.3,-163.5,-97.1,-162.3,-55.1,-176.5C-13.1,-190.7,23.8,-220.4,67.5,-223.9C111.2,-227.4,161.9,-204.8,194.1,-204.1" fill="#8a2be2"></path>
          </g>
        </svg>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="flex flex-col md:flex-row">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="md:w-7/12 space-y-8"
          >
            <h1 className="font-poppins font-bold text-4xl md:text-6xl leading-tight">
              <span className="block typewriter">Welcome to</span>
              <span className="rainbow-text font-extrabold">SwapSkill</span>
            </h1>

            <p className="text-xl md:text-2xl font-medium max-w-xl">
              Got a skill? Need a skill? Let's make the magic happen with SwapSkill
            </p>

            <p className="text-lg max-w-xl">
              Trade talents, learn cool stuff, and meet awesome people!
            </p>

            <div className="flex space-x-4 pt-4">
              <Link href="/auth" className="inline-block">
                <Button 
                  size="lg" 
                  className="bg-white text-primary font-bold hover:bg-gray-100 hover:shadow-lg pop-out-effect"
                >
                  GET STARTED
                </Button>
              </Link>
              <Link href="#features" className="inline-block">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white pop-out-effect"
                >
                  LEARN MORE
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:w-5/12 mt-12 md:mt-0 flex justify-center"
          >
            <div className="relative w-full max-w-md">
              {/* Hero image */}
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                transition={{ type: "spring", stiffness: 300 }}
                className="rounded-xl shadow-xl overflow-hidden"
              >
                <svg
                  className="w-full aspect-[4/3] bg-primary-light/30"
                  viewBox="0 0 400 300"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="400" height="300" fill="#8a2be2" opacity="0.1" />
                  <text
                    x="50%"
                    y="50%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fill="#8a2be2"
                    fontSize="20"
                    fontFamily="sans-serif"
                  >
                    People collaborating on skills
                  </text>
                </svg>
              </motion.div>

              {/* Decorative elements */}
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 6 }}
                transition={{ duration: 0.5 }}
                className="absolute -top-6 -left-6 bg-accent-yellow p-3 rounded-lg shadow-lg pop-out-effect"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </motion.div>

              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: -6 }}
                transition={{ duration: 0.5 }}
                className="absolute -bottom-4 -right-4 bg-accent p-3 rounded-lg shadow-lg pop-out-effect"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
