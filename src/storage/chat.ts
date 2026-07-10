/**
 * Storage layer cho BIRA chat history.
 * Lưu tin nhắn theo session_id vào AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get_id, inserted_at } from '@/utils/string';

export interface chat_message_type {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  is_error?: boolean;
}

const SESSION_PREFIX = 'bira_messages_';

export async function load_messages(session_id: string): Promise<chat_message_type[]> {
  const raw = await AsyncStorage.getItem(`${SESSION_PREFIX}${session_id}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as chat_message_type[];
  } catch {
    return [];
  }
}

export async function save_messages(
  session_id: string,
  messages: chat_message_type[],
): Promise<void> {
  await AsyncStorage.setItem(
    `${SESSION_PREFIX}${session_id}`,
    JSON.stringify(messages),
  );
}

export async function clear_messages(session_id: string): Promise<void> {
  await AsyncStorage.removeItem(`${SESSION_PREFIX}${session_id}`);
}

export function create_user_message(text: string): chat_message_type {
  return {
    id: get_id(),
    text,
    sender: 'user',
    timestamp: inserted_at(),
  };
}

export function create_bot_message(text: string, is_error = false): chat_message_type {
  return {
    id: get_id(),
    text,
    sender: 'bot',
    timestamp: inserted_at(),
    is_error,
  };
}
