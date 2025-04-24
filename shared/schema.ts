import { pgTable, text, serial, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  location: text("location"),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  skillName: varchar("skill_name", { length: 100 }).notNull(),
  skillType: varchar("skill_type", { length: 20 }).notNull(), // "teach" or "learn"
  description: text("description"),
});

export const insertUserSchema = createInsertSchema(users);
export const insertSkillSchema = createInsertSchema(skills);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type User = typeof users.$inferSelect;
export type Skill = typeof skills.$inferSelect;
