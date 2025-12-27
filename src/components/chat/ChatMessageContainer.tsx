import { useState, useEffect } from 'react';
import {
  RefreshOutline,
  TrashAltOutline,
  BaselineEdit
} from '../../constants/svg_icons';
import MarkdownRenderer from './MarkdownRenderer';
import type {
  Message,
  ChatAction,
  DeleteMessageAction,
  EditMessageAction
} from "../../types/chatTypes"

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
      className="message-options-container"
    >
      {children}
    </div>
  )
}

interface ChatMessageContainerProps {
  message: Message;
  chatDispatch: React.ActionDispatch<[action: ChatAction]>
  setInput: (value: string) => void;
}

const ChatMessageContainer = ({ 
  message,
  chatDispatch,
  setInput,
}: ChatMessageContainerProps) => {
  const [isTooltipVisible, setTooltipVisible] = useState(true);
  const [editEnabled, enableEdit] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message.content);
  const [fixedMessage, setFixedMessage] = useState(message.content);

  useEffect(() => {
    // State copying in order to change state independently for user input
    setFixedMessage(message.content);
    setEditedMessage(message.content);
  }, [message.content])

  const deleteMessage = (id: string) => {
    const action: DeleteMessageAction = {
      type: 'DELETE_MESSAGE',
      payload: {
        msg_id: id
      }
    }
    chatDispatch(action);
  }

  const regeneratMessage = (id: string) => {
    const action: DeleteMessageAction = {
      type: 'DELETE_MESSAGE',
      payload: {
        msg_id: id
      }
    }
    chatDispatch(action);
    setInput("")
  }

  const handleEditMessage = () => {
    enableEdit(true);
    setTooltipVisible(false);
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const action: EditMessageAction = {
      type: "EDIT_MESSAGE",
      payload: {msg_id: message.id, new_content: editedMessage, role: message.role}
    }
    chatDispatch(action);
    enableEdit(false);
    setFixedMessage(editedMessage)
    setTooltipVisible(true);
  }
  
  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enableEdit(false);
    setTooltipVisible(true);
    setEditedMessage(fixedMessage);
  }

  return (
    <div className={`message-container ${message.role}`}>
      <div className='message-items'>      
        {!editEnabled ? (
          <div className={`message ${message.role}`}>
            <MarkdownRenderer content={fixedMessage} />
          </div>
        ) : (
        <>
          <form className={`message-form ${message.role}`} onSubmit={handleSubmitEdit}>
            <textarea
              className={"message-input"}
              autoFocus
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  handleSubmitEdit(e);
                } else if (e.key === 'Escape' && !e.shiftKey) {
                  handleCancelSubmit(e);
                }
              }}
            />
            <div className='message-form-buttons-container'>
              <button 
                className='button_stop'
                onClick={handleCancelSubmit}
              >
                Cancel
              </button>
              <button 
                className='button_submit'
                onClick={handleSubmitEdit}
              >
                Send
              </button>         
            </div>
           </form>
        </>
        )}
        <Tooltip isVisible={isTooltipVisible}>
        {
          message.role === 'assistant' || message.role ===  'error' ? (
            <>
              <button
                className='message-button-option'
                onClick={() => regeneratMessage(message.id)}
              >
                <RefreshOutline />
              </button>
              <button
                className='message-button-option'
                onClick={handleEditMessage}
              >
                <BaselineEdit />
              </button>            
            </>
          ) : (
            <>
              <button
                className='message-button-option'
                onClick={() => deleteMessage(message.id)}
              >
                <TrashAltOutline />
              </button>
              <button
                className='message-button-option'
                onClick={handleEditMessage}
              >
                <BaselineEdit />
              </button>
            </>
          )
        }
        </Tooltip>
      </div>
    </div>
  )
};

export default ChatMessageContainer;