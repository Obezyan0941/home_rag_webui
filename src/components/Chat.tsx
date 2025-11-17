import remarkGfm from 'remark-gfm';
import ReactMarkdown from "react-markdown";
import { useEffect, useRef, useState } from 'react';
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {materialDark} from "react-syntax-highlighter/dist/esm/styles/prism";

import './Chat.css';
import { ChatInput } from './ChatInput';
import { type Message } from '../scripts/api_calls';
import { useLLMStream } from '../hooks/useLLMStream';


interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  node?: any;
  [key: string]: any;
}

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
  const { streamLLM, isStreaming } = useLLMStream();

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const sendMessage = async() => {
    if(!input.trim()) return;
    
    const userMessage: Message = {id: Math.round(Math.random() * Math.random() * 10000).toString(), role: "user", content: input, timestamp: Date.now()};
    setInput("");
    setisTyping(true);
    setMessages(prev => [...prev, userMessage]);

    let botContent = '';
    const onChunk = (delta: string) => {
        botContent += delta;
        if (botContent) setisTyping(false);
        // throw new Error("Pizda");
        
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return [...prev.slice(0, -1), { ...last, content: botContent }];
          }
          return [...prev, {
            id: Math.round(Math.random() * Math.random() * 10000).toString(),
            role: 'assistant',
            content: botContent,
            timestamp: Date.now(),
          }];
        });
    };

    try {
      await streamLLM(messages, onChunk);
    } catch(error) {
      const error_text = error instanceof Error ? error.message : String(error)
      const error_msg: Message = {
        id: Math.round(Math.random() * Math.random() * 10000).toString(),
        role: "error",
        content: error_text,
        timestamp: Date.now()
      } 
      setMessages(prev => [...prev, error_msg]);
      setisTyping(false);
      console.error(error);
    }
  }

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
            <ReactMarkdown
              children={msg.content}
              remarkPlugins={[remarkGfm]}
              components={{
                code({node, inline, className, children, ...props}: CodeProps) {
                  const match = /language-(\w+)/.exec(className || "")
                  return !inline && match ? (
                    <SyntaxHighlighter
                      children={String(children).replace(/\n$/, "")}  
                      style={materialDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    />
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            />
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
      onSubmit={sendMessage}
      isDisabled={isStreaming}
      isTyping={isTyping}
    />
  </div>
}

export default Chat;