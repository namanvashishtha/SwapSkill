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
export type User = z.infer<typeof userSchema>;
export type Skill = z.infer<typeof skillSchema>;
