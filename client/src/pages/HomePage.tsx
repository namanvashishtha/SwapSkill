import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SkillRibbon from "@/components/SkillRibbon";
import AnimatedText from "@/components/AnimatedText";
import SkillCard from "@/components/SkillCard";
import TestimonialCard from "@/components/TestimonialCard";
import { Button } from "@/components/ui/button";
import { popularSkills, testimonials } from "@/lib/utils";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <div className="bg-gradient-hero text-white min-h-[600px] relative overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-white sm:mt-5 sm:text-6xl lg:mt-6 xl:text-6xl">
                  <span className="block overflow-hidden">
                    <AnimatedText
                      text="Welcome to"
                      typingEffect={true}
                    />
                  </span>
                  <span className="block mt-1 sm:mt-2 font-poppins">
                    <AnimatedText
                      text="SwapSkill"
                      colorShift={true}
                    />
                  </span>
                </h1>
                <p className="mt-8 text-base sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  Got a skill? Need a skill? Let's make the magic happen with SwapSkill
                </p>
                <p className="mt-3 text-base sm:mt-5 sm:text-lg">
                  Trade talents, learn cool stuff, and meet awesome people!
                </p>
                <div className="mt-8 sm:mt-12">
                  <div className="sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-full shadow">
                      <Link href="/auth?signup=true">
                        <Button size="xl" className="w-full">
                          GET STARTED
                        </Button>
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link href="/about">
                        <Button size="xl" variant="secondary" className="w-full">
                          LEARN MORE
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                {/* Auto-scrolling skill ribbon */}
                <SkillRibbon />
              </div>
            </div>
          </div>
        </div>

        {/* Featured Skills Section */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl font-poppins">
                Popular Skills on <span className="text-primary">Swap<span className="text-secondary">Skill</span></span>
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                Discover the most exchanged skills in our community
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {popularSkills.map((skill, index) => (
                  <SkillCard
                    key={index}
                    title={skill.title}
                    description={skill.description}
                    icon={skill.icon}
                    color={skill.color}
                    teachers={skill.teachers}
                    learners={skill.learners}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="bg-gray-50 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl font-poppins">
                What Our Community Says
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                Real stories from people who've swapped skills on our platform
              </p>
            </div>
            <div className="mt-12">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((testimonial, index) => (
                  <TestimonialCard
                    key={index}
                    name={testimonial.name}
                    location={testimonial.location}
                    image={testimonial.image}
                    text={testimonial.text}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-hero">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to share your skills?</span>
              <span className="block text-accent">Join our community today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-full shadow">
                <Link href="/auth?signup=true">
                  <Button variant="secondary" size="xl">
                    Get started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
