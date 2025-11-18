import React from 'react';
import type {
  Message,
  ChatAction,
  AddUserMessageAction,
  AddAssistantMessageAction,
  AddErrorMessageAction
} from '../types/chatTypes';


const sendMessage = async(
    input: string,
    messages: Message[],
    setInput: React.Dispatch<React.SetStateAction<string>>,
    setisTyping: React.Dispatch<React.SetStateAction<boolean>>,
    messagesDispatch: React.ActionDispatch<[action: ChatAction]>,
    streamLLM: (messages: Message[], onChunk: (text: string) => void) => Promise<void>
) => {
    if(!input.trim()) return;
    
    setInput("");
    setisTyping(true);
    const action: AddUserMessageAction = {
      type: 'ADD_USER_MESSAGE',
      payload: {
        input: input
      }
    } 
    messagesDispatch(action)

    let botContent = '';
    const onChunk = (delta: string) => {
      botContent += delta;
      if (botContent) setisTyping(false);
      // throw new Error("Pizda");
      
      const action: AddAssistantMessageAction = {
        type: 'ADD_ASSISTANT_MESSAGE',
        payload: {
          token: botContent
        }
      } 
      messagesDispatch(action);
    };

    try {
      await streamLLM(messages, onChunk);
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

export default sendMessage;