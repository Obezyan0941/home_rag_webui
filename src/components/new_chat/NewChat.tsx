import "./NewChat.css"
import { useState, useEffect } from 'react';
import { ChatInput } from "../chat/ChatInput";
import { useNavigate } from 'react-router-dom';
import { useSetChatRequest } from "../../scripts/user_requests";
import { cookies } from "../../scripts/cookies";
import { COOKIES } from "../../constants/constants";
import type { Message } from "../../types/chatTypes";

const NewChat = () => {
  const [input, setInput] = useState<string>("");
  const navigate = useNavigate();
  const { 
    mutate: setChat, 
    // isPending: isSetChatPending, 
    // isSuccess: isSetChatSuccess, 
    // isError: isSetChatError, 
    // error: setChatError 
  } = useSetChatRequest();
  const user_id = cookies.get(COOKIES.USER_ID);
  
  const onSubmit = () => {
    if (typeof user_id === "string") {
      const new_chat_message: Message = {
        id: Math.round(Math.random() * Math.random() * 10000).toString(),
        role: "user",
        content: input,
        created: Date.now()
      }
      const chat_dump = JSON.stringify([new_chat_message]);
      setChat(
        {
          user_id: user_id,
          chat_id: "", 
          chat_dump: chat_dump,
        },
        {
          onSuccess: (data) => {
            navigate('/c/'+data.chat_id , { replace: true });
          },
          onError: (err) => {
            throw new Error(`Failed to set chat: ${err}`);
          }
        }
      );
    }
    else {
      throw new Error(`invalid user id: ${user_id}`);
    }
    // TODO: сначала делаем запрос на set_user_chat, при успехе получаем chat_id 
    // и переходим по нему на страницу с чатом. На странице с чатом useEffect, который
    // делает превичный запрос на чат. Другой useEffect видит, что последнее сообщение
    // в чате было от пользователя, следовательно делает запрос.
    // navigate('/c/' + crypto.randomUUID(), { replace: true });
  }

  return (
    <div className="new-chat-container">
      <div className="new-chat-box">
        <h1>Welcome</h1>
        <ChatInput
          value={input}
          onChange={(e: string) => setInput(e)}
          onSubmit={onSubmit}
          cancelStream={() => {}}
          isStreaming={false}
          isError={false}
          isTyping={false}
          placeholder="Ask me anything!"
          prefix="-new"
        />
      </div>
    </div>
  );
};

export default NewChat;