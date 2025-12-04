import Sidebar from '../components/sidebar/Sidebar'
import NewChat from '../components/new_chat/NewChat';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

interface ChatPageProps {
  darkThemeEnabled: boolean
}

const NewChatPage = ({darkThemeEnabled = false}: ChatPageProps) => {
  const [darkTheme, setDarkTheme] = useState<boolean>(darkThemeEnabled);
  const { id } = useParams<{ id: string }>();
  
  console.log(`Requesting chat id: ${id}`);
  return (
    <div className={`app-container ${darkTheme ? "dark-theme" : " "}`}>
        <Sidebar darkTheme={darkTheme} setDarkTheme={setDarkTheme}/>
        <NewChat/>
    </div>
  )
}

export default NewChatPage
