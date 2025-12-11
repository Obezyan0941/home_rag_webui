import "./SignIn.css"
import { useState } from "react";
import { useLogin } from "../scripts/authorization";
import Spinner from "../components/spinner_loading/Spinner";
import { Link } from 'react-router-dom';
import logo from '/src/assets/logo.png'; 
import { useContext } from 'react';
import { AppDispatchContext } from '../components/app_state/app_state';
import { type SetChat } from "../types/appStateTypes";
import { useNavigate } from 'react-router-dom';

const SignInPage = () => {
  const { 
    mutate: login, 
    isPending: isLoginPending, 
    // isSuccess: isLoginSuccess, 
    // isError: isLoginError, 
    // error: loginError 
  } = useLogin();  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginErrorText, setLoginError] = useState<string | null>(null);
  const chatStateDispatch = useContext(AppDispatchContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password }, {
      onSuccess: (data) => {
        const action: SetChat = {
          type: "SET_CHAT",
          payload: {chat_list: data.chats}
        }
        if (chatStateDispatch === undefined) {
          throw new Error('useAppDispatch must be used within AppDispatchProvider');
        }
        chatStateDispatch(action);
        navigate('/', { replace: true });
      },
      onError: (err) => {
        if (err.message.includes("Invalid email")) {
          setLoginError("Email does not exist");
        } else if (err.message.includes("Invalid password")) {
          setLoginError("Wrong password");
        } else if (err.message.includes("500")) {
          setLoginError("Internal server error");
        } else {
          setLoginError(err.message);
        }
      }
    });
  };

  return (
    <div className="signin-page-container">
      <img src={logo} alt="Logo" width={136} height={75}/>    
      <div className="signin-container">
        <h1>Sign in</h1>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={"email"}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={"password"}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          className="signin-button"
          disabled={email==="" || password.length < 5 || isLoginPending}
          onClick={(e) => handleSubmit(e)}
        >{!isLoginPending? "Sign-In" : <Spinner/>}</button>
        <div className="error-msg">{loginErrorText ? loginErrorText : "\u00A0"}</div>
      </div>
      <Link to="/signup">
        New here? Create an account
      </Link>
    </div>
  );
};

export default SignInPage