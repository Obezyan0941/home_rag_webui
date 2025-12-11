import './App.css'
import ChatPage from './pages/Chat';
import NewChatPage from './pages/NewChatPage';
import { useState, useReducer, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { cookies } from './scripts/cookies';
import { COOKIES } from './constants/constants';
import { useNavigate } from 'react-router-dom';
import { AppContext, AppDispatchContext } from './components/app_state/app_state';
import type {
  ChatDetails,
  AppState,
  AppAction
} from './types/appStateTypes';

import { SignInRequest } from './scripts/authorization';
import { type SignInResponse } from './scripts/types';
import SignInPage from './pages/SignIn';

// const DEFAULT_CHATS: ChatDetails[] = [
//   {
//     chat_id: "123244",
//     chat_name: "biba chat",
//     created_at: "2025-12-10T15:30:45.123Z",
//     last_message_at: Date.now().toString(),
//     chat_dump: "bibaboba"
//   },
//   {
//     chat_id: "234355",
//     chat_name: "boba chat",
//     created_at: "2025-12-10T15:30:45.123Z",
//     last_message_at: Date.now().toString(),
//     chat_dump: "bibaboba2"
//   }
// ];

function appReducer(state: AppState, action: AppAction) {
  switch (action.type) {
    case "ADD_CHAT" : {
      return {
        ...state,
        chat_list: [...state.chat_list, action.payload],
      };    
    }
    case "REMOVE_CHAT" : {
      for (let i = state.chat_list.length - 1; i >= 0; i--) {
        if (state.chat_list[i].chat_id === action.payload.chat_id) {
          return {
            ...state,
            chat_list: [...state.chat_list.splice(i, 1)],
          };
        }
      }
      throw new Error(`id of chat to delete does not match any chat id from chat`);
    }
    case "SET_CHAT" : {
      return {
        ...state,
        chat_list: action.payload.chat_list,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${(action as any).type}`);
    }
  }
}

const App: React.FC = () => {
  const email = cookies.get(COOKIES.EMAIL)
  const password = cookies.get(COOKIES.PASSWORD)
  const navigate = useNavigate();

  const checkCredentials = ():boolean => {
    if (!email || !password) {
      navigate('/signin', { replace: true });
      return false;
    }
    return true;
  };

  let chat_list: ChatDetails[] = [];
  useEffect(() => {
    const fetchChats = async () => {
      const resp: SignInResponse = await SignInRequest({
        email: "",
        password: "",
      })
      chat_list = resp.chats
    };
    
    if (checkCredentials()) {fetchChats();}    
  }, []);

  const theme_value = true === cookies.get(COOKIES.DARK_THEME)
  const [darkTheme, setDarkTheme] = useState<boolean>(theme_value);
  const [appState, appDispatch] = useReducer(appReducer, {chat_list: chat_list});

  const toggleTheme = () => {
    setDarkTheme(!darkTheme)
    cookies.set(COOKIES.DARK_THEME, !darkTheme)
  }
  
  return (
    <AppContext value={appState}>
      <AppDispatchContext value={appDispatch}>
        <Routes>
          <Route path="/" element={<NewChatPage darkThemeEnabled={darkTheme} setDarkTheme={toggleTheme}/>} />
          <Route path="/c/:id" element={<ChatPage darkThemeEnabled={darkTheme} setDarkTheme={toggleTheme}/>} />
          <Route path="/signin" element={<SignInPage/>} />
          <Route path="*" element={<h1>Not found</h1>} />
        </Routes>
      </AppDispatchContext>
    </AppContext>
  )
}

export default App
