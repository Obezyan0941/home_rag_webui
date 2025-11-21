import { useEffect, useRef, useState, useReducer } from 'react';

import './Chat.css';
import { ChatInput } from './ChatInput';
import {sendMessages} from '../../scripts/send_message';
import { useLLMStream } from '../../hooks/useLLMStream';
import ChatMessageContainer from "./ChatMessageContainer";
import type { Message, ChatAction, ChatState } from '../../types/chatTypes';


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
      let userMessage: Message
      if (action.payload.input && !action.payload.composed_message) {
        userMessage = {
          id: Math.round(Math.random() * Math.random() * 10000).toString(),
          role: "user",
          content: action.payload.input,
          timestamp: Date.now()
        }
      } else if (action.payload.composed_message && !action.payload.input) {
        userMessage = action.payload.composed_message
      } else {
        throw new Error(`Either string input or composed message should be included in ADD_USER_MESSAGE`);
      }
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
    case "DELETE_MESSAGE" : {
      for (let i = state.messages.length - 1; i >= 0; i--) {
        if (state.messages[i].id === action.payload.msg_id) {
          return {
            ...state,
            messages: [...state.messages.slice(0, i)],
            isError: false
          }
        }
      }
      throw new Error(`id of message to delete does not match any message id from chat`);
    }
    default: {
      throw new Error(`Unhandled action type: ${(action as any).type}`);
    }
  }
}

const Chat: React.FC = () => {
  const [chatState, chatDispatch] = useReducer(chatReducer, {messages: DEFAULT_MESSAGES, isError: false});
  const [input, setInput] = useState<string>("");
  const [isTyping, setisTyping] = useState<boolean>(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { streamLLM, cancelStream, isStreaming } = useLLMStream();

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  useEffect(scrollToBottom, [chatState.messages]);

  const last_message_role: string = chatState.messages[chatState.messages.length - 1]?.role
  const requestLLM = () => {
    if (last_message_role === 'user') {
      sendMessages(chatState.messages, setisTyping, chatDispatch, streamLLM);
    } else {
    }
  }
  useEffect(requestLLM, [last_message_role]);

  return <div className="chat-container">
    <div className='chat-top'></div>

    <div className="messages">
      {chatState.messages.map((msg) => (
        <ChatMessageContainer
          key={msg.id}
          message={msg}
          chatDispatch={chatDispatch}
          setInput={setInput}
        />
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
      messagesDispatch={chatDispatch}
      cancelStream={cancelStream}
      isStreaming={isStreaming}
      isError={chatState.isError}
      isTyping={isTyping}
    />
  </div>
}

export default Chat;