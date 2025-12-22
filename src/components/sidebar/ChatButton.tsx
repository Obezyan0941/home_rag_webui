import { Link } from 'react-router-dom';
import { useState, useContext } from 'react';
import {
  DotsHorizontalOutline,
  BaselineDriveFileRenameOutline,
  BaselineDeleteForever
} from './svg_icons';
import { DeleteChatRequest } from '../../scripts/user_requests';
import { cookies } from '../../scripts/cookies';
import { COOKIES } from '../../constants/constants';
import { AppDispatchContext } from '../app_state/app_state';
import type { RemoveChat } from "../../types/appStateTypes";

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
  const appStateDispatch = useContext(AppDispatchContext);
  const chat_url = "/c/" + chat_id;

  const handleShowTooltip = () => {
    setTooltipVisible(true);
  };

  const handleHideTooltip = () => {
    setTooltipVisible(false);
  };

  const handleDelete = () => {
    console.log("current chat id: " + chat_id);
    const user_id = cookies.get(COOKIES.USER_ID);
    if (typeof user_id !== "string") {
      console.error("Could not get user id from cookies");
      return;
    }
    if (typeof appStateDispatch === "undefined") {
      console.error("Unconsistent function call: appStateDispatch is undefined");
      return;
    }
    const action: RemoveChat = {
      type: "REMOVE_CHAT",
      payload: {chat_id: chat_id}
    }
    try {
      DeleteChatRequest({user_id: user_id, chat_id: chat_id});
      appStateDispatch(action);
    } catch (e) {
      const err_msg = e instanceof(Error) ? e.message : ""
      console.error("Could not request chat deletion. Error message: " + err_msg);
    }
  }

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
        <div className='tooltip-button' onClick={handleDelete}>
          <BaselineDeleteForever className='tooltip-button-icon'/>
          delete
        </div>
      </Tooltip>
    </div>
  )
};

export default ChatButton;