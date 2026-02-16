import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { storage } from "../../_lib/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const storyId = parseInt(req.query.id as string);
    const { content } = z
      .object({
        content: z.string(),
      })
      .parse(req.body);

    const story = await storage.updateStory(storyId, { content });

    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    res.json({ story });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
