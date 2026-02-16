import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { storage } from "../_lib/storage";
import { getNextQuestion } from "../_lib/ai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email } = z
      .object({
        name: z.string(),
        email: z.string().email().optional(),
      })
      .parse(req.body);

    const student = await storage.createStudent({ name, email: email || null });

    const studentFirstMessage = {
      role: "user" as const,
      content: name,
      timestamp: Date.now(),
    };

    const aiResponse = await getNextQuestion(
      name.split(" ")[0] || name,
      [studentFirstMessage]
    );

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
}
