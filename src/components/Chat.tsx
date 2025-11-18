import { useEffect, useRef, useState, useReducer } from 'react';

import './Chat.css';
import { ChatInput } from './ChatInput';
import sendMessage from '../scripts/send_message';
import { useLLMStream } from '../hooks/useLLMStream';
import ChatMessageContainer from "./ChatMessageContainer";
import type { Message, ChatAction, ChatState } from '../types/chatTypes';


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

function chatReducer(state: ChatState, action: ChatAction) {
  switch (action.type) {
    case "ADD_USER_MESSAGE" : {
      const userMessage: Message = {
        id: Math.round(Math.random() * Math.random() * 10000).toString(),
        role: "user",
        content: action.payload.input,
        timestamp: Date.now()
      };
      return {
        ...state,
        messages: [...state.messages, userMessage],
        isError: false
      };
    }
    case "ADD_ASSISTANT_MESSAGE" : {
      const lastMessage = state.messages[state.messages.length - 1];

      // if last message from assistant - assistant has already started replying, need to append token
      if (lastMessage?.role !== 'assistant') {   
        const assistantMessage: Message = {
          id: Math.round(Math.random() * Math.random() * 10000).toString(),
          role: 'assistant',
          content: action.payload.token,
          timestamp: Date.now(),
        }
        return {
          ...state,
          messages: [...state.messages, assistantMessage],
          isError: false
        };
      // if there is no assistant message - assistant just started replying, need to create one 
      } else {
        return {
          ...state,
          messages: [...state.messages.slice(0, -1), { ...lastMessage, content: action.payload.token }],
          isError: false
        };
      } 
    }
    case "ADD_ERROR_MESSAGE" : {
      const error_msg: Message = {
        id: Math.round(Math.random() * Math.random() * 10000).toString(),
        role: "error",
        content: action.payload.errorMsg,
        timestamp: Date.now()
      } 
      return {
        ...state,
        messages: [...state.messages, error_msg],
        isError: true
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${(action as any).type}`);
    }
  }
}

function Chat() {
  const [chatState, chatDispatch] = useReducer(chatReducer, {messages: DEFAULT_MESSAGES, isError: false});
  const [input, setInput] = useState<string>("");
  const [isTyping, setisTyping] = useState<boolean>(false);
  const [darkTheme, setDarkTheme] = useState<boolean>(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { streamLLM, cancelStream, isStreaming } = useLLMStream();

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  const sendMessagePartial = () => 
    sendMessage(input, chatState.messages, setInput, setisTyping, chatDispatch, streamLLM);

  useEffect(scrollToBottom, [chatState.messages])

  return <div className={`chat-container ${darkTheme ? "dark-theme" : " "}`}>
    <div className='glassy-transparent'>
      <button className="darkBtn" onClick={() => setDarkTheme(!darkTheme)}>
        {!darkTheme ? "🌙 Dark" : "☀️ Light"}
      </button>
    </div>

    <div className="messages">
      {chatState.messages.map((msg) => (
        <ChatMessageContainer key={msg.id} message={msg}/>
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
      cancelStream={cancelStream}
      isStreaming={isStreaming}
      isError={chatState.isError}
      isTyping={isTyping}
    />
  </div>
}

export default Chat;