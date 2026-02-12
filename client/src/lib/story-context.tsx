import React, { createContext, useContext, useState, ReactNode } from "react";

export type Message = {
  id?: string;
  role: "agent" | "user";
  content: string;
  timestamp: number;
};

type StoryContextType = {
  studentName: string;
  setStudentName: (name: string) => void;
  studentId: number | null;
  setStudentId: (id: number) => void;
  conversationId: number | null;
  setConversationId: (id: number) => void;
  storyId: number | null;
  setStoryId: (id: number) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (role: "agent" | "user", content: string) => void;
  generatedStory: string;
  setGeneratedStory: (story: string) => void;
  resetStory: () => void;
};

const StoryContext = createContext<StoryContextType | undefined>(undefined);

const INITIAL_GREETING: Message = {
  role: "agent",
  content: "Hi there! Congratulations on earning your Credit for Prior Learning (CPL) credits! I'd love to capture your story to inspire other students. To get started, what's your full name (first and last)?",
  timestamp: Date.now(),
};

export function StoryProvider({ children }: { children: ReactNode }) {
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState<number | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [storyId, setStoryId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([INITIAL_GREETING]);
  const [generatedStory, setGeneratedStory] = useState("");

  const addMessage = (role: "agent" | "user", content: string) => {
    const newMessage: Message = {
      role,
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const resetStory = () => {
    setStudentName("");
    setStudentId(null);
    setConversationId(null);
    setStoryId(null);
    setMessages([INITIAL_GREETING]);
    setGeneratedStory("");
  };

  return (
    <StoryContext.Provider
      value={{
        studentName,
        setStudentName,
        studentId,
        setStudentId,
        conversationId,
        setConversationId,
        storyId,
        setStoryId,
        messages,
        setMessages,
        addMessage,
        generatedStory,
        setGeneratedStory,
        resetStory,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
}

export function useStory() {
  const context = useContext(StoryContext);
  if (context === undefined) {
    throw new Error("useStory must be used within a StoryProvider");
  }
  return context;
}
