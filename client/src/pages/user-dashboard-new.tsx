// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { Link } from "wouter";
// import { Card, CardContent } from "@/components/ui/card";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
// import { useAuth } from "@/hooks/use-auth";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useToast } from "@/hooks/use-toast";
// import { Home, Calendar, Book, Settings, User } from "lucide-react";
// import { queryClient } from "../lib/queryClient";

// const data = [
//   { name: "Mon", sessions: 2 },
//   { name: "Tue", sessions: 4 },
//   { name: "Wed", sessions: 1 },
//   { name: "Thu", sessions: 3 },
//   { name: "Fri", sessions: 5 },
//   { name: "Sat", sessions: 2 },
//   { name: "Sun", sessions: 0 },
// ];

// export default function UserDashboard() {
//   const { user, isLoading } = useAuth();
//   const { toast } = useToast();

//   const [skillsToTeach, setSkillsToTeach] = useState<string[]>([]);
//   const [skillsToLearn, setSkillsToLearn] = useState<string[]>([]);
//   const [newTeachSkill, setNewTeachSkill] = useState("");
//   const [newLearnSkill, setNewLearnSkill] = useState("");
//   const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
//   const [isAddingTeachSkill, setIsAddingTeachSkill] = useState(false);
//   const [isAddingLearnSkill, setIsAddingLearnSkill] = useState(false);
  
//   // Update skills whenever user data changes
//   useEffect(() => {
//     if (user) {
//       setSkillsToTeach(user.skillsToTeach ?? []);
//       setSkillsToLearn(user.skillsToLearn ?? []);
      
//       // Log user data for debugging
//       console.log("User data in dashboard:", user);
//     }
//   }, [user]);

//   if (isLoading) {
//     return <div className="p-6 text-lg">Loading dashboard...</div>;
//   }

//   const updateSkillsOnServer = async (skillsToTeach: string[], skillsToLearn: string[]) => {
//     try {
//       // First, get the current user data to include required fields
//       if (!user) {
//         throw new Error('User data is not available');
//       }
      
//       const response = await fetch('/api/user/profile', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           // Include required fields from current user data
//           fullName: user.fullName || '',
//           email: user.email || '',
//           location: user.location || '',
//           // Include the updated skills
//           skillsToTeach,
//           skillsToLearn,
//           // Preserve other fields
//           bio: user.bio || '',
//         }),
//         credentials: 'include', // Ensure cookies are sent
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to update skills');
//       }
      
//       // Refresh user data in the cache
//       queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
//       return await response.json();
//     } catch (error) {
//       console.error('Error updating skills:', error);
//       throw error;
//     }
//   };

//   const handleAddTeachSkill = async () => {
//     if (!newTeachSkill.trim()) {
//       toast({
//         title: "Error",
//         description: "Please enter a skill to add.",
//         variant: "destructive",
//       });
//       return;
//     }
//     if (skillsToTeach.includes(newTeachSkill.trim())) {
//       toast({
//         title: "Error",
//         description: "This skill already exists in your 'Skills I Can Teach' list.",
//         variant: "destructive",
//       });
//       return;
//     }
    
//     const updatedSkills = [...skillsToTeach, newTeachSkill.trim()];
    
//     setIsAddingTeachSkill(true);
//     try {
//       const result = await updateSkillsOnServer(updatedSkills, skillsToLearn);
//       console.log("Skill update result:", result);
      
//       // Update local state with the server response data
//       if (result && result.skillsToTeach) {
//         setSkillsToTeach(result.skillsToTeach);
//       } else {
//         // Fallback to our local updated skills if server doesn't return them
//         setSkillsToTeach(updatedSkills);
//       }
      
//       setNewTeachSkill("");
//       toast({
//         title: "Success",
//         description: "Skill added to 'Skills I Can Teach'.",
//       });
//     } catch (error) {
//       console.error("Error adding teach skill:", error);
//       toast({
//         title: "Error",
//         description: error instanceof Error 
//           ? `Failed to update skills: ${error.message}` 
//           : "Failed to update skills. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsAddingTeachSkill(false);
//     }
//   };

//   const handleAddLearnSkill = async () => {
//     if (!newLearnSkill.trim()) {
//       toast({
//         title: "Error",
//         description: "Please enter a skill to add.",
//         variant: "destructive",
//       });
//       return;
//     }
//     if (skillsToLearn.includes(newLearnSkill.trim())) {
//       toast({
//         title: "Error",
//         description: "This skill already exists in your 'Skills I Wish to Learn' list.",
//         variant: "destructive",
//       });
//       return;
//     }
    
//     const updatedSkills = [...skillsToLearn, newLearnSkill.trim()];
    
//     setIsAddingLearnSkill(true);
//     try {
//       const result = await updateSkillsOnServer(skillsToTeach, updatedSkills);
//       console.log("Skill update result:", result);
      
//       // Update local state with the server response data
//       if (result && result.skillsToLearn) {
//         setSkillsToLearn(result.skillsToLearn);
//       } else {
//         // Fallback to our local updated skills if server doesn't return them
//         setSkillsToLearn(updatedSkills);
//       }
      
//       setNewLearnSkill("");
//       toast({
//         title: "Success",
//         description: "Skill added to 'Skills I Wish to Learn'.",
//       });
//     } catch (error) {
//       console.error("Error adding learn skill:", error);
//       toast({
//         title: "Error",
//         description: error instanceof Error 
//           ? `Failed to update skills: ${error.message}` 
//           : "Failed to update skills. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsAddingLearnSkill(false);
//     }
//   };

//   return (
//     <div className="bg-white text-gray-900 min-h-screen flex flex-col">
//       {/* Main Layout */}
//       <div className="flex flex-1">
//         {/* Sidebar */}
//         <motion.aside
//           initial={{ width: 64 }}
//           animate={{ width: isSidebarExpanded ? 200 : 64 }}
//           onHoverStart={() => setIsSidebarExpanded(true)}
//           onHoverEnd={() => setIsSidebarExpanded(false)}
//           transition={{ duration: 0.3 }}
//           className="fixed top-[4.5rem] left-0 h-[calc(100vh-4.5rem)] bg-indigo-700 text-white z-40 shadow-lg overflow-hidden"
//         >
//           <div className="flex flex-col h-full py-6 space-y-4 px-2">
//             <Link href="/profile-edit" className="flex items-center gap-4 px-4 py-3 hover:bg-indigo-600 rounded-lg">
//               <User className="w-5 h-5 flex-shrink-0" />
//               <motion.span
//                 initial={{ opacity: 0, width: 0 }}
//                 animate={{ opacity: isSidebarExpanded ? 1 : 0, width: isSidebarExpanded ? "auto" : 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="text-sm font-medium whitespace-nowrap overflow-hidden"
//               >
//                 Profile
//               </motion.span>
//             </Link>
//             <Link href="#" className="flex items-center gap-4 px-4 py-3 hover:bg-indigo-600 rounded-lg">
//               <Home className="w-5 h-5 flex-shrink-0" />
//               <motion.span
//                 initial={{ opacity: 0, width: 0 }}
//                 animate={{ opacity: isSidebarExpanded ? 1 : 0, width: isSidebarExpanded ? "auto" : 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="text-sm font-medium whitespace-nowrap overflow-hidden"
//               >
//                 Overview
//               </motion.span>
//             </Link>
//             <Link href="#" className="flex items-center gap-4 px-4 py-3 hover:bg-indigo-600 rounded-lg">
//               <Calendar className="w-5 h-5 flex-shrink-0" />
//               <motion.span
//                 initial={{ opacity: 0, width: 0 }}
//                 animate={{ opacity: isSidebarExpanded ? 1 : 0, width: isSidebarExpanded ? "auto" : 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="text-sm font-medium whitespace-nowrap overflow-hidden"
//               >
//                 Sessions
//               </motion.span>
//             </Link>
//             <Link href="#" className="flex items-center gap-4 px-4 py-3 hover:bg-indigo-600 rounded-lg">
//               <Book className="w-5 h-5 flex-shrink-0" />
//               <motion.span
//                 initial={{ opacity: 0, width: 0 }}
//                 animate={{ opacity: isSidebarExpanded ? 1 : 0, width: isSidebarExpanded ? "auto" : 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="text-sm font-medium whitespace-nowrap overflow-hidden"
//               >
//                 Skills
//               </motion.span>
//             </Link>
//             <Link href="#" className="flex items-center gap-4 px-4 py-3 hover:bg-indigo-600 rounded-lg">
//               <Settings className="w-5 h-5 flex-shrink-0" />
//               <motion.span
//                 initial={{ opacity: 0, width: 0 }}
//                 animate={{ opacity: isSidebarExpanded ? 1 : 0, width: isSidebarExpanded ? "auto" : 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="text-sm font-medium whitespace-nowrap overflow-hidden"
//               >
//                 Settings
//               </motion.span>
//             </Link>
//           </div>
//         </motion.aside>

//         {/* Main Content Area */}
//         <motion.div
//           className="flex-1 p-8 pt-16 transition-all duration-300"
//           animate={{ marginLeft: isSidebarExpanded ? "200px" : "64px" }}
//         >
//           {/* Header */}
//           <header className="mb-8">
//             <div className="flex justify-between items-center mb-4">
//               <div>
//                 <h1 className="text-4xl font-semibold">{user?.username || "User"}'s Dashboard</h1>
//                 <p className="text-gray-500">Here's your activity this week:</p>
//               </div>
//               <Link href="/profile-edit">
//                 <div className="relative group">
//                   {user?.imageUrl ? (
//                     <img
//                       src={user.imageUrl}
//                       alt="Profile"
//                       className="w-16 h-16 rounded-full border-2 border-indigo-600 object-cover hover:scale-105 transition-transform duration-200"
//                     />
//                   ) : (
//                     <div className="w-16 h-16 rounded-full border-2 border-indigo-600 bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-xl hover:scale-105 transition-transform duration-200">
//                       {user?.username?.charAt(0).toUpperCase() || "U"}
//                     </div>
//                   )}
//                   <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full flex items-center justify-center transition-all duration-200">
//                     <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">Edit</span>
//                   </div>
//                 </div>
//               </Link>
//             </div>
            
//             {/* User Bio */}
//             {user?.bio && (
//               <div className="bg-indigo-50 p-4 rounded-lg shadow-sm mb-4">
//                 <h3 className="text-sm font-semibold text-indigo-800 mb-1">About Me</h3>
//                 <p className="text-gray-700">{user.bio}</p>
//               </div>
//             )}
//           </header>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//             <Card className="hover:shadow-xl transition-shadow bg-white text-gray-800 shadow-md rounded-xl p-6">
//               <CardContent>
//                 <h3 className="text-xl font-semibold">Skills Shared</h3>
//                 <p className="text-3xl font-bold text-indigo-600">{skillsToTeach.length}</p>
//               </CardContent>
//             </Card>
//             <Card className="hover:shadow-xl transition-shadow bg-white text-gray-800 shadow-md rounded-xl p-6">
//               <CardContent>
//                 <h3 className="text-xl font-semibold">Skills to Learn</h3>
//                 <p className="text-3xl font-bold text-indigo-600">{skillsToLearn.length}</p>
//               </CardContent>
//             </Card>
//             <Card className="hover:shadow-xl transition-shadow bg-white text-gray-800 shadow-md rounded-xl p-6">
//               <CardContent>
//                 <h3 className="text-xl font-semibold">Rating</h3>
//                 <p className="text-3xl font-bold text-indigo-600">4.9⭐</p>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Bar Chart */}
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <h2 className="text-2xl font-semibold mb-4">Weekly Sessions</h2>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={data}>
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="sessions" fill="#6366f1" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Skills Sidebar (Mobile/Full View) */}
//           <div className="grid lg:grid-cols-2 gap-8 mt-10">
//             {/* Skills I Can Teach */}
//             <div className="bg-indigo-50 rounded-xl p-6 shadow-lg">
//               <h3 className="text-lg font-semibold mb-4">Skills I Can Teach</h3>
//               {skillsToTeach.length > 0 ? (
//                 <ul className="list-disc list-inside text-sm space-y-2">
//                   {skillsToTeach.map((skill, index) => (
//                     <li key={index}>{skill}</li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p className="text-sm italic">No skills added yet.</p>
//               )}
//               <div className="mt-4 flex space-x-2">
//                 <Input
//                   placeholder="Add a skill"
//                   value={newTeachSkill}
//                   onChange={(e) => setNewTeachSkill(e.target.value)}
//                   className="bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg p-3"
//                 />
//                 <Button
//                   onClick={handleAddTeachSkill}
//                   disabled={isAddingTeachSkill}
//                   className="bg-indigo-600 hover:bg-indigo-700 text-white"
//                 >
//                   {isAddingTeachSkill ? (
//                     <>
//                       <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Adding...
//                     </>
//                   ) : (
//                     "Add"
//                   )}
//                 </Button>
//               </div>
//             </div>

//             {/* Skills I Wish to Learn */}
//             <div className="bg-indigo-50 rounded-xl p-6 shadow-lg">
//               <h3 className="text-lg font-semibold mb-4">Skills I Wish to Learn</h3>
//               {skillsToLearn.length > 0 ? (
//                 <ul className="list-disc list-inside text-sm space-y-2">
//                   {skillsToLearn.map((skill, index) => (
//                     <li key={index}>{skill}</li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p className="text-sm italic">No skills added yet.</p>
//               )}
//               <div className="mt-4 flex space-x-2">
//                 <Input
//                   placeholder="Add a skill"
//                   value={newLearnSkill}
//                   onChange={(e) => setNewLearnSkill(e.target.value)}
//                   className="bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg p-3"
//                 />
//                 <Button
//                   onClick={handleAddLearnSkill}
//                   disabled={isAddingLearnSkill}
//                   className="bg-indigo-600 hover:bg-indigo-700 text-white"
//                 >
//                   {isAddingLearnSkill ? (
//                     <>
//                       <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Adding...
//                     </>
//                   ) : (
//                     "Add"
//                   )}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }