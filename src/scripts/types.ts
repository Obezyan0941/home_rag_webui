import { type ChatDetails } from "../types/appStateTypes";

export interface ApiResponse {
    response_text: string;
    response_json: Record<string, unknown>;
    success: boolean;
}

export type ChatMessageRole = 'user' | 'assistant' | 'system' | 'error';

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  created: number;
}

export interface ChatCompletionDelta {
  role: string;
  content: string;
}

export interface ChatCompletionChunkChoice {
  index: number;
  delta: ChatCompletionDelta;
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'function_call' | null;
}

export interface ChatCompletionChoice {
  index: number;
  message: ChatMessage;
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'function_call' | null;
}

export interface ChatCompletionChunk {
  id: string | number;
  object: 'chat.completion' | 'chat.completion.chunk';
  created: number;
  model: string;
  choices: ChatCompletionChunkChoice[];
  usage?: Record<string, number> | null;
}

export interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage?: Record<string, number> | null;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  chat_id: string;
  user_id: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  presence_penalty?: number;
  frequency_penalty?: number;
}

export interface OpenAIRequestInterface {
  chat_completion_request: ChatCompletionRequest;
  openai_api_key?: string; 
  openai_base_url: string;
}

export interface SignInRequestInterface {
  email: string;
  password: string;
}

export interface SignInResponse {
  success: boolean
  chats: ChatDetails[]
  user_id: string
}

export interface SignUpResponse {
  success: boolean
  user_id: string
}

export interface SetChatRequestInterface {
  user_id: string
  chat_id: string
  chat_dump: string
}

export interface GetChatRequestInterface {
  user_id: string
  chat_id: string
}

export interface DeleteChatRequestInterface {
  user_id: string
  chat_id: string
}

export interface EditChatRequestInterface {
  user_id: string
  chat_id: string
  new_chat_name: string
}

export interface SuccessResponseInterface {
  success: boolean;
  message?: string;
}
