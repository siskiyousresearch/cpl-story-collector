import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { storage } from "../../_lib/storage";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET_NAME = "cpl-photos";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const storyId = parseInt(req.query.id as string);

    // Vercel parses multipart form data - get the file from the request body
    // For Vercel serverless, we receive the file as base64 in the request body
    const { file, filename, contentType } = req.body as {
      file: string; // base64 encoded
      filename: string;
      contentType: string;
    };

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const buffer = Buffer.from(file, "base64");

    // Validate file size (5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "File too large. Maximum size is 5MB." });
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = filename.split(".").pop() || "jpg";
    const storagePath = `photo-${uniqueSuffix}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: contentType || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return res.status(500).json({ error: "Failed to upload photo" });
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    const photoUrl = urlData.publicUrl;

    const story = await storage.updateStory(storyId, { photoUrl });

    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    res.json({ story, photoUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
