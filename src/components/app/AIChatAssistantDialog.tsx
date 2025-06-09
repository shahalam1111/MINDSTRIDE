
"use client";

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { aiChatbotAssistant, type AIChatbotAssistantInput } from '@/ai/flows/ai-chatbot-assistant';
import { Send, Loader2, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { EmergencySupportDialog } from '@/components/app/emergency-support-dialog';

interface AIChatAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface AiChatHistoryEntry {
  text: string;
  timestamp: string; // ISO string
}

const WELCOME_MESSAGE_ID = "ai-welcome-message";
const LAST_AI_CHAT_ACTIVITY_KEY = 'wellspringUserLastAiChatActivity';
const AI_CHAT_HISTORY_KEY = 'wellspringUserAiChatHistory';
const MAX_AI_HISTORY_LENGTH = 20;

export function AIChatAssistantDialog({ open, onOpenChange }: AIChatAssistantDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: WELCOME_MESSAGE_ID,
          sender: 'ai',
          text: "Hello! I'm your MINDSTRIDE AI Assistant. How can I help you today?",
          timestamp: new Date(),
        }
      ]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmitMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { 
      id: Date.now().toString(), 
      sender: 'user', 
      text: inputValue.trim(),
      timestamp: new Date() 
    };
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
          diagnoses: Array.isArray(parsedIntakeData.diagnoses) ? parsedIntakeData.diagnoses.join(', ') : parsedIntakeData.diagnoses,
          currentTreatment: parsedIntakeData.currentTreatment,
          sleepPatterns: parsedIntakeData.sleepPatterns,
          exerciseFrequency: parsedIntakeData.exerciseFrequency,
          substanceUse: parsedIntakeData.substanceUse,
          currentStressLevel: parsedIntakeData.currentStressLevel,
          todayMood: parsedIntakeData.todayMood,
          frequentEmotions: Array.isArray(parsedIntakeData.frequentEmotions) ? parsedIntakeData.frequentEmotions.join(', ') : parsedIntakeData.frequentEmotions,
          supportAreas: Array.isArray(parsedIntakeData.supportAreas) ? parsedIntakeData.supportAreas.join(', ') : parsedIntakeData.supportAreas,
          contentPreferences: Array.isArray(parsedIntakeData.contentPreferences) ? parsedIntakeData.contentPreferences.join(', ') : parsedIntakeData.contentPreferences,
        };
      }
      
      const aiInput: AIChatbotAssistantInput = {
        message: userMessage.text,
        ...intakeData,
      };

      const aiResponse = await aiChatbotAssistant(aiInput);
      const aiMessageTimestamp = new Date();
      const aiMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: 'ai', 
        text: aiResponse.response,
        timestamp: aiMessageTimestamp
      };
      setMessages(prev => [...prev, aiMessage]);

      const aiMessageActivity: AiChatHistoryEntry = {
        text: aiResponse.response,
        timestamp: aiMessageTimestamp.toISOString(),
      };

      // Save last AI message for dashboard recent activity feed
      localStorage.setItem(LAST_AI_CHAT_ACTIVITY_KEY, JSON.stringify(aiMessageActivity));

      // Save to AI chat history for the "All Activity" page
      const existingHistoryString = localStorage.getItem(AI_CHAT_HISTORY_KEY);
      let existingHistory: AiChatHistoryEntry[] = existingHistoryString ? JSON.parse(existingHistoryString) : [];
      existingHistory.unshift(aiMessageActivity); // Add to the beginning
      if (existingHistory.length > MAX_AI_HISTORY_LENGTH) {
        existingHistory = existingHistory.slice(0, MAX_AI_HISTORY_LENGTH);
      }
      localStorage.setItem(AI_CHAT_HISTORY_KEY, JSON.stringify(existingHistory));


    } catch (error) {
      console.error("Failed to get AI response:", error);
      toast({
        title: "Error",
        description: "Couldn't connect to the AI assistant. Please try again later.",
        variant: "destructive",
      });
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now().toString(), 
        sender: 'ai', 
        text: "Sorry, I encountered an error and couldn't respond. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-11/12 max-w-4xl h-[85vh] flex flex-col p-0">
          <DialogHeader className="p-4 pb-2 border-b flex flex-row justify-between items-center">
            <div>
              <DialogTitle className="text-xl font-headline">AI Chat Assistant</DialogTitle>
              <DialogDescription className="text-xs">
                Your AI companion for support and insights.
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsEmergencyDialogOpen(true)}>
              <ShieldAlert className="h-4 w-4 mr-1.5 text-destructive" />
              Crisis Help
            </Button>
          </DialogHeader>
          
          <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted text-muted-foreground rounded-bl-none'
                    }`}
                  >
                    {/* Basic Markdown-like rendering for bullet points */}
                    {msg.text.split('\n').map((line, index) => (
                        <p key={index} className={line.trim().startsWith('* ') || line.trim().startsWith('- ') ? 'ml-4' : ''}>
                            {line.trim().startsWith('* ') || line.trim().startsWith('- ') ? `• ${line.substring(line.indexOf(' ') + 1)}` : line}
                        </p>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground/70 mt-1 px-1">
                    {format(msg.timestamp, 'p')}
                  </span>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start">
                  <div className="max-w-[75%] p-3 rounded-lg shadow-sm bg-muted text-muted-foreground rounded-bl-none flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 pt-2 border-t flex-col space-y-2">
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
                aria-label="Chat message input"
              />
              <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} aria-label="Send message">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center px-2">
              AI responses are for informational purposes and not a substitute for professional advice. If you are in crisis, please use the Crisis Help button or contact emergency services.
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <EmergencySupportDialog open={isEmergencyDialogOpen} onOpenChange={setIsEmergencyDialogOpen} />
    </>
  );
}
