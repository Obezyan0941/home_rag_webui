import type { SVGProps } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import type { Message, ChatAction, DeleteMessageAction } from "../../types/chatTypes"

export function RefreshOutline(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1.3em"
      height="1.3em"
      {...props}
    >
      <path
        fill="currentColor"
        d="M6.545 8.163a.75.75 0 0 1-.487-1.044l1.66-3.535a.75.75 0 0 1 1.36.002l.732 1.569l.08-.027a8.15 8.15 0 1 1-5.8 5.903a.75.75 0 1 1 1.456.364a6.65 6.65 0 1 0 4.907-4.862l.74 1.583a.75.75 0 0 1-.872 1.043z"
      ></path>
    </svg>
  )
}

export function TrashAltOutline(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1.3em"
      height="1.3em"
      {...props}
    >
      <path
        fill="currentColor"
        d="M10 2.25a.75.75 0 0 0-.75.75v.75H5a.75.75 0 0 0 0 1.5h14a.75.75 0 0 0 0-1.5h-4.25V3a.75.75 0 0 0-.75-.75zM13.06 15l1.47 1.47a.75.75 0 1 1-1.06 1.06L12 16.06l-1.47 1.47a.75.75 0 1 1-1.06-1.06L10.94 15l-1.47-1.47a.75.75 0 1 1 1.06-1.06L12 13.94l1.47-1.47a.75.75 0 1 1 1.06 1.06z"
      ></path>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M5.991 7.917a.75.75 0 0 1 .746-.667h10.526a.75.75 0 0 1 .746.667l.2 1.802c.363 3.265.363 6.56 0 9.826l-.02.177a2.85 2.85 0 0 1-2.44 2.51a27 27 0 0 1-7.498 0a2.85 2.85 0 0 1-2.44-2.51l-.02-.177a44.5 44.5 0 0 1 0-9.826zm1.417.833l-.126 1.134a43 43 0 0 0 0 9.495l.02.177a1.35 1.35 0 0 0 1.157 1.191c2.35.329 4.733.329 7.082 0a1.35 1.35 0 0 0 1.157-1.19l.02-.178c.35-3.155.35-6.34 0-9.495l-.126-1.134z"
        clipRule="evenodd"
      ></path>
    </svg>
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

  return (
    <div className={`message-container ${message.role}`}>
      <div className='message-items'>      
        <div className={`message ${message.role}`}>
          <MarkdownRenderer content={message.content} />
        </div>
        <div className='message-options-container'>
        {
          message.role === 'assistant' || message.role ===  'error' ? (
            <button
              className='message-button-option'
              onClick={() => regeneratMessage(message.id)}
            >
              <RefreshOutline />
            </button>
          ) : (
            <button
              className='message-button-option'
              onClick={() => deleteMessage(message.id)}
            >
              <TrashAltOutline />
            </button>
          )
        }
        </div>
      </div>
    </div>
  )
};

export default ChatMessageContainer;