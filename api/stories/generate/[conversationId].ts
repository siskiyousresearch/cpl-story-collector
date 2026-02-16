import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../../_lib/storage";
import { generateStory } from "../../_lib/ai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const conversationId = parseInt(req.query.conversationId as string);

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

    const storyContent = await generateStory(student.name, conversation.messages);

    const story = await storage.createStory({
      studentId: student.id,
      content: storyContent,
      photoUrl: null,
      status: "draft",
      isApproved: false,
    });

    await storage.updateConversation(conversationId, {
      storyId: story.id,
      completedAt: new Date(),
    });

    res.json({ story });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
