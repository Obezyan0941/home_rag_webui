import { useEffect, useRef, useState, useReducer, useContext } from 'react';

import './ChatContainer.css';
import { ChatInput } from './ChatInput';
import {sendMessages} from '../../scripts/send_message';
import { useLLMStream } from '../../hooks/useLLMStream';
import ChatMessageContainer from "./ChatMessageContainer";
import { cookies } from '../../scripts/cookies';
import { COOKIES } from '../../constants/constants';
import { useNavigate } from 'react-router-dom';
import type {
  Message,
  ChatAction,
  ChatState,
  AddUserMessageAction,
  SetMessagesAction
} from '../../types/chatTypes';
import { useGetChatRequest, SetChatRequest } from '../../scripts/user_requests';
import { AppContext } from '../app_state/app_state';
import { checkChatIsActive } from '../../scripts/utils';

function chatReducer(state: ChatState, action: ChatAction) {
  switch (action.type) {
    case "SET_MESSAGES" : {
      return {
        ...state,
        messages: action.payload.messages,
        isError: false
      };
    }
    case "ADD_USER_MESSAGE" : {
      let userMessage: Message
      if (action.payload.input && !action.payload.composed_message) {
        userMessage = {
          id: Math.round(Math.random() * Math.random() * 10000).toString(),
          role: "user",
          content: action.payload.input,
          created: Date.now()
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
          created: Date.now(),
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
        created: Date.now()
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
          const new_messages = [...state.messages.slice(0, i)]
          if (new_messages.length === 0) return {...state}
          if (new_messages[new_messages.length - 1].role === "assistant") {
            const user_id = cookies.get(COOKIES.USER_ID);
            if (typeof user_id !== "string") {
              console.error("Inconsistent function call: user_id is not a string. user_id: " + user_id);
              return {...state}
            }
            const chat_dump = JSON.stringify(new_messages);
            SetChatRequest({user_id: user_id, chat_id: state.chat_id, chat_dump: chat_dump});
            return {
              ...state,
              messages: new_messages,
              isError: false
            }
          }
          return {
            ...state,
            messages: [...state.messages.slice(0, i)],
            isError: false
          }
        }
      }
      console.error("Could not find message by id: " + action.payload.msg_id)
      return {...state}
    }
    default: {
      throw new Error(`Unhandled action type: ${(action as any).type}`);
    }
  }
}

interface ChatContainerProps {
  chat_id: string;
}

const Chat: React.FC<ChatContainerProps> = ({ chat_id }) => {
  const [chatState, chatDispatch] = useReducer(chatReducer, {messages: [], isError: false, chat_id: chat_id});
  const appContext = useContext(AppContext);
  const setChatMessages = (messages: Message[]) => {
    const action: SetMessagesAction = {
      type: 'SET_MESSAGES',
      payload: {
        messages: messages
      }
    } 
    chatDispatch(action)
  };

  const { 
    mutate: getChat
  } = useGetChatRequest();

  useEffect(() => {
      const user_id = cookies.get(COOKIES.USER_ID);
      getChat(
        {
          user_id: user_id,
          chat_id: chat_id, 
        },
        {
          onSuccess: (data) => {
            const chat_dump = data.chat_dump
            const messages = JSON.parse(chat_dump) as Message[];
            console.log(messages);
            if (Array.isArray(messages)) {
              setChatMessages(messages);
            } else {
              throw new Error("messages object recieved is not an array");
            }
          },
          onError: (err) => {
            throw new Error(`Failed to get chat: ${err}`);
          }
        }
      );
    }, [chat_id]);

  const [input, setInput] = useState<string>("");
  const [isTyping, setisTyping] = useState<boolean>(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { streamLLM, cancelStream, isStreaming } = useLLMStream();
  const navigate = useNavigate();

  const onInputSubmit = (value: string) => {
    const action: AddUserMessageAction = {
      type: 'ADD_USER_MESSAGE',
      payload: {
        input: value
      }
    } 
    chatDispatch(action)
  }

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  if (!checkChatIsActive({chat_id: chat_id, chats: appContext.chat_list})) navigate('/', { replace: true });
  useEffect(scrollToBottom, [chatState.messages]);

  const last_message_role: string = chatState.messages[chatState.messages.length - 1]?.role
  const requestLLM = () => {
    if (last_message_role === 'user') {
      const user_id = cookies.get(COOKIES.USER_ID)
      if (typeof user_id !== "string") {
        navigate('/signin', { replace: true });
      }
      sendMessages(chatState.messages, chat_id, user_id, setisTyping, chatDispatch, streamLLM);
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
      onSubmit={onInputSubmit}
      cancelStream={cancelStream}
      isStreaming={isStreaming}
      isError={chatState.isError}
      isTyping={isTyping}
      prefix=""
    />
  </div>
}

export default Chat;