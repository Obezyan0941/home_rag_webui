import './ChatsList.css'
import ChatButton from './ChatButton';
import { useContext } from 'react';
import { AppContext } from '../app_state/app_state';

const ChatsList = () => {
  const chatState = useContext(AppContext);

  return (
    <div className="chat-list-container">
      {chatState.chat_list.map((chat) => (
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