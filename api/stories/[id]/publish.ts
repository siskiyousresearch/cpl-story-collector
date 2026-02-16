import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../../_lib/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const storyId = parseInt(req.query.id as string);

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
}
