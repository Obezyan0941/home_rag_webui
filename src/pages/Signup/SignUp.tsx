import "./SignUp.css"
import { useState } from "react";
import { useSignUp } from "../../scripts/authorization";
import Spinner from "../../components/spinner_loading/Spinner";
import { Link } from 'react-router-dom';
import logo from '/src/assets/logo.png'; 
import { useNavigate } from 'react-router-dom';
import { COOKIES } from "../../constants/constants";
import { cookies } from "../../scripts/cookies";

const SignUpPage = () => {
  const { 
    mutate: Signup, 
    isPending: isSignupPending, 
    // isSuccess: isSignupSuccess, 
    // isError: isSignupError, 
    // error: SignupError 
  } = useSignUp();  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordR, setRPassword] = useState("");
  const [SignupErrorText, setSignupError] = useState<string | null>(null);
  const navigate = useNavigate();

  const setRepeatPassword = (a: string) => {
    setRPassword(a);
    if (a !== password) {
      setSignupError("Passwords do not match");
    } else {
      setSignupError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordR !== password || !email) {
      return;
    }
    Signup({ email, password }, {
      onSuccess: (data) => {
        cookies.set(COOKIES.EMAIL, email)
        cookies.set(COOKIES.PASSWORD, password)
        cookies.set(COOKIES.USER_ID, data.user_id)
        navigate('/', { replace: true });
      },
      onError: (err) => {
        if (err.message.includes("Invalid email")) {
          setSignupError("Email does not exist");
        } else if (err.message.includes("Invalid password")) {
          setSignupError("Wrong password");
        } else if (err.message.includes("500")) {
          setSignupError("Internal server error");
        } else {
          setSignupError(err.message);
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
        <input
          type="password"
          value={passwordR}
          onChange={(e) => setRepeatPassword(e.target.value)}
          placeholder={"repeat password"}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          className="signup-button"
          disabled={email==="" || password.length < 5 || password !== passwordR || isSignupPending}
          onClick={(e) => handleSubmit(e)}
        >{!isSignupPending? "Sign-Up" : <Spinner/>}</button>
        <div className="error-msg">{SignupErrorText ? SignupErrorText : "\u00A0"}</div>
      </div>
      <Link to="/signin">
        Already have an account? Sign in
      </Link>
    </div>
  );
};

export default SignUpPage