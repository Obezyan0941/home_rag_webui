import "./NewChat.css"
import { useState } from 'react';
import { ChatInput } from "../chat/ChatInput";
import { useNavigate } from 'react-router-dom';
import { useSetChatRequest } from "../../scripts/user_requests";
import { cookies } from "../../scripts/cookies";
import { COOKIES } from "../../constants/constants";
import type { Message } from "../../types/chatTypes";
import { useContext } from 'react';
import { AppDispatchContext } from '../app_state/app_state';
import type { AddChat } from "../../types/appStateTypes";
import type { ChatDetails } from "../../types/appStateTypes";

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
  const appStateDispatch = useContext(AppDispatchContext);
  
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
            const new_chat_data: ChatDetails = {
              chat_id: data.chat_id,
              chat_name: data.chat_name,
              created_at: data.created_at,
              last_message_at: data.last_message_at,
              chat_dump: ""
            }
            console.log(`chat_name: ${data.chat_name}`)
            const action: AddChat = {
              type: "ADD_CHAT",
              payload: new_chat_data
            }
            if (typeof appStateDispatch !== "undefined") {
              appStateDispatch(action);
              navigate('/c/'+data.chat_id , { replace: true });
            } else {
              console.error("app state is undefined");
            }
          },
          onError: (err) => {
            console.error(`Failed to set chat: ${err}`);
          }
        }
      );
    }
    else {
      throw new Error(`invalid user id: ${user_id}`);
    }
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