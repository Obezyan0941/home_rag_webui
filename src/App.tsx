import './App.css'
import ChatPage from './pages/Chat';
import NewChatPage from './pages/NewChatPage';
import { useState, useReducer } from 'react';
import { Routes, Route } from 'react-router-dom';
import { cookies } from './scripts/cookies';
import { COOKIES } from './constants/constants';
import { AppContext, AppDispatchContext } from './components/app_state/app_state';
import type {
  AppState,
  AppAction
} from './types/appStateTypes';

import SignInPage from './pages/Signin/SignIn';
import SignUpPage from './pages/Signup/SignUp';
import { useAuthCheck } from './hooks/useAuthCheck';

import type { SetChat } from './types/appStateTypes';
import type { ChatDetails } from './types/appStateTypes';
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
      const chatIdToRemove = action.payload.chat_id;

      const chatExists = state.chat_list.some(chat => chat.chat_id === chatIdToRemove);
      if (!chatExists) {
        throw new Error(`Chat with id ${chatIdToRemove} not found.`);
      }

      return {
        ...state,
        chat_list: state.chat_list.filter(chat => chat.chat_id !== chatIdToRemove),
      };
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

  const theme_value = true === cookies.get(COOKIES.DARK_THEME)
  const [darkTheme, setDarkTheme] = useState<boolean>(theme_value);
  const [appState, appDispatch] = useReducer(appReducer, {chat_list: []});

  const setChats = (chatList: ChatDetails[]) => {
    console.log(chatList);
    const action: SetChat = {
      type: "SET_CHAT",
      payload: {chat_list: chatList}
    }
    appDispatch(action);
  }
  const { error } = useAuthCheck({setChatList: setChats});
  if (error) console.log(error);


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
          <Route path="/signup" element={<SignUpPage/>} />
          <Route path="*" element={<h1>Not found</h1>} />
        </Routes>
      </AppDispatchContext>
    </AppContext>
  )
}

export default App
