import './App.css'
import Chat from './components/Chat'
import Sidebar from './components/sidebar/Sidebar'
import { useState } from 'react';

const App: React.FC = () => {
  const [darkTheme, setDarkTheme] = useState<boolean>(false);
  
  return (
  <div className={`app-container ${darkTheme ? "dark-theme" : " "}`}>
    <Sidebar darkTheme={darkTheme} setDarkTheme={setDarkTheme}/>
    <Chat/>
  </div>
  )
}

export default App
