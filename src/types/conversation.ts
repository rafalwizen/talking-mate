import type { LanguageCode, ConversationMode, ConversationState } from '@/lib/constants';

export interface Scenario {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  systemPromptAddition: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  language: LanguageCode;
  mode: ConversationMode;
  scenario_id: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export type { LanguageCode, ConversationMode, ConversationState };
