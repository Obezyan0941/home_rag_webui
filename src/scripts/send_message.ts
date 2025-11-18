import React from 'react';
import { type Message } from './types';


const sendMessage = async(
    input: string,
    messages: Message[],
    setInput: React.Dispatch<React.SetStateAction<string>>,
    setisTyping: React.Dispatch<React.SetStateAction<boolean>>,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    streamLLM: (messages: Message[], onChunk: (text: string) => void) => Promise<void>
) => {
    if(!input.trim()) return;
    
    const userMessage: Message = {
        id: Math.round(Math.random() * Math.random() * 10000).toString(),
        role: "user",
        content: input,
        timestamp: Date.now()
    };

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

export default sendMessage;