import Chat from '../components/chat/ChatContainer'
import Sidebar from '../components/sidebar/Sidebar'
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface ChatPageProps {
  darkThemeEnabled: boolean,
  setDarkTheme: () => void
}

const ChatPage = ({darkThemeEnabled = false, setDarkTheme}: ChatPageProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  if (typeof id !== 'string') {
    console.error(`Invalid id: ${id}`)
    navigate('/', { replace: true });
  }
  
  return (
    <div className={`app-container ${darkThemeEnabled ? "dark-theme" : " "}`}>
        <Sidebar darkTheme={darkThemeEnabled} setDarkTheme={setDarkTheme}/>
        <Chat chat_id={id!}/>
    </div>
  )
}

export default ChatPage
