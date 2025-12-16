import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  DotsHorizontalOutline,
  BaselineDriveFileRenameOutline,
  BaselineDeleteForever
} from './svg_icons';

interface TooltipProps {
  isVisible: boolean;
  children: React.ReactNode;
}

const Tooltip = ({ isVisible, children }: TooltipProps) => {
  if (!isVisible) {
    return null;
  }
  
  return (
    <div
      className="chat-button-tooltip"
    >
      {children}
    </div>
  )
}

export type ChatButtonProps = {
  chat_id: string;
  chat_name: string;
};

const ChatButton = ({
  chat_id,
  chat_name,
}: ChatButtonProps) => {
  const [isTooltipVisible, setTooltipVisible] = useState(false);  
  const chat_url = "/c/" + chat_id;

  const handleShowTooltip = () => {
    setTooltipVisible(true);
  };

  const handleHideTooltip = () => {
    setTooltipVisible(false);
  };

  return (
    <div className='chat-details' onMouseLeave={handleHideTooltip}>
      <Link to={chat_url}>
        {chat_name}
      </Link>
      <DotsHorizontalOutline className='chat-button-menu-icon' onClick={handleShowTooltip}/>
      <Tooltip isVisible={isTooltipVisible}>
        <div className='tooltip-button'>
          <BaselineDriveFileRenameOutline className='tooltip-button-icon'/>
          rename
        </div>
        <div className='tooltip-button'>
          <BaselineDeleteForever className='tooltip-button-icon'/>
          delete
        </div>
      </Tooltip>
    </div>
  )
};

export default ChatButton;