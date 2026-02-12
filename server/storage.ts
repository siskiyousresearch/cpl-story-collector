import { 
  type User, 
  type InsertUser,
  type Student,
  type InsertStudent,
  type Story,
  type InsertStory,
  type Conversation,
  type InsertConversation,
  users,
  students,
  stories,
  conversations,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq } from "drizzle-orm";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Students
  createStudent(student: InsertStudent): Promise<Student>;
  getStudent(id: number): Promise<Student | undefined>;

  // Stories
  createStory(story: InsertStory): Promise<Story>;
  updateStory(id: number, updates: Partial<InsertStory>): Promise<Story | undefined>;
  getStory(id: number): Promise<Story | undefined>;
  getStoriesByStudent(studentId: number): Promise<Story[]>;

  // Conversations
  createConversation(data: { studentId: number; messages: Array<{ role: "agent" | "user"; content: string; timestamp: number; }> }): Promise<Conversation>;
  updateConversation(id: number, updates: Partial<InsertConversation>): Promise<Conversation | undefined>;
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationByStudent(studentId: number): Promise<Conversation | undefined>;
}

export class DbStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Students
  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const result = await db.insert(students).values(insertStudent).returning();
    return result[0];
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const result = await db.select().from(students).where(eq(students.id, id));
    return result[0];
  }

  // Stories
  async createStory(insertStory: InsertStory): Promise<Story> {
    const result = await db.insert(stories).values(insertStory).returning();
    return result[0];
  }

  async updateStory(id: number, updates: Partial<InsertStory>): Promise<Story | undefined> {
    const result = await db
      .update(stories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(stories.id, id))
      .returning();
    return result[0];
  }

  async getStory(id: number): Promise<Story | undefined> {
    const result = await db.select().from(stories).where(eq(stories.id, id));
    return result[0];
  }

  async getStoriesByStudent(studentId: number): Promise<Story[]> {
    return await db.select().from(stories).where(eq(stories.studentId, studentId));
  }

  // Conversations
  async createConversation(data: { studentId: number; messages: Array<{ role: "agent" | "user"; content: string; timestamp: number; }> }): Promise<Conversation> {
    const result = await db.insert(conversations).values({
      studentId: data.studentId,
      messages: data.messages,
      storyId: null,
      completedAt: null,
    } as any).returning();
    return result[0];
  }

  async updateConversation(id: number, updates: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const result = await db
      .update(conversations)
      .set(updates as any)
      .where(eq(conversations.id, id))
      .returning();
    return result[0];
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const result = await db.select().from(conversations).where(eq(conversations.id, id));
    return result[0];
  }

  async getConversationByStudent(studentId: number): Promise<Conversation | undefined> {
    const result = await db
      .select()
      .from(conversations)
      .where(eq(conversations.studentId, studentId))
      .orderBy(conversations.createdAt)
      .limit(1);
    return result[0];
  }
}

export const storage = new DbStorage();
