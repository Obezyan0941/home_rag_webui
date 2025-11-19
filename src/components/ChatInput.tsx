import React from 'react';
import type { ChatAction, AddUserMessageAction } from '../types/chatTypes';

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  cancelStream: () => void;
  messagesDispatch: React.ActionDispatch<[action: ChatAction]>
  isStreaming?: boolean;
  isTyping?: boolean;
  isError?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  messagesDispatch,
  cancelStream,
  isStreaming = false,
  isTyping = false,
  isError = false,
  placeholder = 'Type a message...'
}: ChatInputProps) {

  const add_user_message = () => {
    const action: AddUserMessageAction = {
      type: 'ADD_USER_MESSAGE',
      payload: {
        input: value
      }
    } 
    messagesDispatch(action)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStreaming && value.trim()) {
      onChange("");
      add_user_message();
    }
  };

  return (
    <form className="input-container" onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={isStreaming}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />

      {isStreaming ? (
        <button
          type="button"
          className="button_stop"
          onClick={cancelStream}
          disabled={isTyping}
        >
          Stop
        </button>
      ) : (
        <button
          type="submit"
          className="button"
          disabled={isStreaming || !value.trim() || isError}
          aria-label={"Send message"}
        >
          Send
        </button>
      )}
    </form>
  );
}