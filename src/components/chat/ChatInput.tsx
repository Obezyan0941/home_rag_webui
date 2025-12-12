import React from 'react';

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  cancelStream: () => void;
  onSubmit: (a: string) => void;
  isStreaming?: boolean;
  isTyping?: boolean;
  isError?: boolean;
  placeholder?: string;
  prefix: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  cancelStream,
  isStreaming = false,
  isTyping = false,
  isError = false,
  placeholder = 'Type a message...',
  prefix = ''
}: ChatInputProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStreaming && value.trim()) {
      onChange("");
      onSubmit(value);
    }
  };

  return (
    <form className={`input-container${prefix}`} onSubmit={handleSubmit}>
      <input
        className="chat-input"
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
          className="button_submit"
          disabled={isStreaming || !value.trim() || isError}
          aria-label={"Send message"}
        >
          Send
        </button>
      )}
    </form>
  );
}