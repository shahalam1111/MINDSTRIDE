
"use client";

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { aiChatbotAssistant, type AIChatbotAssistantInput } from '@/ai/flows/ai-chatbot-assistant';
import type { InitialIntakeOutput } from '@/ai/flows/initial-intake-analyzer'; // Import type
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
const INTAKE_ANALYSIS_LS_KEY = 'wellspringIntakeAnalysisResults';


const MarkdownLineRenderer: React.FC<{ line: string }> = ({ line }) => {
  const trimmedLine = line.trimStart(); 

  const processInlineMarkdown = (text: string): ReactNode[] => {
    const parts: ReactNode[] = [];
    let remainingText = text;
    let key = 0;
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(remainingText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(remainingText.substring(lastIndex, match.index));
      }
      const fullMatch = match[0];
      const boldContent = match[2];
      const italicStarContent = match[3];
      const italicUnderscoreContent = match[4];
      if (boldContent) {
        parts.push(<strong className="font-semibold text-foreground" key={`md-${key++}`}>{boldContent}</strong>);
      } else if (italicStarContent) {
        parts.push(<em className="italic" key={`md-${key++}`}>{italicStarContent}</em>);
      } else if (italicUnderscoreContent) {
        parts.push(<em className="italic" key={`md-${key++}`}>{italicUnderscoreContent}</em>);
      }
      lastIndex = match.index + fullMatch.length;
    }
    if (lastIndex < remainingText.length) {
      parts.push(remainingText.substring(lastIndex));
    }
    if (parts.length === 0 && remainingText.length > 0) {
        return [remainingText];
    }
    return parts;
  };

  const headingMatch = trimmedLine.match(/^\s*\*\*(?:(\d+\.\s+))?(.+?):\*\*\s*$/);
  if (headingMatch) {
    const number = headingMatch[1] || ''; 
    const text = headingMatch[2]; 
    return (
      <p className="text-lg font-semibold mt-3 mb-1 text-foreground">
        {number}{text}:
      </p>
    );
  }

  const bulletMatch = trimmedLine.match(/^\s*([*-])\s+(.*)/);
  if (bulletMatch) {
    const content = bulletMatch[2];
    const indentLevel = line.match(/^\s*/)?.[0].length || 0; 
    const marginLeft = Math.min(Math.floor(indentLevel / 2) * 0.5, 2); 
    
    return (
      <div className={`text-muted-foreground flex items-start`} style={{ marginLeft: `${marginLeft}rem` }}>
        <span className="mr-2 text-primary">•</span>
        <span>{processInlineMarkdown(content)}</span>
      </div>
    );
  }
  
  if (trimmedLine) {
    return <p className="text-muted-foreground">{processInlineMarkdown(trimmedLine)}</p>;
  }

  if (line === '') {
    return <p className="h-4"></p>; 
  }

  return null; 
};


export function AIChatAssistantDialog({ open, onOpenChange }: AIChatAssistantDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const analysisResultsString = localStorage.getItem(INTAKE_ANALYSIS_LS_KEY);
      let initialAiText = "Hello! I'm your MINDSTRIDE AI Assistant. How can I help you today?";
      let newWelcomeMessageId = WELCOME_MESSAGE_ID;

      if (analysisResultsString) {
        try {
          const results: InitialIntakeOutput = JSON.parse(analysisResultsString);
          let analysisMessage = "I've reviewed your recent intake information and have some initial thoughts and recommendations based on what you shared:\n\n";
          
          if (results.keyConcerns && results.keyConcerns.length > 0) {
            analysisMessage += "**Key Areas We Could Focus On:**\n";
            results.keyConcerns.forEach(concern => analysisMessage += `* ${concern}\n`);
            analysisMessage += "\n";
          }
          if (results.suggestedSupportNeeds && results.suggestedSupportNeeds.length > 0) {
            analysisMessage += "**Helpful Support Areas:**\n";
            results.suggestedSupportNeeds.forEach(need => analysisMessage += `* ${need}\n`);
            analysisMessage += "\n";
          }
          if (results.personalizedRecommendations && results.personalizedRecommendations.length > 0) {
            analysisMessage += "**Personalized Recommendations to Get Started:**\n";
            results.personalizedRecommendations.forEach(rec => analysisMessage += `* ${rec}\n`);
            analysisMessage += "\n";
          }
          analysisMessage += "How do these initial thoughts resonate with you, or what's on your mind today?";
          initialAiText = analysisMessage;
          newWelcomeMessageId = `ai-welcome-analyzed-${Date.now()}`; // Unique ID for analysis message
          localStorage.removeItem(INTAKE_ANALYSIS_LS_KEY); 
        } catch (e) {
          console.error("Error parsing intake analysis results for chat dialog", e);
        }
      }

      // Update messages if it's the first time opening, or if the initial message needs to change
      if (messages.length === 0 || (messages.length > 0 && messages[0].id !== newWelcomeMessageId && initialAiText !== messages[0].text)) {
           setMessages([
              {
                id: newWelcomeMessageId,
                sender: 'ai',
                text: initialAiText,
                timestamp: new Date(),
              }
            ]);
      }
    }
  }, [open]); // Re-run when dialog opens


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
      let intakeDataForAIChat: Partial<AIChatbotAssistantInput> = {};
      const storedIntakeData = localStorage.getItem('wellspringUserIntakeData');
      if (storedIntakeData) {
        const parsedIntakeData = JSON.parse(storedIntakeData);
        intakeDataForAIChat = {
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
        ...intakeDataForAIChat,
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

      localStorage.setItem(LAST_AI_CHAT_ACTIVITY_KEY, JSON.stringify(aiMessageActivity));
      const existingHistoryString = localStorage.getItem(AI_CHAT_HISTORY_KEY);
      let existingHistory: AiChatHistoryEntry[] = existingHistoryString ? JSON.parse(existingHistoryString) : [];
      existingHistory.unshift(aiMessageActivity); 
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
            <div className="space-y-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col mb-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted text-muted-foreground rounded-bl-none'
                    }`}
                  >
                    {msg.text.split('\n').map((line, index) => (
                      <MarkdownLineRenderer key={`${msg.id}-line-${index}`} line={line} />
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


    