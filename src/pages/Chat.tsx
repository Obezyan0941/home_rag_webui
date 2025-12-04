import Chat from '../components/chat/ChatContainer'
import Sidebar from '../components/sidebar/Sidebar'
import { useState } from 'react';
import { useParams } from 'react-router-dom';

interface ChatPageProps {
  darkThemeEnabled: boolean
}

const ChatPage = ({darkThemeEnabled = false}: ChatPageProps) => {
  const [darkTheme, setDarkTheme] = useState<boolean>(darkThemeEnabled);
  const { id } = useParams<{ id: string }>();
  
  console.log(`Requesting chat id: ${id}`);
  return (
    <div className={`app-container ${darkTheme ? "dark-theme" : " "}`}>
        <Sidebar darkTheme={darkTheme} setDarkTheme={setDarkTheme}/>
        <Chat/>
    </div>
  )
}

export default ChatPage
