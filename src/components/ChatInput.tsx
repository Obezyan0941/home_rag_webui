import React from 'react';

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isDisabled?: boolean;
  isTyping?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isDisabled = false,
  isTyping = false,
  placeholder = 'Type a message...'
}: ChatInputProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDisabled && value.trim()) {
      onSubmit();
    }
  };

  return (
    <form className="input-container" onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={isDisabled}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />

      {isTyping ? (
        <button
          type="button"
          className="button_stop"
        >
          Stop
        </button>
      ) : (
        <button
          type="submit"
          className="button"
          disabled={isDisabled || !value.trim()}
          aria-label={isDisabled ? "Generating response..." : "Send message"}
        >
          {isDisabled ? "Generating..." : "Send"}
        </button>
      )}
    </form>
  );
}