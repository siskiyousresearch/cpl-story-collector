import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("cpl_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Students table - stores basic student info
export const students = pgTable("cpl_students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStudentSchema = createInsertSchema(students).omit({ id: true, createdAt: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Stories table - stores the generated stories
export const stories = pgTable("cpl_stories", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id),
  content: text("content").notNull(),
  photoUrl: text("photo_url"),
  status: text("status").notNull().default("draft"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStorySchema = createInsertSchema(stories).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;

// Conversations table - stores the full interview conversation
export const conversations = pgTable("cpl_conversations", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id),
  messages: jsonb("messages").notNull().$type<Array<{
    role: "agent" | "user";
    content: string;
    timestamp: number;
  }>>(),
  storyId: integer("story_id").references(() => stories.id),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({ 
  id: true, 
  createdAt: true 
});
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
