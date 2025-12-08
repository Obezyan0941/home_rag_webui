import Sidebar from '../components/sidebar/Sidebar'
import NewChat from '../components/new_chat/NewChat';
import { useParams } from 'react-router-dom';

interface ChatPageProps {
  darkThemeEnabled: boolean
  setDarkTheme: () => void
}

const NewChatPage = ({darkThemeEnabled = false, setDarkTheme}: ChatPageProps) => {
  const { id } = useParams<{ id: string }>();
  
  console.log(`Requesting chat id: ${id}`);
  return (
    <div className={`app-container ${darkThemeEnabled ? "dark-theme" : " "}`}>
        <Sidebar darkTheme={darkThemeEnabled} setDarkTheme={setDarkTheme}/>
        <NewChat/>
    </div>
  )
}

export default NewChatPage
