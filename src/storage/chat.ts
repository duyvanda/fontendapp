/**
 * Storage layer cho BIRA chat history.
 * Lưu tin nhắn theo session_id vào AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get_id, inserted_at } from '@/utils/string';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  is_error?: boolean;
}

const SESSION_PREFIX = 'bira_messages_';

export async function loadMessages(session_id: string): Promise<ChatMessage[]> {
  const raw = await AsyncStorage.getItem(`${SESSION_PREFIX}${session_id}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

export async function saveMessages(
  session_id: string,
  messages: ChatMessage[],
): Promise<void> {
  await AsyncStorage.setItem(
    `${SESSION_PREFIX}${session_id}`,
    JSON.stringify(messages),
  );
}

export async function clearMessages(session_id: string): Promise<void> {
  await AsyncStorage.removeItem(`${SESSION_PREFIX}${session_id}`);
}

export function createUserMessage(text: string): ChatMessage {
  return {
    id: get_id(),
    text,
    sender: 'user',
    timestamp: inserted_at(),
  };
}

export function createBotMessage(text: string, is_error = false): ChatMessage {
  return {
    id: get_id(),
    text,
    sender: 'bot',
    timestamp: inserted_at(),
    is_error,
  };
}
