import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Message = {
  role: "agent" | "user";
  content: string;
  timestamp: number;
};

const INTERVIEW_SYSTEM_PROMPT = `You are a compassionate interviewer collecting stories about Credit for Prior Learning (CPL) at a community college. Students receiving this interview have just been awarded CPL credits. Your goal is to capture their CPL journey for an inspiring success story.

CONTEXT: CPL (Credit for Prior Learning) allows students to earn college credits for knowledge and skills gained through work experience, military service, certifications, or other life experiences. This saves students time and tuition.

CONVERSATION FLOW:
1. If they just gave their name, warmly greet them and immediately ask about their CPL experience: "What prior experience did you receive credit for, and how did that feel?"
2. Ask about their background - what work/life experience led to receiving CPL credits
3. Ask how CPL has impacted their educational journey (time saved, money saved, motivation)
4. Ask about any challenges they faced before discovering CPL
5. Ask what advice they'd give to other students with prior experience

IMPORTANT RULES:
- NEVER repeat or echo back what the student just said
- Focus SPECIFICALLY on their CPL experience - this is the main topic
- Ask about their prior learning that qualified for credit (work, military, certifications, etc.)
- Keep it conversational and warm, but stay focused on CPL
- After gathering: name, what experience earned credit, impact of CPL, and advice - you have enough

Example:
- User: "John Smith"
- Good: "Hi John! Congratulations on earning your CPL credits! I'd love to hear your story. What prior experience or learning did you receive credit for?"
- Bad: "Nice to meet you John Smith! What program are you studying?"

When you have enough information, say: "Thanks so much for sharing your story with me. I have everything I need! I'm going to draft a story for you to review now."`;

export async function getNextQuestion(
  studentName: string,
  conversationHistory: Message[]
): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: INTERVIEW_SYSTEM_PROMPT },
  ];

  for (const msg of conversationHistory) {
    messages.push({
      role: msg.role === "agent" ? "assistant" : "user",
      content: msg.content,
    });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error("OpenAI returned empty content:", JSON.stringify(response));
      return `Nice to meet you, ${studentName}! What program or major are you currently studying, and what drew you to this path?`;
    }
    return content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    return `Nice to meet you, ${studentName}! What program or major are you currently studying, and what drew you to this path?`;
  }
}

export async function generateStory(
  studentName: string,
  conversationHistory: Message[]
): Promise<string> {
  const transcript = conversationHistory
    .map((msg) => `${msg.role === "agent" ? "Interviewer" : studentName}: ${msg.content}`)
    .join("\n\n");

  const prompt = `Based on this interview with ${studentName}, write a compelling ~150-word CPL (Credit for Prior Learning) success story in third person. The story should:
- Highlight what prior experience earned them college credit (work, military, certifications, etc.)
- Describe how CPL impacted their educational journey (time saved, money saved, renewed motivation)
- Mention any challenges they faced before discovering CPL
- Include their advice for other students with prior experience
- Be inspiring and authentic
- Use their own words where powerful

Interview transcript:
${transcript}

Write the CPL success story now:`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a skilled writer who creates authentic, inspiring student success stories." },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || "Unable to generate story. Please try again.";
  } catch (error) {
    console.error("OpenAI story generation error:", error);
    throw new Error("Failed to generate story");
  }
}
