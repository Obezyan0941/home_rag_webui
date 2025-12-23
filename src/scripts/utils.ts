import type { ChatDetails } from "../types/appStateTypes";

interface checkChatIsActiveArgs {
  chat_id: string;
  chats: ChatDetails[];
} 

export const checkChatIsActive = ({chat_id, chats}:  checkChatIsActiveArgs):boolean => {
  return chats.some(chat => chat_id === chat.chat_id);
}
