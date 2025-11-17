
export interface ApiResponse {
    response_text: string;
    response_json: Record<string, unknown>;
    success: boolean;
}

export type ChatMessageRole = 'user' | 'assistant' | 'system' | 'error';

export interface Message {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: number;
}

export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
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

export async function OpenAIGenerateRequest(request: OpenAIRequestInterface): Promise<ChatCompletionResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          ...(request.openai_api_key ? { 'Authorization': `Bearer ${request.openai_api_key}` } : {})
      },
      body: JSON.stringify(request.chat_completion_request),
      signal: controller.signal,
  };

  try {
      const response = await fetch(`${request.openai_base_url}/chat/completions`, requestOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: ChatCompletionResponse = await response.json();
      return data;
  }
      
  catch (error) {
    clearTimeout(timeoutId);
    console.error(error);
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
}

export interface StreamOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export async function* OpenAIStreamRequest(
  request: OpenAIRequestInterface,
  options: StreamOptions = {}
): AsyncGenerator<string, void, unknown> {
  const {
    signal: externalSignal,
    timeoutMs = 60_000
  } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  const signal = externalSignal 
    ? AbortSignal.any([externalSignal, controller.signal])
    : controller.signal;

  const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          ...(request.openai_api_key ? { 'Authorization': `Bearer ${request.openai_api_key}` } : {})
      },
      body: JSON.stringify(request.chat_completion_request),
      signal: signal,
  };
  try {
    const response = await fetch(`${request.openai_base_url}/chat/completions`, requestOptions);

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: Error fetching ${request.openai_base_url}/chat/completions:\n ${errorText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          buffer += decoder.decode()
          break
        } 
      
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();

            if (jsonStr === '[DONE]') {
              return;
            }

            try {
              const chunk: ChatCompletionChunk = JSON.parse(jsonStr);
              const content = chunk.choices[0]?.delta?.content;

              if (typeof content === 'string' && content.length > 0) {
                yield content;
              }
            } catch (e) {
              console.warn('Failed to parse chunk:', jsonStr);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Stream cancelled or timed out');
    }
    throw err;
  }
}
