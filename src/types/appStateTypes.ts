
export interface ChatDetails {
  chat_id: string;
  chat_name: string;
  created_at: string;
  last_message_at: string;
  chat_dump: string;
}

export interface AppState {
  chat_list: ChatDetails[]
}

export interface AddChat {
  type: 'ADD_CHAT';
  payload: ChatDetails;
}

export interface RemoveChat {
  type: 'REMOVE_CHAT';
  payload: {chat_id: string};
}

export type AppAction = 
  | AddChat
  | RemoveChat
