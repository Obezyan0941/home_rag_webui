import { Link } from 'react-router-dom';

export type ChatButtonProps = {
  chat_id: string;
  chat_name: string;
};

const ChatButton = ({
  chat_id,
  chat_name,
}: ChatButtonProps) => {
  const chat_url = "/c/" + chat_id;

  return (
    <div className='chat-details'>
      <Link to={chat_url}>
        {chat_name}
      </Link>
    </div>
  )
};

export default ChatButton;