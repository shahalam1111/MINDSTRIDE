
"use client";

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { aiChatbotAssistant, type AIChatbotAssistantInput } from '@/ai/flows/ai-chatbot-assistant';
import type { InitialIntakeAnalyzerOutput } from '@/ai/flows/initial-intake-analyzer'; 
import { Send, Loader2, ShieldAlert, Info } from 'lucide-react';
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

// Define a more comprehensive type for the intake data stored in localStorage
interface StoredIntakeData {
  // This should align with IntakeFormValues from intake/page.tsx
  // and be used to populate AIChatbotAssistantInput
  fullName?: string;
  age?: number;
  gender?: string;
  city?: string;
  timezone?: string;
  diagnosisHistory?: string;
  diagnoses?: string[];
  otherDiagnosis?: string;
  currentTreatment?: string;
  sleepPatterns_original?: number;
  exerciseFrequency_original?: string;
  substanceUse_original?: string;
  currentStressLevel_original?: number;
  todayMood_original_emoji?: string;
  frequentEmotions?: string[];
  supportAreas?: string[];
  contentPreferences?: string[];
  checkInFrequency?: string;
  preferredTime?: string;
  additionalInformation?: string;

  // New Q1-Q20 fields
  sadnessFrequencyWeekly?: number;
  panicAttackFrequency?: string;
  moodTodayDetailed?: string;
  otherMoodToday?: string;
  hopelessPastTwoWeeks?: string;
  hopelessDescription?: string;
  currentWorryIntensity?: number;
  averageSleepHoursNightly?: string;
  appetiteChanges?: string;
  socialAvoidanceFrequency?: number; // 1-5 scale
  repetitiveBehaviors?: string;
  repetitiveBehaviorsDescription?: string;
  exerciseFrequencyDetailed?: string;
  physicalSymptomsFrequency?: number; // 1-5 scale
  substanceUseCoping?: string;
  workSchoolStressLevel?: number;
  concentrationDifficultyFrequency?: number; // 1-5 scale
  recurringNegativeThoughts?: string;
  negativeThoughtsDescription?: string;
  overwhelmedByTasksFrequency?: number; // 1-5 scale
  hopefulnessFuture?: number;
  mentalHealthMedication?: string;
  medicationDetails?: string;
  socialSupportAvailability?: string;
  recentLifeChanges?: string;
  lifeChangesDescription?: string;
  // location will be derived from city + timezone
}


const WELCOME_MESSAGE_ID = "ai-welcome-message";
const LAST_AI_CHAT_ACTIVITY_KEY = 'wellspringUserLastAiChatActivity';
const AI_CHAT_HISTORY_KEY = 'wellspringUserAiChatHistory';
const MAX_AI_HISTORY_LENGTH = 20;
const INTAKE_ANALYSIS_LS_KEY = 'wellspringIntakeAnalysisResults'; // Stores InitialIntakeAnalyzerOutput (JSON report)
const INTAKE_DATA_LS_KEY = 'wellspringUserIntakeData'; // Stores raw form values (StoredIntakeData)
const SCALE_1_5_LABELS_FOR_CHAT: Record<number, string> = { 1: "Never", 2: "Rarely", 3: "Sometimes", 4: "Often", 5: "Always" };


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
  
  const subHeadingMatch = trimmedLine.match(/^\s*\*\*(.+?)\*\*\s*$/); // For **Key Mental Health Observations:**
  if (subHeadingMatch && !trimmedLine.includes(':')) { // Avoid matching field labels
    const text = subHeadingMatch[1];
     return (
      <h4 className="text-md font-semibold mt-2 mb-1 text-primary">{text}</h4>
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
          const report: InitialIntakeAnalyzerOutput = JSON.parse(analysisResultsString);
          let analysisMessage = "I've reviewed the insights from your recent intake form. Here's a brief summary:\n\n";
          
          if (report.mentalHealthConcerns && report.mentalHealthConcerns.length > 0) {
            analysisMessage += "**Key Mental Health Observations:**\n";
            report.mentalHealthConcerns.slice(0, 3).forEach(concern => { // Show top 3 concerns
                analysisMessage += `* ${concern.condition} (Severity: ${concern.severity}). ${concern.details.substring(0,100)}${concern.details.length > 100 ? '...' : ''}\n`;
            });
            analysisMessage += "\n";
          } else {
            analysisMessage += "It looks like there were no major concerns flagged in your intake, which is great! \n\n"
          }

          if (report.recommendations && report.recommendations.length > 0) {
            analysisMessage += "**Some Initial Recommendations For You:**\n";
            // Try to pick one of each type if available, or top few
            const immediateRec = report.recommendations.find(r => r.type === "Immediate");
            const lifestyleRec = report.recommendations.find(r => r.type === "Lifestyle");
            const longtermRec = report.recommendations.find(r => r.type === "Long-term");
            
            let displayedRecs = 0;
            if(immediateRec && displayedRecs < 2) { analysisMessage += `* **${immediateRec.type}:** ${immediateRec.action}\n`; displayedRecs++;}
            if(lifestyleRec && displayedRecs < 2) { analysisMessage += `* **${lifestyleRec.type}:** ${lifestyleRec.action}\n`; displayedRecs++;}
            if(longtermRec && displayedRecs < 2) { analysisMessage += `* **${longtermRec.type}:** ${longtermRec.action}\n`; displayedRecs++;}
            
            if(displayedRecs === 0) { // Fallback if specific types not found
                 report.recommendations.slice(0, 2).forEach(rec => analysisMessage += `* **${rec.type}:** ${rec.action}\n`);
            }
            analysisMessage += "\n";
          }

          if (report.moodTrend && report.moodTrend.summary && report.moodTrend.summary !== "No historical data available.") {
              analysisMessage += `**Regarding Your Mood Trend:** ${report.moodTrend.summary}\n\n`;
          }
          
          analysisMessage += "This is just a starting point. How does this summary resonate with you, or what's specifically on your mind that you'd like to discuss today?";
          initialAiText = analysisMessage;
          newWelcomeMessageId = `ai-welcome-analyzed-${Date.now()}`; 
          localStorage.removeItem(INTAKE_ANALYSIS_LS_KEY); // Clear after displaying
        } catch (e) {
          console.error("Error parsing intake analysis (JSON report) for chat dialog", e);
          initialAiText = "I had a bit of trouble processing the full details from your intake, but I'm here to help. How are you feeling today?";
        }
      }

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // Removed messages from dependency array to prevent re-triggering on message send


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
      const storedIntakeDataString = localStorage.getItem(INTAKE_DATA_LS_KEY); // Use raw intake data for chat context
      
      if (storedIntakeDataString) {
        const parsedIntakeData: StoredIntakeData = JSON.parse(storedIntakeDataString);
        
        const formatArrayToString = (value: string[] | string | undefined): string | undefined => {
            if (Array.isArray(value)) return value.join(', ');
            return value;
        };

        const mapScaleToString = (value: number | undefined, scaleLabels: Record<number,string>): string | undefined => {
            if (value === undefined || !(value in scaleLabels)) return undefined;
            return scaleLabels[value];
        }

        // Populate context for AI Chatbot using StoredIntakeData (raw form values)
        intakeDataForAIChat = {
          name: parsedIntakeData.fullName,
          age: parsedIntakeData.age,
          gender: parsedIntakeData.gender,
          location: parsedIntakeData.city && parsedIntakeData.timezone ? `${parsedIntakeData.city}, ${parsedIntakeData.timezone}` : undefined,
          diagnosisHistory: parsedIntakeData.diagnosisHistory,
          diagnoses: formatArrayToString(parsedIntakeData.diagnoses),
          currentTreatment: parsedIntakeData.currentTreatment,
          sleepPatterns: parsedIntakeData.sleepPatterns_original,
          exerciseFrequency: parsedIntakeData.exerciseFrequency_original,
          substanceUse: parsedIntakeData.substanceUse_original,
          currentStressLevel: parsedIntakeData.currentStressLevel_original,
          todayMood: parsedIntakeData.todayMood_original_emoji,
          frequentEmotions: formatArrayToString(parsedIntakeData.frequentEmotions),
          supportAreas: formatArrayToString(parsedIntakeData.supportAreas),
          contentPreferences: formatArrayToString(parsedIntakeData.contentPreferences),
          additionalInformation: parsedIntakeData.additionalInformation,

          // New Q1-Q20 fields from StoredIntakeData
          sadnessFrequencyWeekly: parsedIntakeData.sadnessFrequencyWeekly,
          panicAttackFrequency: parsedIntakeData.panicAttackFrequency,
          moodTodayDetailed: parsedIntakeData.moodTodayDetailed === 'Other' ? parsedIntakeData.otherMoodToday : parsedIntakeData.moodTodayDetailed,
          otherMoodToday: parsedIntakeData.otherMoodToday, // Kept for completeness but moodTodayDetailed is combined
          hopelessPastTwoWeeks: parsedIntakeData.hopelessPastTwoWeeks,
          hopelessDescription: parsedIntakeData.hopelessDescription,
          currentWorryIntensity: parsedIntakeData.currentWorryIntensity,
          averageSleepHoursNightly: parsedIntakeData.averageSleepHoursNightly,
          appetiteChanges: parsedIntakeData.appetiteChanges,
          // For scale-based values passed to chat, convert to string if original schema expects string
          socialAvoidanceFrequency: mapScaleToString(parsedIntakeData.socialAvoidanceFrequency, SCALE_1_5_LABELS_FOR_CHAT) as AIChatbotAssistantInput['socialAvoidanceFrequency'],
          repetitiveBehaviors: parsedIntakeData.repetitiveBehaviors,
          repetitiveBehaviorsDescription: parsedIntakeData.repetitiveBehaviorsDescription,
          exerciseFrequencyDetailed: parsedIntakeData.exerciseFrequencyDetailed,
          physicalSymptomsFrequency: mapScaleToString(parsedIntakeData.physicalSymptomsFrequency, SCALE_1_5_LABELS_FOR_CHAT) as AIChatbotAssistantInput['physicalSymptomsFrequency'],
          substanceUseCoping: parsedIntakeData.substanceUseCoping,
          workSchoolStressLevel: parsedIntakeData.workSchoolStressLevel,
          concentrationDifficultyFrequency: mapScaleToString(parsedIntakeData.concentrationDifficultyFrequency, SCALE_1_5_LABELS_FOR_CHAT) as AIChatbotAssistantInput['concentrationDifficultyFrequency'],
          recurringNegativeThoughts: parsedIntakeData.recurringNegativeThoughts,
          negativeThoughtsDescription: parsedIntakeData.negativeThoughtsDescription,
          overwhelmedByTasksFrequency: mapScaleToString(parsedIntakeData.overwhelmedByTasksFrequency, SCALE_1_5_LABELS_FOR_CHAT) as AIChatbotAssistantInput['overwhelmedByTasksFrequency'],
          hopefulnessFuture: parsedIntakeData.hopefulnessFuture,
          mentalHealthMedication: parsedIntakeData.mentalHealthMedication,
          medicationDetails: parsedIntakeData.medicationDetails,
          socialSupportAvailability: parsedIntakeData.socialSupportAvailability,
          recentLifeChanges: parsedIntakeData.recentLifeChanges,
          lifeChangesDescription: parsedIntakeData.lifeChangesDescription,
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
                    className={`max-w-[85%] p-3 rounded-lg shadow-sm ${
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
             {messages.length <= 1 && (messages[0]?.id.startsWith('ai-welcome-analyzed')) && (
                 <div className="p-2 mb-2 border border-blue-200 bg-blue-50 rounded-md text-xs text-blue-700 flex items-start gap-2">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5"/>
                    <span>This is a summary from your intake form. Feel free to discuss any part of it, or tell me what's on your mind now.</span>
                </div>
            )}
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
