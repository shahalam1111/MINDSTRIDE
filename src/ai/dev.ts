import { config } from 'dotenv';
config();

import '@/ai/flows/ai-chatbot-assistant.ts';
import '@/ai/flows/initial-intake-analyzer.ts';
import '@/ai/flows/insight-generator.ts';
import '@/ai/flows/progress-report-generator.ts';
