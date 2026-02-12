import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getNextQuestion, generateStory } from "./ai";
import { insertStudentSchema, insertConversationSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";

// Use process.cwd() for upload path (works in both dev and production)
const uploadsDir = path.join(process.cwd(), "client/public/uploads");

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, "photo-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Start a new conversation
  app.post("/api/conversations/start", async (req, res) => {
    try {
      const { name, email } = z.object({
        name: z.string(),
        email: z.string().email().optional(),
      }).parse(req.body);

      // Create student
      const student = await storage.createStudent({ name, email: email || null });

      // Get AI's first response based on what the student shared
      const studentFirstMessage = {
        role: "user" as const,
        content: name,
        timestamp: Date.now(),
      };

      // Get a smart AI response instead of a hardcoded greeting
      const aiResponse = await getNextQuestion(name.split(' ')[0] || name, [studentFirstMessage]);
      
      const initialMessage = {
        role: "agent" as const,
        content: aiResponse,
        timestamp: Date.now(),
      };

      const conversation = await storage.createConversation({
        studentId: student.id,
        messages: [studentFirstMessage, initialMessage],
      });

      res.json({ 
        conversationId: conversation.id, 
        studentId: student.id,
        message: initialMessage,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Send a message in the conversation
  app.post("/api/conversations/:id/message", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { content, studentId } = z.object({
        content: z.string(),
        studentId: z.number(),
      }).parse(req.body);

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const student = await storage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Add user message
      const userMessage = {
        role: "user" as const,
        content,
        timestamp: Date.now(),
      };

      const updatedMessages = [...conversation.messages, userMessage];

      // Get AI response
      const aiResponse = await getNextQuestion(student.name, updatedMessages);
      
      const agentMessage = {
        role: "agent" as const,
        content: aiResponse,
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, agentMessage];

      // Update conversation
      await storage.updateConversation(conversationId, {
        messages: finalMessages,
      });

      // Check if conversation is complete (AI indicates it has enough info)
      const isComplete = aiResponse.toLowerCase().includes("i have everything i need") ||
                        aiResponse.toLowerCase().includes("draft a story");

      res.json({ 
        message: agentMessage,
        isComplete,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Generate story from conversation
  app.post("/api/stories/generate/:conversationId", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      if (!conversation.studentId) {
        return res.status(400).json({ error: "No student associated with conversation" });
      }

      const student = await storage.getStudent(conversation.studentId);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Generate story using AI
      const storyContent = await generateStory(student.name, conversation.messages);

      // Create story
      const story = await storage.createStory({
        studentId: student.id,
        content: storyContent,
        photoUrl: null,
        status: "draft",
        isApproved: false,
      });

      // Update conversation with story reference
      await storage.updateConversation(conversationId, {
        storyId: story.id,
        completedAt: new Date(),
      });

      res.json({ story });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update story content
  app.patch("/api/stories/:id", async (req, res) => {
    try {
      const storyId = parseInt(req.params.id);
      const { content } = z.object({
        content: z.string(),
      }).parse(req.body);

      const story = await storage.updateStory(storyId, { content });
      
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }

      res.json({ story });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Publish story
  app.post("/api/stories/:id/publish", async (req, res) => {
    try {
      const storyId = parseInt(req.params.id);

      const story = await storage.updateStory(storyId, { 
        status: "published",
        isApproved: true,
      });

      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }

      res.json({ story });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Upload photo for story
  app.post("/api/stories/:id/photo", upload.single("photo"), async (req, res) => {
    try {
      const storyId = parseInt(req.params.id);
      
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const photoUrl = `/uploads/${req.file.filename}`;

      const story = await storage.updateStory(storyId, { photoUrl });

      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }

      res.json({ story, photoUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
