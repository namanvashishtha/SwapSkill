import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Home, Calendar, Book, Settings, User } from "lucide-react";

const data = [
  { name: "Mon", sessions: 2 },
  { name: "Tue", sessions: 4 },
  { name: "Wed", sessions: 1 },
  { name: "Thu", sessions: 3 },
  { name: "Fri", sessions: 5 },
  { name: "Sat", sessions: 2 },
  { name: "Sun", sessions: 0 },
];

export default function UserDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const [skillsToTeach, setSkillsToTeach] = useState(user?.skillsToTeach ?? []);
  const [skillsToLearn, setSkillsToLearn] = useState(user?.skillsToLearn ?? []);
  const [newTeachSkill, setNewTeachSkill] = useState("");
  const [newLearnSkill, setNewLearnSkill] = useState("");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  if (isLoading) {
    return <div className="p-6 text-lg">Loading dashboard...</div>;
  }

  const handleAddTeachSkill = () => {
    if (!newTeachSkill.trim()) {
      toast({
        title: "Error",
        description: "Please enter a skill to add.",
        variant: "destructive",
      });
      return;
    }
    if (skillsToTeach.includes(newTeachSkill.trim())) {
      toast({
        title: "Error",
        description: "This skill already exists in your 'Skills I Can Teach' list.",
        variant: "destructive",
      });
      return;
    }
    setSkillsToTeach([...skillsToTeach, newTeachSkill.trim()]);
    setNewTeachSkill("");
    toast({
      title: "Success",
      description: "Skill added to 'Skills I Can Teach'.",
    });
  };

  const handleAddLearnSkill = () => {
    if (!newLearnSkill.trim()) {
      toast({
        title: "Error",
        description: "Please enter a skill to add.",
        variant: "destructive",
      });
      return;
    }
    if (skillsToLearn.includes(newLearnSkill.trim())) {
      toast({
        title: "Error",
        description: "This skill already exists in your 'Skills I Wish to Learn' list.",
        variant: "destructive",
      });
      return;
    }
    setSkillsToLearn([...skillsToLearn, newLearnSkill.trim()]);
    setNewLearnSkill("");
    toast({
      title: "Success",
      description: "Skill added to 'Skills I Wish to Learn'.",
    });
  };

  return (
    <div className="bg-white text-gray-900 min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-6">
          <Link href="#" className="font-bold text-xl flex items-center">
            <span className="text-pink-500 mr-1">Swap</span>
            <span className="text-black">Skill</span>
          </Link>
          <Link href="#" className="text-gray-600 hover:text-indigo-700">
            Home
          </Link>
          <Link href="#" className="text-gray-600 hover:text-indigo-700">
            About
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Hello, {user?.username || "User"}</span>
          <Button className="bg-red-500 text-white hover:bg-white hover:text-red-500 border border-red-500 rounded-lg px-4 py-2 transition-colors duration-300">
            Logout
          </Button>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <motion.aside
          initial={{ width: 64 }}
          animate={{ width: isSidebarExpanded ? 200 : 64 }}
          onHoverStart={() => setIsSidebarExpanded(true)}
          onHoverEnd={() => setIsSidebarExpanded(false)}
          transition={{ duration: 0.3 }}
          className="fixed top-16 left-0 h-[calc(100vh-4rem)] bg-indigo-700 text-white z-40 shadow-lg overflow-hidden"
        >
          <div className="flex flex-col h-full py-6 space-y-4 px-2">
            <Link href="/profile-edit" className="flex items-center gap-4 px-4 py-3 hover:bg-indigo-600 rounded-lg">
              <User className="w-5 h-5 flex-shrink-0" />
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: isSidebarExpanded ? 1 : 0, width: isSidebarExpanded ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Profile
              </motion.span>
            </Link>
            <Link href="#" className="flex items-center gap-4 px-4 py-3 hover:bg-indigo-600 rounded-lg">
              <Home className="w-5 h-5 flex-shrink-0" />
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: isSidebarExpanded ? 1 : 0, width: isSidebarExpanded ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Overview
              </motion.span>
            </Link>
            <Link href="#" className="flex items-center gap-4 px-4 py-3 hover:bg-indigo-600 rounded-lg">
              <Calendar className="w-5 h-5 flex-shrink-0" />
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: isSidebarExpanded ? 1 : 0, width: isSidebarExpanded ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Sessions
              </motion.span>
            </Link>
            <Link href="#" className="flex items-center gap-4 px-4 py-3 hover:bg-indigo-600 rounded-lg">
              <Book className="w-5 h-5 flex-shrink-0" />
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: isSidebarExpanded ? 1 : 0, width: isSidebarExpanded ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Skills
              </motion.span>
            </Link>
            <Link href="#" className="flex items-center gap-4 px-4 py-3 hover:bg-indigo-600 rounded-lg">
              <Settings className="w-5 h-5 flex-shrink-0" />
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: isSidebarExpanded ? 1 : 0, width: isSidebarExpanded ? "auto" : 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Settings
              </motion.span>
            </Link>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <motion.div
          className="flex-1 p-8 transition-all duration-300"
          animate={{ marginLeft: isSidebarExpanded ? "200px" : "64px" }}
        >
          {/* Header */}
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-semibold">{user?.username || "User"}’s Dashboard</h1>
              <p className="text-gray-500">Here’s your activity this week:</p>
            </div>
            <div className="relative">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="w-12 h-12 rounded-full border-2 border-indigo-600 object-cover hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full border-2 border-indigo-600 bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-xl hover:scale-105 transition-transform duration-200">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-xl transition-shadow bg-white text-gray-800 shadow-md rounded-xl p-6">
              <CardContent>
                <h3 className="text-xl font-semibold">Skills Shared</h3>
                <p className="text-3xl font-bold text-indigo-600">{skillsToTeach.length}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow bg-white text-gray-800 shadow-md rounded-xl p-6">
              <CardContent>
                <h3 className="text-xl font-semibold">Skills to Learn</h3>
                <p className="text-3xl font-bold text-indigo-600">{skillsToLearn.length}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow bg-white text-gray-800 shadow-md rounded-xl p-6">
              <CardContent>
                <h3 className="text-xl font-semibold">Rating</h3>
                <p className="text-3xl font-bold text-indigo-600">4.9⭐</p>
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Weekly Sessions</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Skills Sidebar (Mobile/Full View) */}
          <div className="grid lg:grid-cols-2 gap-8 mt-10">
            {/* Skills I Can Teach */}
            <div className="bg-indigo-50 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Skills I Can Teach</h3>
              {skillsToTeach.length > 0 ? (
                <ul className="list-disc list-inside text-sm space-y-2">
                  {skillsToTeach.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm italic">No skills added yet.</p>
              )}
              <div className="mt-4 flex space-x-2">
                <Input
                  placeholder="Add a skill"
                  value={newTeachSkill}
                  onChange={(e) => setNewTeachSkill(e.target.value)}
                  className="bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg p-3"
                />
                <Button
                  onClick={handleAddTeachSkill}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Skills I Wish to Learn */}
            <div className="bg-indigo-50 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Skills I Wish to Learn</h3>
              {skillsToLearn.length > 0 ? (
                <ul className="list-disc list-inside text-sm space-y-2">
                  {skillsToLearn.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm italic">No skills added yet.</p>
              )}
              <div className="mt-4 flex space-x-2">
                <Input
                  placeholder="Add a skill"
                  value={newLearnSkill}
                  onChange={(e) => setNewLearnSkill(e.target.value)}
                  className="bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg p-3"
                />
                <Button
                  onClick={handleAddLearnSkill}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}