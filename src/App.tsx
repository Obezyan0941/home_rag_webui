import './App.css'
import Chat from './components/Chat'
import Sidebar from './components/Sidebar'
import { useState } from 'react';

function App() {
  const [darkTheme, setDarkTheme] = useState<boolean>(false);
  
  return (
  <div className={`app-container ${darkTheme ? "dark-theme" : " "}`}>
    <Sidebar darkTheme={darkTheme} setDarkTheme={setDarkTheme}/>
    <Chat darkTheme={darkTheme}/>
  </div>
  )
}

export default App
