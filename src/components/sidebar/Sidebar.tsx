import "./Sidebar.css"
import logo from '/src/assets/logo.png'; 
import ChatsList from "./ChatsList";
import { useState, useEffect } from "react";
import {
  Sun,
  CrescentMoon,
  ChevronLeft,
  ChevronRight,
  InterfaceEditWrite2ChangeDocumentEditModifyPaperPencilWriteWriting
} from "./svg_icons";
import { Link } from 'react-router-dom';
import { cookies } from "../../scripts/cookies";
import { COOKIES } from "../../constants/constants";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  darkTheme: boolean;
  setDarkTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ darkTheme, setDarkTheme }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);

  const handleResize = () => {
    if (window.innerWidth < 800) {
      setExpanded(false);
    } else {
      setExpanded(true); 
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggle = () => setExpanded(prev => !prev);

  const handleLogOut = () => {
    cookies.set(COOKIES.USER_ID, "");
    cookies.set(COOKIES.PASSWORD, "");
    cookies.set(COOKIES.USER_ID, "");
    cookies.set(COOKIES.DARK_THEME, "");
    navigate('/signin', { replace: true });
  }

  return(
    <div className="sidebar-container">
      <aside className={`sidebar ${!expanded ? 'collapsed' : ''}`}>
        <div className={`header-wrapper ${darkTheme ? ".dark-theme" : " "}`}>
          <img src={logo} alt="Logo" width={100} height={55}/>
          <div className="themeButton" onClick={() => setDarkTheme()}>
            {!darkTheme ? <Sun/> : <CrescentMoon/>}
          </div>
          <div
            className="toggleSidebarButton"
            onClick={toggle}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse menu' : 'Show menu'}
          >
            {expanded ? <ChevronLeft/> : <ChevronRight/>}
          </div>
        </div>  

        <div className="sidebar-middle-container">
          <div className="new-chat-button">
            <InterfaceEditWrite2ChangeDocumentEditModifyPaperPencilWriteWriting/>
            <Link to="/">
              New Chat
            </Link>
          </div>
          <div className="sidebar-line-break"/>
          <ChatsList/>
          
        </div>
        <div className="sidebar-bottom-container">
          <div className="logout-button" onClick={handleLogOut}>
            Log Out
          </div>
        </div>
      </aside>
      {!expanded ?
        <div className="show-sidebar-container">
          <div
            className="toggleSidebarButton"
            onClick={toggle}
            aria-expanded={expanded}
            aria-label={'Show menu'}
          >
            <ChevronRight/>
          </div>
        </div> : <div></div>
      }
    </div>
  )
}

export default Sidebar