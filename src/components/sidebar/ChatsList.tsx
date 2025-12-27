import './ChatsList.css'
import ChatButton from './ChatButton';
import { useContext } from 'react';
import { AppContext } from '../app_state/app_state';

const ChatsList = () => {
  const chatState = useContext(AppContext);
  const sortedChats = [...chatState.chat_list].sort(
    (a, b) =>
      new Date(b.last_message_at).getTime() -
      new Date(a.last_message_at).getTime()
  );

  return (
    <div className="chat-list-container">
      {sortedChats.map((chat) => (
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