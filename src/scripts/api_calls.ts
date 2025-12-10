import { 
  type OpenAIRequestInterface,
  type ChatCompletionResponse,
  type ChatCompletionChunk,
  type SignInRequestInterface,
  type SignInResponse
 } from "./types";


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

export async function SignInRequest(request: SignInRequestInterface): Promise<SignInResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request),
      signal: controller.signal,
  };

  try {
      const response = await fetch(`http://localhost:1024/signin`, requestOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`HTTP ${response.status}: ${errorText}`);
        request.redirect();
      }

      const data: SignInResponse = await response.json();
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