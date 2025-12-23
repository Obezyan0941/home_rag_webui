import { fetchJson } from "./requests";
import type {
    SetChatRequestInterface,
    GetChatRequestInterface,
    DeleteChatRequestInterface,
    EditChatRequestInterface,
    SuccessResponseInterface
} from "./types";
import { useMutation } from "@tanstack/react-query";

export interface SetChatResponse {
  success: boolean;
  chat_id: string;
  chat_name: string;
  created_at: string;
  last_message_at: string; 
}

export interface GetChatResponse {
  success: boolean;
  chat_dump: string
}

export const SetChatRequest = (data: SetChatRequestInterface) =>
  fetchJson<SetChatRequestInterface, SetChatResponse>('/setchat', 'POST', data);

export const useSetChatRequest = () => {
    return useMutation({
        mutationFn: (data: SetChatRequestInterface) => 
            SetChatRequest(data),
        onSuccess: async (data: SetChatResponse) => {
            if (data === undefined) {
                throw new Error("Error in login request: no data received");
            } else if (data.success === true && data.chat_id.length > 0) {
                console.log("new chat started");
            } else {
                throw new Error(`Unexpected behaviour: returned data: ${data}`);
            }
        },
        onError: (error: Error) => {
            throw new Error(error.message);
        },
    });
};

export const GetChatRequest = (data: GetChatRequestInterface) =>
  fetchJson<GetChatRequestInterface, GetChatResponse>('/getchat', 'POST', data);

export const useGetChatRequest = () => {
    return useMutation({
        mutationFn: (data: GetChatRequestInterface) => 
            GetChatRequest(data),
        onSuccess: async (data: GetChatResponse) => {
            if (data === undefined) {
                throw new Error("Error in get chat: no data received");
            } else if (data.success === true && data.chat_dump.length > 0) {
                console.log("received chat");
            } else if (data.success === false) {
                throw new Error(`Could not retrieve chats. Could not find chat with specified user id and chat id.`);
            } else {
                throw new Error(`Unexpected behaviour: returned data: ${data}`);
            }
        },
        onError: (error: Error) => {
            throw new Error(error.message);
        },
    });
};

export const DeleteChatRequest = (data: DeleteChatRequestInterface) =>
  fetchJson<DeleteChatRequestInterface, SuccessResponseInterface>('/delchat', 'POST', data);


export const EditChatRequest = (data: EditChatRequestInterface) =>
  fetchJson<EditChatRequestInterface, SuccessResponseInterface>('/editchat', 'POST', data);




