import { users, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Add some initial users
    const initialUsers: InsertUser[] = [
      {
        username: "priya_sharma",
        password: "$2b$10$5DdJMx9lIKUhpL0JFCYQgOEJgZGWOVJ6.s57aCGxzn5Zix5OXw4NO", // "password123"
        fullName: "Priya Sharma",
        email: "priya.sharma@example.com",
        location: "Mumbai, India",
        skillsToTeach: ["Yoga", "Meditation"],
        skillsToLearn: ["Python", "Web Development"],
      },
      {
        username: "raj_patel",
        password: "$2b$10$5DdJMx9lIKUhpL0JFCYQgOEJgZGWOVJ6.s57aCGxzn5Zix5OXw4NO", // "password123"
        fullName: "Raj Patel",
        email: "raj.patel@example.com",
        location: "Bangalore, India",
        skillsToTeach: ["Guitar", "Music Theory"],
        skillsToLearn: ["Digital Marketing", "SEO"],
      },
      {
        username: "ananya_desai",
        password: "$2b$10$5DdJMx9lIKUhpL0JFCYQgOEJgZGWOVJ6.s57aCGxzn5Zix5OXw4NO", // "password123"
        fullName: "Ananya Desai",
        email: "ananya.desai@example.com",
        location: "Delhi, India",
        skillsToTeach: ["Cooking", "Baking"],
        skillsToLearn: ["Photography", "Video Editing"],
      },
    ];
    
    initialUsers.forEach(user => {
      this.createUser(user);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
