import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Setup skills API
  app.get("/api/skills", async (req, res) => {
    const skills = [
      { id: 1, name: "Coding", icon: "code", category: "Technology" },
      { id: 2, name: "Music", icon: "music_note", category: "Arts" },
      { id: 3, name: "Cooking", icon: "restaurant", category: "Lifestyle" },
      { id: 4, name: "Photography", icon: "camera_alt", category: "Arts" },
      { id: 5, name: "Design", icon: "palette", category: "Arts" },
      { id: 6, name: "Language", icon: "translate", category: "Education" },
      { id: 7, name: "Crafts", icon: "build", category: "Hobbies" },
      { id: 8, name: "Finance", icon: "account_balance", category: "Business" },
      { id: 9, name: "Art", icon: "brush", category: "Arts" },
      { id: 10, name: "Mentoring", icon: "people", category: "Professional" },
    ];
    
    res.json(skills);
  });

  const httpServer = createServer(app);

  return httpServer;
}
