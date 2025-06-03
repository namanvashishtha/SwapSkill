import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code, Palette, Music, BookOpen, Camera, Dumbbell, Globe, Briefcase, ChefHat, Leaf, Wrench, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface AvailableSkill {
  id: number;
  name: string;
  category: string;
  description?: string;
  isActive: boolean;
}

export default function SkillsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [skills, setSkills] = useState<AvailableSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch skills from API
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/available-skills', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch skills');
        }
        
        const skillsData = await response.json();
        setSkills(skillsData);
      } catch (err) {
        console.error('Error fetching skills:', err);
        setError('Failed to load skills');
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // Category icons mapping
  const categoryIcons: Record<string, React.ReactNode> = {
    "Technology": <Code className="h-8 w-8" />,
    "Creative Arts": <Palette className="h-8 w-8" />,
    "Music": <Music className="h-8 w-8" />,
    "Academic": <BookOpen className="h-8 w-8" />,
    "Photography": <Camera className="h-8 w-8" />,
    "Fitness": <Dumbbell className="h-8 w-8" />,
    "Languages": <Globe className="h-8 w-8" />,
    "Business": <Briefcase className="h-8 w-8" />,
    "Culinary": <ChefHat className="h-8 w-8" />,
    "Gardening": <Leaf className="h-8 w-8" />,
    "DIY & Crafts": <Wrench className="h-8 w-8" />,
    "Wellness": <Heart className="h-8 w-8" />,
    "Other": <Code className="h-8 w-8" />
  };

  // Category colors mapping
  const categoryColors: Record<string, string> = {
    "Technology": "bg-blue-500",
    "Creative Arts": "bg-purple-500",
    "Music": "bg-indigo-500",
    "Academic": "bg-green-500",
    "Photography": "bg-amber-500",
    "Fitness": "bg-red-500",
    "Languages": "bg-teal-500",
    "Business": "bg-gray-700",
    "Culinary": "bg-orange-500",
    "Gardening": "bg-emerald-500",
    "DIY & Crafts": "bg-yellow-600",
    "Wellness": "bg-pink-500",
    "Other": "bg-gray-500"
  };

  // Filter skills based on search term
  const filteredSkills = searchTerm 
    ? skills.filter(skill => 
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : skills;

  // Group filtered skills by category for display
  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = {
        categoryName: skill.category,
        categoryColor: categoryColors[skill.category] || "bg-gray-500",
        categoryIcon: categoryIcons[skill.category] || <Code className="h-8 w-8" />,
        skills: []
      };
    }
    acc[skill.category].skills.push(skill.name);
    return acc;
  }, {} as Record<string, { categoryName: string; categoryColor: string; categoryIcon: React.ReactNode; skills: string[] }>);

  // Get unique categories for stats
  const uniqueCategories = Array.from(new Set(skills.map(skill => skill.category)));

  if (loading) {
    return (
      <div className="bg-white text-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading skills...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white text-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">All Skills</h1>
            <p className="text-lg mb-6">
              Explore all available skills for teaching and learning
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
      </div>

      {/* Skills Content */}
      <div className="container mx-auto px-6 py-8">
        {Object.keys(groupedSkills).length > 0 ? (
          <div className="space-y-8">
            {Object.values(groupedSkills).map((group, index) => (
              <motion.div
                key={group.categoryName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <div className={`${group.categoryColor} p-4 flex items-center text-white`}>
                    <div className="rounded-full bg-white/20 p-2 mr-4">
                      {group.categoryIcon}
                    </div>
                    <h2 className="text-xl font-bold">{group.categoryName}</h2>
                    <span className="ml-auto text-sm bg-white/20 px-3 py-1 rounded-full">
                      {group.skills.length} skills
                    </span>
                  </div>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {group.skills.map((skill, skillIndex) => (
                        <motion.div
                          key={skill}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: skillIndex * 0.05 }}
                          className="bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-lg p-3 text-center cursor-pointer border border-gray-200 hover:border-gray-300"
                        >
                          <span className="text-sm font-medium text-gray-800">{skill}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold mb-4 text-gray-600">No skills found</h3>
            <p className="text-gray-500 mb-6">Try a different search term or clear your search to see all skills</p>
            <Button onClick={() => setSearchTerm("")} variant="outline">
              Clear Search
            </Button>
          </div>
        )}

        {/* Skills Summary */}
        {!searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 text-center bg-gray-50 rounded-lg p-8"
          >
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Skills Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-indigo-600 mb-2">{skills.length}</div>
                <div className="text-gray-600">Total Skills</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-purple-600 mb-2">{uniqueCategories.length}</div>
                <div className="text-gray-600">Categories</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {uniqueCategories.length > 0 ? Math.round(skills.length / uniqueCategories.length) : 0}
                </div>
                <div className="text-gray-600">Avg Skills per Category</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}