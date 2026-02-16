import {
  type Student,
  type InsertStudent,
  type Story,
  type InsertStory,
  type Conversation,
  type InsertConversation,
  students,
  stories,
  conversations,
} from "../../shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export const storage = {
  // Students
  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const result = await db.insert(students).values(insertStudent).returning();
    return result[0];
  },

  async getStudent(id: number): Promise<Student | undefined> {
    const result = await db.select().from(students).where(eq(students.id, id));
    return result[0];
  },

  // Stories
  async createStory(insertStory: InsertStory): Promise<Story> {
    const result = await db.insert(stories).values(insertStory).returning();
    return result[0];
  },

  async updateStory(id: number, updates: Partial<InsertStory>): Promise<Story | undefined> {
    const result = await db
      .update(stories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(stories.id, id))
      .returning();
    return result[0];
  },

  async getStory(id: number): Promise<Story | undefined> {
    const result = await db.select().from(stories).where(eq(stories.id, id));
    return result[0];
  },

  // Conversations
  async createConversation(data: {
    studentId: number;
    messages: Array<{ role: "agent" | "user"; content: string; timestamp: number }>;
  }): Promise<Conversation> {
    const result = await db
      .insert(conversations)
      .values({
        studentId: data.studentId,
        messages: data.messages,
        storyId: null,
        completedAt: null,
      } as any)
      .returning();
    return result[0];
  },

  async updateConversation(
    id: number,
    updates: Partial<InsertConversation>
  ): Promise<Conversation | undefined> {
    const result = await db
      .update(conversations)
      .set(updates as any)
      .where(eq(conversations.id, id))
      .returning();
    return result[0];
  },

  async getConversation(id: number): Promise<Conversation | undefined> {
    const result = await db.select().from(conversations).where(eq(conversations.id, id));
    return result[0];
  },
};
