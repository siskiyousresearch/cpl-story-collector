import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useStory } from "@/lib/story-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, Loader2, ArrowLeft, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Interview() {
  const { 
    messages, 
    setMessages,
    addMessage, 
    studentName, 
    setStudentName,
    studentId,
    setStudentId,
    conversationId,
    setConversationId,
    setStoryId,
    setGeneratedStory 
  } = useStory();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isFirstMessage, setIsFirstMessage] = useState(true);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");

    try {
      // First message: start conversation
      if (isFirstMessage) {
        setStudentName(userMessage);
        addMessage("user", userMessage);
        setIsTyping(true);

        const response = await fetch("/api/conversations/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: userMessage }),
        });

        if (!response.ok) throw new Error("Failed to start conversation");

        const data = await response.json();
        setConversationId(data.conversationId);
        setStudentId(data.studentId);
        addMessage("agent", data.message.content);
        setIsFirstMessage(false);
        setIsTyping(false);
      } else {
        // Continue conversation
        if (!conversationId || !studentId) return;

        addMessage("user", userMessage);
        setIsTyping(true);

        const response = await fetch(`/api/conversations/${conversationId}/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: userMessage, studentId }),
        });

        if (!response.ok) throw new Error("Failed to send message");

        const data = await response.json();
        addMessage("agent", data.message.content);
        setIsTyping(false);

        // If conversation is complete, generate story
        if (data.isComplete) {
          setTimeout(async () => {
            try {
              const storyResponse = await fetch(`/api/stories/generate/${conversationId}`, {
                method: "POST",
              });

              if (!storyResponse.ok) throw new Error("Failed to generate story");

              const storyData = await storyResponse.json();
              setGeneratedStory(storyData.story.content);
              setStoryId(storyData.story.id);
              setLocation("/review");
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to generate story. Please try again.",
                variant: "destructive",
              });
            }
          }, 2000);
        }
      }
    } catch (error) {
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="font-serif font-semibold text-lg">Story Assistant</h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Online
                    </p>
                </div>
            </div>
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${Math.min((messages.length / 10) * 100, 100)}%` }} 
                />
            </div>
        </header>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-4 md:p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`
                            max-w-[85%] rounded-2xl px-5 py-3 shadow-sm text-base leading-relaxed
                            ${msg.role === 'user' 
                                ? 'bg-primary text-primary-foreground rounded-br-none' 
                                : 'bg-white border border-border text-foreground rounded-bl-none'}
                        `}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                    >
                        <div className="bg-white border border-border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1">
                            <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
                        </div>
                    </motion.div>
                )}
                <div ref={scrollRef} />
            </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
            <div className="max-w-2xl mx-auto flex gap-2">
                <Button variant="outline" size="icon" className="shrink-0 rounded-full">
                    <Mic className="h-5 w-5 text-muted-foreground" />
                </Button>
                <Input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your answer..."
                    className="rounded-full border-muted-foreground/20 focus-visible:ring-primary"
                />
                <Button 
                    onClick={handleSend} 
                    disabled={!input.trim() || isTyping}
                    className="rounded-full w-12 h-12 shrink-0 shadow-md"
                >
                    <Send className="h-5 w-5 ml-0.5" />
                </Button>
            </div>
        </div>
    </div>
  );
}
