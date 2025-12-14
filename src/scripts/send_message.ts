import React from 'react';
import type {
  Message,
  ChatAction,
  AddUserMessageAction,
  AddAssistantMessageAction,
  AddErrorMessageAction
} from '../types/chatTypes';


const composeMessages = (
  input: string,
  messagesState: Message[],
  messagesDispatch: React.ActionDispatch<[action: ChatAction]>,
): Message[] => {
  if(!input.trim()) throw new Error(`Input cannot be empty!`);

  const new_user_message: Message = {
    id: Math.round(Math.random() * Math.random() * 10000).toString(),
    role: "user",
    content: input,
    created: Date.now()
  }

  const action: AddUserMessageAction = {
    type: 'ADD_USER_MESSAGE',
    payload: {
      composed_message: new_user_message
    }
  } 
  messagesDispatch(action);
  const messages: Message[] = [...messagesState]
  messages.push(new_user_message)
  return messages;
}

const sendMessages = async(
    messages: Message[],
    chat_id: string,
    user_id: string,
    setisTyping: React.Dispatch<React.SetStateAction<boolean>>,
    messagesDispatch: React.ActionDispatch<[action: ChatAction]>,
    streamLLM: (messages: Message[], onChunk: (text: string) => void, chat_id: string, user_id: string) => Promise<void>
) => {
  // console.log("Requesting llm"); 
  // for (let message of messages) {
  //   console.log(message.content);
  // }

  setisTyping(true);

  let botContent = '';
  const onChunk = (delta: string) => {
    botContent += delta;
    if (botContent) setisTyping(false);
    
    const action: AddAssistantMessageAction = {
      type: 'ADD_ASSISTANT_MESSAGE',
      payload: {
        token: botContent
      }
    } 
    messagesDispatch(action);
  };

  try {
    await streamLLM(messages, onChunk, chat_id, user_id);
  } catch(error) {
    const error_text = error instanceof Error ? error.message : String(error)
    const action: AddErrorMessageAction = {
      type: 'ADD_ERROR_MESSAGE',
      payload: {
        errorMsg: error_text
      }
    }       
    messagesDispatch(action);
    setisTyping(false);
    console.error(error);
  }
}

export {sendMessages, composeMessages};