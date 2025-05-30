import { motion } from "framer-motion";
import { Code, Palette, Music, BookOpen, Camera, Dumbbell, Globe, Briefcase, ChefHat, Leaf, Wrench, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import Footer from "@/components/home/footer";

export default function SkillCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false);
  
  const categories = [
    {
      name: "Technology",
      icon: <Code className="h-10 w-10" />,
      color: "bg-blue-500",
      skills: ["Web Development", "Mobile App Development", "Data Science", "Machine Learning", "Cybersecurity", "Cloud Computing", "Blockchain", "Game Development"]
    },
    {
      name: "Creative Arts",
      icon: <Palette className="h-10 w-10" />,
      color: "bg-purple-500",
      skills: ["Graphic Design", "Illustration", "Animation", "UI/UX Design", "Digital Painting", "Typography", "Logo Design", "Brand Identity"]
    },
    {
      name: "Music",
      icon: <Music className="h-10 w-10" />,
      color: "bg-indigo-500",
      skills: ["Guitar", "Piano", "Singing", "Music Production", "DJ Skills", "Songwriting", "Music Theory", "Drums"]
    },
    {
      name: "Academic",
      icon: <BookOpen className="h-10 w-10" />,
      color: "bg-green-500",
      skills: ["Mathematics", "Physics", "Chemistry", "Biology", "History", "Literature", "Philosophy", "Economics"]
    },
    {
      name: "Photography",
      icon: <Camera className="h-10 w-10" />,
      color: "bg-amber-500",
      skills: ["Portrait Photography", "Landscape Photography", "Product Photography", "Photo Editing", "Lighting Techniques", "Composition", "Street Photography"]
    },
    {
      name: "Fitness",
      icon: <Dumbbell className="h-10 w-10" />,
      color: "bg-red-500",
      skills: ["Yoga", "Strength Training", "Cardio Workouts", "Pilates", "Martial Arts", "Nutrition Planning", "Personal Training"]
    },
    {
      name: "Languages",
      icon: <Globe className="h-10 w-10" />,
      color: "bg-teal-500",
      skills: ["English", "Spanish", "Mandarin", "French", "German", "Japanese", "Arabic", "Russian", "Sign Language"]
    },
    {
      name: "Business",
      icon: <Briefcase className="h-10 w-10" />,
      color: "bg-gray-700",
      skills: ["Marketing", "Accounting", "Project Management", "Public Speaking", "Sales", "Entrepreneurship", "Business Strategy", "Leadership"]
    },
    {
      name: "Culinary",
      icon: <ChefHat className="h-10 w-10" />,
      color: "bg-orange-500",
      skills: ["Cooking", "Baking", "Pastry Making", "Meal Prep", "Wine Pairing", "Barista Skills", "Food Photography", "Nutrition"]
    },
    {
      name: "Gardening",
      icon: <Leaf className="h-10 w-10" />,
      color: "bg-emerald-500",
      skills: ["Plant Care", "Vegetable Gardening", "Landscape Design", "Composting", "Hydroponics", "Bonsai", "Herb Gardening"]
    },
    {
      name: "DIY & Crafts",
      icon: <Wrench className="h-10 w-10" />,
      color: "bg-yellow-600",
      skills: ["Woodworking", "Knitting", "Sewing", "Jewelry Making", "Pottery", "Home Repair", "Upcycling", "Candle Making"]
    },
    {
      name: "Wellness",
      icon: <Heart className="h-10 w-10" />,
      color: "bg-pink-500",
      skills: ["Meditation", "Mindfulness", "Aromatherapy", "Massage Techniques", "Stress Management", "Sleep Improvement", "Journaling"]
    }
  ];
  
  const filteredCategories = searchTerm 
    ? categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : categories;

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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Skill Categories</h1>
              <p className="text-xl mb-8">
                Explore the wide range of skills available for teaching and learning on SkillSwap
              </p>
              
              <div className="max-w-xl mx-auto">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search for skills or categories..."
                    className="w-full py-3 px-4 pr-10 rounded-lg text-gray-800"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Categories Grid */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  <div className={`${category.color} p-6 flex items-center justify-center text-white`}>
                    <div className="rounded-full bg-white/20 p-4">
                      {category.icon}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-4">{category.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {category.skills.slice(0, 5).map((skill, i) => (
                        <span 
                          key={i}
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                      {category.skills.length > 5 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          +{category.skills.length - 5} more
                        </span>
                      )}
                    </div>
                    <Button className="w-full">Explore {category.name}</Button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {filteredCategories.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-2xl font-bold mb-4">No matching skills found</h3>
                <p className="text-gray-600 mb-6">Try a different search term or browse our categories</p>
                <Button onClick={() => setSearchTerm("")}>View All Categories</Button>
              </div>
            )}
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Can't Find Your Skill?</h2>
              <p className="text-xl text-gray-600 mb-8">
                SkillSwap is constantly growing with new skills being added every day. 
                If you don't see the skill you're looking for, you can suggest it or create a custom skill exchange.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="px-6 py-3" onClick={() => setSuggestDialogOpen(true)}>Suggest a Skill</Button>
                <Button className="px-6 py-3">Create Custom Exchange</Button>
              </div>
              
              {/* Suggest a Skill Dialog */}
              <Dialog open={suggestDialogOpen} onOpenChange={setSuggestDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Suggest a Skill</DialogTitle>
                    <DialogDescription>
                      Don't see a skill you're looking for? Let us know what you'd like to teach or learn.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form 
                    action="https://formspree.io/f/xpwdvevp" 
                    method="POST"
                    className="space-y-4 mt-4"
                  >
                    <input type="hidden" name="form-name" value="skill-suggestion" />
                    
                    <div className="space-y-2">
                      <label htmlFor="skill-name" className="text-sm font-medium">
                        Skill Name
                      </label>
                      <Input 
                        id="skill-name" 
                        name="skill-name" 
                        placeholder="e.g., Pottery, Data Analysis, Guitar" 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        Suggested Category
                      </label>
                      <Input 
                        id="category" 
                        name="category" 
                        placeholder="e.g., Arts & Crafts, Technology, Music" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Brief Description
                      </label>
                      <textarea 
                        id="description" 
                        name="description" 
                        rows={3} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="What does this skill involve? Why should it be added?"
                        required
                      ></textarea>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Your Email (optional)
                      </label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder="We'll notify you when this skill is added" 
                      />
                    </div>
                    
                    <DialogFooter className="mt-6">
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit">Submit Suggestion</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}