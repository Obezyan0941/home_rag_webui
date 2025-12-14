import { useState, useRef, useCallback } from 'react';
import type { Message } from '../types/chatTypes';
import type { OpenAIRequestInterface } from '../scripts/types';
import {
  type StreamOptions,
  OpenAIStreamRequest
} from '../scripts/api_calls';



export const useLLMStream = () => {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const streamLLM = useCallback(
    async (messages: Message[], onChunk: (text: string) => void, chat_id: string, user_id: string) => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setIsStreaming(true);

      try {
        const openai_request_body: OpenAIRequestInterface = {
          chat_completion_request: {
            model: "temp_llm",
            messages: messages,
            chat_id: chat_id,
            user_id: user_id,
            stream: true
          },
          openai_base_url: "http://localhost:1024",
        };
        const stream_options: StreamOptions = {
          signal: abortControllerRef.current.signal,
          timeoutMs: 60_000,
        };

        const generator = OpenAIStreamRequest(openai_request_body, stream_options);

        for await (const chunk of generator) {
          onChunk(chunk);
        }
      } catch (err) {
        if ((err as Error).message !== 'Stream cancelled or timed out') {
          console.error('Streaming error:', err);
        throw err;
        }
      } finally {
        setIsStreaming(false);
      }
    },
    []
  );

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return { streamLLM, cancelStream, isStreaming };
};