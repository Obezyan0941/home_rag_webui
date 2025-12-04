import "./NewChat.css"
import { useState } from 'react';
import { ChatInput } from "../chat/ChatInput";

const NewChat = () => {
  const [input, setInput] = useState<string>("");


  return (
    <div className="new-chat-container">
      <div className="new-chat-box">
        <h1>Welcome</h1>
        <ChatInput
          value={input}
          onChange={(e: string) => setInput(e)}
          onSubmit={() => console.log("pizda")}
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