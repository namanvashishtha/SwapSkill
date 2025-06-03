import { z } from "zod";

// Define Zod schemas for validation
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string(),
  fullName: z.string().nullable(),
  email: z.string().nullable(),
  location: z.string().nullable(),
  skillsToTeach: z.array(z.string()).nullable(),
  skillsToLearn: z.array(z.string()).nullable(),
  bio: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
});

export const insertUserSchema = userSchema.omit({ id: true });

export const skillSchema = z.object({
  id: z.number(),
  userId: z.number(),
  skillName: z.string(),
  skillType: z.enum(["teach", "learn"]),
  description: z.string().nullable(),
});

export const insertSkillSchema = skillSchema.omit({ id: true });

// Available skills schema for the skills collection
export const availableSkillSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertAvailableSkillSchema = availableSkillSchema.omit({ id: true, createdAt: true, updatedAt: true });

// Match schema for skill matching system
export const matchSchema = z.object({
  id: z.number(),
  fromUserId: z.number(),
  toUserId: z.number(),
  status: z.enum(["pending", "accepted", "rejected"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertMatchSchema = matchSchema.omit({ id: true, createdAt: true, updatedAt: true });

// Notification schema
export const notificationSchema = z.object({
  id: z.number(),
  userId: z.number(),
  type: z.enum(["match_request", "match_accepted", "message"]),
  title: z.string(),
  message: z.string(),
  isRead: z.boolean(),
  relatedUserId: z.number().optional(),
  relatedMatchId: z.number().optional(),
  createdAt: z.date(),
});

export const insertNotificationSchema = notificationSchema.omit({ id: true, createdAt: true });

// Chat message schema
export const chatMessageSchema = z.object({
  id: z.number(),
  matchId: z.number(),
  senderId: z.number(),
  message: z.string(),
  isRead: z.boolean().default(false),
  createdAt: z.date(),
});

export const insertChatMessageSchema = chatMessageSchema.omit({ id: true, createdAt: true });

// Review schema for user reviews
export const reviewSchema = z.object({
  id: z.number(),
  reviewerId: z.number(),
  revieweeId: z.number(),
  matchId: z.number(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  createdAt: z.date(),
});

export const insertReviewSchema = reviewSchema.omit({ id: true, createdAt: true });

// For compatibility with existing code, we'll keep a users object
export const users = {
  name: "users",
  fields: {
    id: "id",
    username: "username",
    password: "password",
    fullName: "full_name",
    email: "email",
    location: "location",
    skillsToTeach: "skills_to_teach",
    skillsToLearn: "skills_to_learn",
    bio: "bio",
    imageUrl: "image_url",
  },
  $inferSelect: {} as User,
};

export const skills = {
  name: "skills",
  fields: {
    id: "id",
    userId: "user_id",
    skillName: "skill_name",
    skillType: "skill_type",
    description: "description",
  },
  $inferSelect: {} as Skill,
};

export const availableSkills = {
  name: "available_skills",
  fields: {
    id: "id",
    name: "name",
    category: "category",
    description: "description",
    isActive: "is_active",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
  $inferSelect: {} as AvailableSkill,
};

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type InsertAvailableSkill = z.infer<typeof insertAvailableSkillSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type User = z.infer<typeof userSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type AvailableSkill = z.infer<typeof availableSkillSchema>;
export type Match = z.infer<typeof matchSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type Review = z.infer<typeof reviewSchema>;
