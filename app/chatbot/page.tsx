"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Activity, Dumbbell, HeartPulse, Salad } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function NeonFitChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "**Welcome to NeonFit!** 💙\n\nI'm your AI health and fitness assistant. Ask me about:\n- 🏋️‍♂️ Workout plans\n- 🥗 Nutrition advice\n- 🩺 General wellness\n- 📊 Progress tracking",
        timestamp: new Date(),
      }]);
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    try {
      // Add user message immediately
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          stream: false // Disable streaming for simplicity
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response');
      }

      const data = await response.json();
      const aiMessage: Message = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages([...updatedMessages, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "⚠️ Sorry, I'm having trouble responding. Please try again later.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="glassmorphic border-neon-blue">
      <CardHeader className="border-b border-neon-blue/20">
        <CardTitle className="flex items-center gap-2 neon-text">
          <div className="h-2 w-2 rounded-full bg-neon-blue animate-pulse"></div>
          NeonFit Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Chat messages */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-neon-blue/10 border border-neon-blue/20"
                  : "bg-neon-purple/10 border border-neon-purple/20"
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {msg.role === "assistant" ? (
                    <HeartPulse className="h-4 w-4 text-neon-purple" />
                  ) : (
                    <div className="h-4 w-4 rounded-full bg-neon-blue"></div>
                  )}
                  <span className="text-xs font-medium">
                    {msg.role === "user" ? "You" : "NeonFit"}
                  </span>
                  <span className="text-xs text-white/50">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="prose prose-sm prose-invert">
                  {msg.content.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-neon-purple/10 border border-neon-purple/20 rounded-lg p-3 max-w-[85%]">
                <div className="flex space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-2 w-2 rounded-full bg-neon-purple animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-neon-blue/20 bg-neon-blue/5">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about workouts, nutrition, etc..."
              disabled={isLoading}
              className="bg-black/20 border-neon-blue/50 focus:border-neon-blue flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-neon-blue hover:bg-neon-blue/80"
            >
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </div>
          <div className="flex justify-center gap-4 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInput("Suggest a 30-minute HIIT routine")}
              className="text-xs text-neon-green hover:bg-neon-green/10"
            >
              <Activity className="h-3 w-3 mr-1" /> Workout
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInput("What's a good post-workout meal?")}
              className="text-xs text-neon-purple hover:bg-neon-purple/10"
            >
              <Salad className="h-3 w-3 mr-1" /> Nutrition
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInput("How much protein do I need daily?")}
              className="text-xs text-neon-pink hover:bg-neon-pink/10"
            >
              <Dumbbell className="h-3 w-3 mr-1" /> Fitness
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}