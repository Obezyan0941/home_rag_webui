import Chat from '../components/chat/ChatContainer'
import Sidebar from '../components/sidebar/Sidebar'
import { useParams } from 'react-router-dom';

interface ChatPageProps {
  darkThemeEnabled: boolean,
  setDarkTheme: () => void
}

const ChatPage = ({darkThemeEnabled = false, setDarkTheme}: ChatPageProps) => {
  const { id } = useParams<{ id: string }>();
  
  console.log(`Requesting chat id: ${id}`);
  return (
    <div className={`app-container ${darkThemeEnabled ? "dark-theme" : " "}`}>
        <Sidebar darkTheme={darkThemeEnabled} setDarkTheme={setDarkTheme}/>
        <Chat/>
    </div>
  )
}

export default ChatPage
