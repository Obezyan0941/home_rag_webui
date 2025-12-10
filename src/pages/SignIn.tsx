import "./SignIn.css"
import { useState } from "react";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!isStreaming && value.trim()) {
  //     onChange("");
  //     onSubmit(value);
  //   }
  // };

  return (
    <div className="signin-page-container">
      <div className="signin-container">
        <h1>Sign in</h1>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={"email"}
          // onKeyDown={(e) => {
          //   if (e.key === 'Enter' && !e.shiftKey) {
          //     e.preventDefault();
          //     handleSubmit(e);
          //   }
          // }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={"password"}
        />
        <button
          className="signin-button"
          disabled={email==="" || password.length < 5}
        >Sign-In</button>
        <div className="error-msg">{"\u00A0"}</div>
      </div>
    </div>
  );
};

export default SignInPage