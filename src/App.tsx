import './App.css'
import ChatPage from './pages/Chat';
import NewChatPage from './pages/NewChatPage';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App: React.FC = () => {
  const [darkTheme, setDarkTheme] = useState<boolean>(false);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NewChatPage darkThemeEnabled={darkTheme}/>} />
        <Route path="/c/:id" element={<ChatPage darkThemeEnabled={darkTheme}/>} />
        <Route path="*" element={<h1>Not found</h1>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
