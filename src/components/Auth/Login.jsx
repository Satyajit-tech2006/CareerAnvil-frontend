import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this
import { Eye, EyeOff, Mail, Lock, ArrowRight, Anvil } from "lucide-react";
import "./Login.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Logic for backend auth will go here later
    navigate("/dashboard");
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-brand" onClick={() => navigate("/")}>
          <div className="brand-icon">
            <Anvil size={24} />
          </div>
          <span>CareerAnvil</span>
        </div>
        
        <div className="login-header">
          <h2>Welcome back</h2>
          <p>Sign in to your account to continue</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-field">
            <label>Email Address</label>
            <div className="input-container">
              <Mail className="field-icon" size={18} />
              <input type="email" placeholder="you@example.com" required />
            </div>
          </div>

          <div className="form-field">
            <div className="label-row">
              <label>Password</label>
              <span className="forgot-pass">Forgot password?</span>
            </div>
            <div className="input-container">
              <Lock className="field-icon" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                required 
              />
              <button 
                type="button" 
                className="eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit-btn">
            Sign In <ArrowRight size={18} style={{marginLeft: '8px'}} />
          </button>
        </form>

        <div className="login-footer">
          New to CareerAnvil? <span className="signup-trigger" onClick={() => navigate("/signup")}>Create account</span>
        </div>
      </div>
    </div>
  );
};

export default Login;