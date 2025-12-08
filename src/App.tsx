import './App.css'
import ChatPage from './pages/Chat';
import NewChatPage from './pages/NewChatPage';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { cookies } from './scripts/cookies';
import { DARK_THEME_COOKIE } from './constants/constants';


const App: React.FC = () => {
  const theme_value = true === cookies.get(DARK_THEME_COOKIE)
  const [darkTheme, setDarkTheme] = useState<boolean>(theme_value);

  const toggleTheme = () => {
    setDarkTheme(!darkTheme)
    cookies.set(DARK_THEME_COOKIE, !darkTheme)
  }
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NewChatPage darkThemeEnabled={darkTheme} setDarkTheme={toggleTheme}/>} />
        <Route path="/c/:id" element={<ChatPage darkThemeEnabled={darkTheme} setDarkTheme={toggleTheme}/>} />
        <Route path="*" element={<h1>Not found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
