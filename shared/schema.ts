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
  type: z.enum(["match_request", "match_accepted", "message", "session_proposal"]),
  title: z.string(),
  message: z.string(),
  isRead: z.boolean(),
  relatedUserId: z.number().optional(),
  relatedMatchId: z.number().optional(),
  relatedSessionId: z.number().optional(),
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

// Session schema for scheduled meetups
export const sessionSchema = z.object({
  id: z.number(),
  matchId: z.number(),
  proposerId: z.number(),
  participantId: z.number(),
  title: z.string().optional(),
  scheduledDate: z.date(),
  duration: z.number(), // duration in minutes
  location: z.string().optional(),
  status: z.enum(["proposed", "accepted", "rejected", "completed", "cancelled"]),
  proposedAt: z.date(),
  respondedAt: z.date().optional(),
  reminderSettings: z.object({
    proposerReminder: z.number().optional(), // minutes before session
    participantReminder: z.number().optional(), // minutes before session
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertSessionSchema = sessionSchema.omit({ id: true, createdAt: true, updatedAt: true });

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

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type User = z.infer<typeof userSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Match = z.infer<typeof matchSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Session = z.infer<typeof sessionSchema>;
