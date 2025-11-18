import MarkdownRenderer from './MarkdownRenderer';
import { useEffect, useRef, useState } from 'react';

import './Chat.css';
import sendMessage from '../scripts/send_message';
import { ChatInput } from './ChatInput';
import { type Message } from '../scripts/types';
import { useLLMStream } from '../hooks/useLLMStream';


const DEFAULT_MESSAGES: Message[] = [
  {
    id: Math.round(Math.random() * Math.random() * 10000).toString(),
    role: 'user',
    content: "Как открыть калькулятор?",
    timestamp: Date.now()
  },
  {
    id: Math.round(Math.random() * Math.random() * 10000).toString(),
    role: 'assistant',
    content: "А никак нахуй",
    timestamp: Date.now()
  },
  {
    id: Math.round(Math.random() * Math.random() * 10000).toString(),
    role: 'user',
    content: "Охуел?",
    timestamp: Date.now()
  },
  {
    id: Math.round(Math.random() * Math.random() * 10000).toString(),
    role: 'assistant',
    content: "Thinking for 1m 1s\nНет.",
    timestamp: Date.now()
  },
];

function Chat() {
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES);
  const [input, setInput] = useState<string>("");
  const [isTyping, setisTyping] = useState<boolean>(false);
  const [darkTheme, setDarkTheme] = useState<boolean>(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { streamLLM, cancelStream, isStreaming } = useLLMStream();

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  const sendMessagePartial = () => 
    sendMessage(input, messages, setInput, setisTyping, setMessages, streamLLM);

  useEffect(scrollToBottom, [messages])

  return <div className={`chat-container ${darkTheme ? "dark-theme" : " "}`}>
    <div className='glassy-transparent'>
      <button className="darkBtn" onClick={() => setDarkTheme(!darkTheme)}>
        {!darkTheme ? "🌙 Dark" : "☀️ Light"}
      </button>
    </div>

    <div className="messages">
      {messages.map((msg) => (
        <div key={msg.id} className={`message-container ${msg.role}`}>
          <div className={`message ${msg.role}`}>
            <MarkdownRenderer content={msg.content} />
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="message-container assistant">
          <div className="message assistant">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
      <div ref={messageEndRef}></div>
      
    </div>

    <ChatInput
      value={input}
      onChange={(e: string) => setInput(e)}
      onSubmit={sendMessagePartial}
      isDisabled={isStreaming}
      isTyping={isTyping}
    />
  </div>
}

export default Chat;