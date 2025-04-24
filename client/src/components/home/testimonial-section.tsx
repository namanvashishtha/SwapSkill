import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Mumbai, India",
    testimonial: "I taught yoga to Arjun while he taught me how to code in Python. Now I'm building a yoga app with my new skills!"
  },
  {
    name: "Raj Patel",
    location: "Bangalore, India",
    testimonial: "I was struggling with digital marketing until I met Neha through SwapSkill. I taught her guitar, and she transformed my business!"
  },
  {
    name: "Ananya Desai",
    location: "Delhi, India",
    testimonial: "Found a photography mentor while sharing my cooking skills. SwapSkill connects people in ways I never imagined possible."
  }
];

export default function TestimonialSection() {
  return (
    <div className="py-20 gradient-bg">
      <div className="container mx-auto px-6 text-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Success Stories</h2>
          <p className="mt-4 max-w-2xl mx-auto opacity-80">
            Hear from our community members who have transformed their skills.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 pop-out-effect"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm opacity-80">{testimonial.location}</p>
                </div>
              </div>
              <p className="italic">{testimonial.testimonial}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
