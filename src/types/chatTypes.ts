type ChatMessageRole = 'user' | 'assistant' | 'system' | 'error';

export interface Message {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isError: boolean;
}

export interface AddUserMessageAction {
  type: 'ADD_USER_MESSAGE';
  payload: { input?: string, composed_message?: Message };
}

export interface AddAssistantMessageAction {
  type: 'ADD_ASSISTANT_MESSAGE';
  payload: { token: string };
}

export interface AddErrorMessageAction {
  type: 'ADD_ERROR_MESSAGE';
  payload: { errorMsg: string };
}

export interface DeleteMessageAction {
  type: 'DELETE_MESSAGE';
  payload: { msg_id: string };
}

export type ChatAction = 
  | AddUserMessageAction
  | AddAssistantMessageAction
  | AddErrorMessageAction
  | DeleteMessageAction

export interface ChatDetails {
  chat_id: string;
  chat_name: string;
  created_at: string;
  last_message_at: string;
  chat_dump: string;
}
