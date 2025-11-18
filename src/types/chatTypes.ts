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
  payload: { input: string };
}

export interface AddAssistantMessageAction {
  type: 'ADD_ASSISTANT_MESSAGE';
  payload: { token: string };
}

export interface AddErrorMessageAction {
  type: 'ADD_ERROR_MESSAGE';
  payload: { errorMsg: string };
}

export type ChatAction = 
  | AddUserMessageAction
  | AddAssistantMessageAction
  | AddErrorMessageAction
