import './ChatsList.css'
import ChatButton from './ChatButton';
import type { ChatDetails } from '../../types/chatTypes';

const DEFAULT_CHATS: ChatDetails[] = [
  {
    chat_id: "123244",
    chat_name: "biba chat",
    created_at: "2025-12-10T15:30:45.123Z",
    last_message_at: Date.now().toString(),
    chat_dump: "bibaboba"
  },
  {
    chat_id: "234355",
    chat_name: "boba chat",
    created_at: "2025-12-10T15:30:45.123Z",
    last_message_at: Date.now().toString(),
    chat_dump: "bibaboba2"
  }
];

const ChatsList = () => {
  return (
    <div className="chat-list-container">
      {DEFAULT_CHATS.map((chat) => (
        <ChatButton
          key={chat.chat_id}
          chat_id={chat.chat_id}
          chat_name={chat.chat_name}
        />
      ))}
    </div>
  );
};

export default ChatsList;