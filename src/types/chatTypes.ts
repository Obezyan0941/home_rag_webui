type ChatMessageRole = 'user' | 'assistant' | 'system' | 'error';

export interface Message {
  id: string;
  role: ChatMessageRole;
  content: string;
  created: number;
}

export interface ChatState {
  messages: Message[];
  isError: boolean;
  chat_id: string;
}

export interface SetMessagesAction {
  type: 'SET_MESSAGES';
  payload: { messages: Message[] };
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

export interface EditMessageAction {
  type: 'EDIT_MESSAGE';
  payload: { msg_id: string, new_content: string, role: ChatMessageRole };
}

export type ChatAction = 
  | SetMessagesAction
  | AddUserMessageAction
  | AddAssistantMessageAction
  | AddErrorMessageAction
  | DeleteMessageAction
  | EditMessageAction