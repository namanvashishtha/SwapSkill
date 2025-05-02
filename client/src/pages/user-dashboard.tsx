import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/use-auth";

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

  if (isLoading) {
    return <div className="p-6 text-lg">Loading dashboard...</div>;
  }

  return (
    
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-4 hidden md:block">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        <nav className="flex flex-col gap-4">
          <a href="#" className="text-gray-700 hover:text-indigo-600">Overview</a>
          <a href="#" className="text-gray-700 hover:text-indigo-600">Sessions</a>
          <a href="#" className="text-gray-700 hover:text-indigo-600">Skills</a>
          <a href="#" className="text-gray-700 hover:text-indigo-600">Settings</a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold"> {user?.username || "User"}'s Dashboard</h1>
          <p className="text-gray-600">Here's your activity this week:</p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold">Skills Shared</h3>
              <p className="text-2xl font-bold text-indigo-600">
                {user?.skillsToTeach?.length ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold">Skills to Learn</h3>
              <p className="text-2xl font-bold text-indigo-600">
                {user?.skillsToLearn?.length ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold">Rating</h3>
              <p className="text-2xl font-bold text-indigo-600">4.9⭐</p>
            </CardContent>
          </Card>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Weekly Sessions</h2>
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
    </div>
  );
}
