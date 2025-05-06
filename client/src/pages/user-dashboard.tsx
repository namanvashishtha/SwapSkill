import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

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

  const [skillsToTeach, setSkillsToTeach] = useState<string[]>(user?.skillsToTeach ?? []);
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>(user?.skillsToLearn ?? []);
  const [newTeachSkill, setNewTeachSkill] = useState("");
  const [newLearnSkill, setNewLearnSkill] = useState("");

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
    <div className="min-h-screen bg-white pt-16 text-gray-900 flex flex-col lg:flex-row">
      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-semibold">{user?.username || "User"}’s Dashboard</h1>
          <p className="text-gray-500">Here’s your activity this week:</p>
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
      </div>

      {/* Right Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/3 bg-white text-gray-900 p-8 relative overflow-hidden shadow-lg"
      >
        <div className="space-y-8 relative z-10">
          {/* About Me */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-indigo-50 rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4">About Me</h3>
            <Link to="/profile-edit">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-3">
                View Profile
              </Button>
            </Link>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-indigo-50 rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4">Dashboard</h3>
            <nav className="flex flex-col gap-4">
              <a href="#" className="text-gray-900 hover:text-indigo-600">Overview</a>
              <a href="#" className="text-gray-900 hover:text-indigo-600">Sessions</a>
              <a href="#" className="text-gray-900 hover:text-indigo-600">Skills</a>
              <a href="#" className="text-gray-900 hover:text-indigo-600">Settings</a>
            </nav>
          </motion.div>

          {/* Skills I Can Teach */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-indigo-50 rounded-xl p-6 shadow-lg"
          >
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
          </motion.div>

          {/* Skills I Wish to Learn */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-indigo-50 rounded-xl p-6 shadow-lg"
          >
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
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
