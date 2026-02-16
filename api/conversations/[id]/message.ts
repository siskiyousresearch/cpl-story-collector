import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { storage } from "../../_lib/storage";
import { getNextQuestion } from "../../_lib/ai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const conversationId = parseInt(req.query.id as string);
    const { content, studentId } = z
      .object({
        content: z.string(),
        studentId: z.number(),
      })
      .parse(req.body);

    const conversation = await storage.getConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const student = await storage.getStudent(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const userMessage = {
      role: "user" as const,
      content,
      timestamp: Date.now(),
    };

    const updatedMessages = [...conversation.messages, userMessage];

    const aiResponse = await getNextQuestion(student.name, updatedMessages);

    const agentMessage = {
      role: "agent" as const,
      content: aiResponse,
      timestamp: Date.now(),
    };

    const finalMessages = [...updatedMessages, agentMessage];

    await storage.updateConversation(conversationId, {
      messages: finalMessages,
    });

    const isComplete =
      aiResponse.toLowerCase().includes("i have everything i need") ||
      aiResponse.toLowerCase().includes("draft a story");

    res.json({
      message: agentMessage,
      isComplete,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
