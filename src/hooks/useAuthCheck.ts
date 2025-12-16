import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cookies } from "../scripts/cookies";
import { COOKIES } from "../constants/constants";
import type { ChatDetails } from "../types/appStateTypes";
import type { SignInResponse } from "../scripts/types";
import { SignInRequest } from "../scripts/authorization";

interface UseAuthCheckResult {
  chatList: ChatDetails[];
  isLoading: boolean;
  error: string | null;
  userId: string | null; 
}

interface useAuthCheckInterface {
  setChatList: (a: ChatDetails[]) => void;
}

export const useAuthCheck = ({setChatList}: useAuthCheckInterface): UseAuthCheckResult => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  let chatList: ChatDetails[] = [];

  useEffect(() => {
    const email = cookies.get(COOKIES.EMAIL);
    const password = cookies.get(COOKIES.PASSWORD);
    const userId = cookies.get(COOKIES.USER_ID);

    if (!email || !password || !userId) {
      navigate('/signin', { replace: true });
      setIsLoading(false);
      return;
    }

    const fetchChats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [emailString, passwordString] = [email, password].map(item => String(item));
        const resp: SignInResponse = await SignInRequest({
          email: emailString,
          password: passwordString,
        });
        chatList = resp.chats;
        setChatList(chatList);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();

  }, []);

  return { chatList, isLoading, error, userId: cookies.get(COOKIES.USER_ID) };
};