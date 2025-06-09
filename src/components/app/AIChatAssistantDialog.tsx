
"use client";

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { aiChatbotAssistant, type AIChatbotAssistantInput } from '@/ai/flows/ai-chatbot-assistant';
import { Send, Loader2 } from 'lucide-react';

interface AIChatAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export function AIChatAssistantDialog({ open, onOpenChange }: AIChatAssistantDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      // Optionally, greet the user or load initial state when dialog opens
      // For now, we just clear previous messages if any, or persist them if desired
      // setMessages([]); // Uncomment to clear messages each time
    }
  }, [open]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmitMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let intakeData: Partial<AIChatbotAssistantInput> = {};
      const storedIntakeData = localStorage.getItem('wellspringUserIntakeData');
      if (storedIntakeData) {
        const parsedIntakeData = JSON.parse(storedIntakeData);
        intakeData = {
          name: parsedIntakeData.fullName,
          age: parsedIntakeData.age,
          gender: parsedIntakeData.gender,
          location: parsedIntakeData.location,
          diagnosisHistory: parsedIntakeData.diagnosisHistory,
          // diagnoses: parsedIntakeData.diagnoses?.join(', '), // Example if flow expected string
          currentTreatment: parsedIntakeData.currentTreatment,
          sleepPatterns: parsedIntakeData.sleepPatterns,
          exerciseFrequency: parsedIntakeData.exerciseFrequency,
          substanceUse: parsedIntakeData.substanceUse,
          currentStressLevel: parsedIntakeData.currentStressLevel,
          todayMood: parsedIntakeData.todayMood,
          frequentEmotions: parsedIntakeData.frequentEmotions?.join(', '),
          supportAreas: parsedIntakeData.supportAreas?.join(', '),
          contentPreferences: parsedIntakeData.contentPreferences?.join(', '),
        };
      }
      
      const aiInput: AIChatbotAssistantInput = {
        message: userMessage.text,
        ...intakeData,
      };

      const aiResponse = await aiChatbotAssistant(aiInput);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: aiResponse.response };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Failed to get AI response:", error);
      toast({
        title: "Error",
        description: "Couldn't connect to the AI assistant. Please try again later.",
        variant: "destructive",
      });
      // Optionally add the error message back to input or a system message
      // setMessages(prev => [...prev, {id: 'error', sender: 'ai', text: "Sorry, I couldn't respond right now."}]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] md:max-w-[600px] lg:max-w-[700px] h-[70vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-2xl font-headline">AI Chat Assistant</DialogTitle>
          <DialogDescription>
            Talk to your AI assistant for support, insights, or just a friendly chat.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow p-6" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg shadow ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg shadow bg-muted text-muted-foreground flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Thinking...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-2 border-t">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSubmitMessage(); }}
            className="flex w-full items-center space-x-2"
          >
            <Input
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-grow"
            />
            <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
