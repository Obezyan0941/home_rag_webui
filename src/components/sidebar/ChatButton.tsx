import { Link } from 'react-router-dom';
import { useState, useContext } from 'react';
import {
  DotsHorizontalOutline,
  BaselineDriveFileRenameOutline,
  BaselineDeleteForever,
  Check
} from './svg_icons';
import { DeleteChatRequest, EditChatRequest } from '../../scripts/user_requests';
import { cookies } from '../../scripts/cookies';
import { COOKIES } from '../../constants/constants';
import { AppDispatchContext } from '../app_state/app_state';
import type { RemoveChat, EditChat } from "../../types/appStateTypes";

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
  const [editEnabled, enableEdit] = useState(false);
  const [fixedChatName, setFixedChatName] = useState(chat_name);
  const [editedChatName, setEditedChatName] = useState(chat_name);
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

  const handleEditChat = () => {
    enableEdit(true);
    setTooltipVisible(false);
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const user_id = cookies.get(COOKIES.USER_ID);
    if (typeof user_id !== "string") {
      console.error("Could not get user id from cookies");
      return;
    }
    if (typeof appStateDispatch === "undefined") {
      console.error("Unconsistent function call: appStateDispatch is undefined");
      return;
    }
    const action: EditChat = {
      type: "EDIT_CHAT",
      payload: {chat_id: chat_id, new_chat_name: editedChatName}
    }
    appStateDispatch(action);
    enableEdit(false);
    setFixedChatName(editedChatName)
    EditChatRequest({user_id: user_id, chat_id: chat_id, new_chat_name: editedChatName})
    console.log("Submitted!");
  }

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enableEdit(false);
    setEditedChatName(fixedChatName);
  }

  return (
    <div className='chat-details' onMouseLeave={handleHideTooltip}>
      {!editEnabled ? (
        <>
          <Link to={chat_url}>
            {fixedChatName}
          </Link>
          <DotsHorizontalOutline className='chat-button-menu-icon' onClick={handleShowTooltip}/>
          <Tooltip isVisible={isTooltipVisible}>
            <div className='tooltip-button' onClick={handleEditChat}>
              <BaselineDriveFileRenameOutline className='tooltip-button-icon'/>
              rename
            </div>
            <div className='tooltip-button' onClick={handleDelete}>
              <BaselineDeleteForever className='tooltip-button-icon'/>
              delete
            </div>
          </Tooltip>
        </>
      ) : (
        <>
          <form className={"chat-button-form"} onSubmit={handleSubmitEdit}>
            <input
              className={"chat-button-input"}
              type="text"
              autoFocus
              value={editedChatName}
              onChange={(e) => setEditedChatName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  handleSubmitEdit(e);
                } else if (e.key === 'Escape' && !e.shiftKey) {
                  handleCancelSubmit(e);
                }
              }}
            />
            <Check 
              onClick={handleSubmitEdit}
              className='chat-button-menu-icon'
            />
          </form>
        </>
      )}
    </div>
  )
};

export default ChatButton;