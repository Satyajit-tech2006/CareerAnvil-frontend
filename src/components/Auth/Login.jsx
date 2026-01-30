import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Anvil } from "lucide-react";
import { toast } from "sonner"; 
import apiClient, { setAccessToken } from "../../lib/api.js";
import { ENDPOINTS } from "../../lib/endpoints.js";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = () => {
    // Redirects browser to your Backend's Google Auth Endpoint
    window.location.href = "https://career-anvil-backend.vercel.app/api/v1/users/auth/google";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post(ENDPOINTS.USERS.LOGIN, formData);
      // Destructure expected data
      const { user, accessToken, refreshToken } = response.data.data;
      
      // --- CRITICAL FIX START ---
      // 1. Save tokens to LocalStorage immediately
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // 2. Set API client token
      setAccessToken(accessToken);
      // --- CRITICAL FIX END ---

      toast.success("Welcome back!");
      
      // 3. Navigate (Now ProtectedRoute will see the token)
      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "Invalid credentials.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
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

        {/* Google Button */}
        <button 
          type="button" 
          className="google-btn" 
          onClick={handleGoogleLogin}
        >
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google" 
            className="google-icon" 
          />
          Continue with Google
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {/* Email Field */}
          <div className="form-field">
            <label>Email Address</label>
            <div className="input-container">
              <Mail className="field-icon" size={18} />
              <input 
                type="email" 
                name="email"
                placeholder="you@example.com" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-field">
            <div className="label-row">
              <label>Password</label>
              <span className="forgot-pass">Forgot password?</span>
            </div>
            <div className="input-container">
              <Lock className="field-icon" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                placeholder="••••••••" 
                value={formData.password}
                onChange={handleChange}
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

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? "Signing in..." : <>Sign In <ArrowRight size={18} style={{marginLeft: '8px'}} /></>}
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