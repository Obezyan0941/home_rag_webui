import './App.css'
import ChatPage from './pages/Chat';
import NewChatPage from './pages/NewChatPage';
import { useState, useReducer } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { cookies } from './scripts/cookies';
import { DARK_THEME_COOKIE } from './constants/constants';
import { AppContext, AppDispatchContext } from './components/app_state/app_state';
import type {
  ChatDetails,
  AppState,
  AppAction
} from './types/appStateTypes';

const DEFAULT_CHATS: ChatDetails[] = [
  {
    chat_id: "123244",
    chat_name: "biba chat",
    created_at: "2025-12-10T15:30:45.123Z",
    last_message_at: Date.now().toString(),
    chat_dump: "bibaboba"
  },
  {
    chat_id: "234355",
    chat_name: "boba chat",
    created_at: "2025-12-10T15:30:45.123Z",
    last_message_at: Date.now().toString(),
    chat_dump: "bibaboba2"
  }
];

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
          }
        }
      }
      throw new Error(`id of chat to delete does not match any chat id from chat`);
    }
    default: {
      throw new Error(`Unhandled action type: ${(action as any).type}`);
    }
  }
}

const App: React.FC = () => {
  const theme_value = true === cookies.get(DARK_THEME_COOKIE)
  const [darkTheme, setDarkTheme] = useState<boolean>(theme_value);
  const [appState, appDispatch] = useReducer(appReducer, {chat_list: DEFAULT_CHATS});

  const toggleTheme = () => {
    setDarkTheme(!darkTheme)
    cookies.set(DARK_THEME_COOKIE, !darkTheme)
  }
  
  return (
    <AppContext value={appState}>
      <AppDispatchContext value={appDispatch}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<NewChatPage darkThemeEnabled={darkTheme} setDarkTheme={toggleTheme}/>} />
            <Route path="/c/:id" element={<ChatPage darkThemeEnabled={darkTheme} setDarkTheme={toggleTheme}/>} />
            <Route path="*" element={<h1>Not found</h1>} />
          </Routes>
        </BrowserRouter>
      </AppDispatchContext>
    </AppContext>
  )
}

export default App
