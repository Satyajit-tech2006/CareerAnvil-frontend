import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Anvil, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner"; 
import apiClient, { setAccessToken } from "../../lib/api.js";
import { ENDPOINTS } from "../../lib/endpoints.js";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // --- VIEW STATE: 'login' | 'forgot-email' | 'forgot-otp' ---
  const [view, setView] = useState('login');

  // Login Form State
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = () => {
    window.location.href = "https://career-anvil-backend.vercel.app/api/v1/users/auth/google";
  };

  // 1. LOGIN LOGIC
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post(ENDPOINTS.USERS.LOGIN, formData);
      const { user, accessToken, refreshToken } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      setAccessToken(accessToken);

      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  // 2. SEND OTP LOGIC
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post(ENDPOINTS.USERS.FORGOT_PASSWORD, { email: forgotEmail });
      toast.success(`OTP sent to ${forgotEmail}`);
      setView('forgot-otp');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // 3. RESET PASSWORD LOGIC
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post(ENDPOINTS.USERS.RESET_PASSWORD, { 
        email: forgotEmail, 
        otp, 
        newPassword 
      });
      toast.success("Password reset successfully! Please login.");
      setView('login');
      setFormData({ ...formData, email: forgotEmail }); // Auto-fill email
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  
  // RENDER: LOGIN VIEW
  const renderLogin = () => (
    <>
      <div className="login-header">
        <h2>Welcome back</h2>
        <p>Sign in to your account to continue</p>
      </div>

      <button type="button" className="google-btn" onClick={handleGoogleLogin}>
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="google-icon" />
        Continue with Google
      </button>

      <div className="divider"><span>OR</span></div>

      <form className="login-form" onSubmit={handleLogin}>
        <div className="form-field">
          <label>Email Address</label>
          <div className="input-container">
            <Mail className="field-icon" size={18} />
            <input 
              type="email" name="email" placeholder="you@example.com" 
              value={formData.email} onChange={handleChange} required 
            />
          </div>
        </div>

        <div className="form-field">
          <div className="label-row">
            <label>Password</label>
            <span className="forgot-pass" onClick={() => setView('forgot-email')} style={{ cursor: 'pointer' }}>
              Forgot password?
            </span>
          </div>
          <div className="input-container">
            <Lock className="field-icon" size={18} />
            <input 
              type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" 
              value={formData.password} onChange={handleChange} required 
            />
            <button type="button" className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
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
    </>
  );

  // RENDER: FORGOT EMAIL VIEW
  const renderForgotEmail = () => (
    <>
      <div className="login-header">
        <h2>Reset Password</h2>
        <p>Enter your email to receive a verification code</p>
      </div>

      <form className="login-form" onSubmit={handleSendOtp}>
        <div className="form-field">
          <label>Email Address</label>
          <div className="input-container">
            <Mail className="field-icon" size={18} />
            <input 
              type="email" placeholder="you@example.com" 
              value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required 
              autoFocus
            />
          </div>
        </div>

        <button type="submit" className="login-submit-btn" disabled={loading}>
          {loading ? "Sending..." : "Send OTP Code"}
        </button>

        <button 
          type="button" 
          className="google-btn" 
          style={{ marginTop: '1rem', border: 'none', background: 'transparent' }} 
          onClick={() => setView('login')}
        >
          <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Back to Login
        </button>
      </form>
    </>
  );

  // RENDER: FORGOT OTP VIEW
  const renderForgotOtp = () => (
    <>
      <div className="login-header">
        <h2>Set New Password</h2>
        <p>Enter the code sent to {forgotEmail}</p>
      </div>

      <form className="login-form" onSubmit={handleResetPassword}>
        <div className="form-field">
          <label>OTP Code</label>
          <div className="input-container">
            <KeyRound className="field-icon" size={18} />
            <input 
              type="text" placeholder="123456" 
              value={otp} onChange={(e) => setOtp(e.target.value)} required 
              maxLength={6}
              style={{ letterSpacing: '2px', fontWeight: 'bold' }}
            />
          </div>
        </div>

        <div className="form-field">
          <label>New Password</label>
          <div className="input-container">
            <Lock className="field-icon" size={18} />
            <input 
              type="password" placeholder="New secure password" 
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required 
              minLength={6}
            />
          </div>
        </div>

        <button type="submit" className="login-submit-btn" disabled={loading}>
          {loading ? "Resetting..." : <>Reset Password <CheckCircle2 size={18} style={{marginLeft: '8px'}} /></>}
        </button>
        
        <button 
          type="button" 
          className="google-btn" 
          style={{ marginTop: '1rem', border: 'none', background: 'transparent' }} 
          onClick={() => setView('forgot-email')}
        >
           Change Email
        </button>
      </form>
    </>
  );

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-brand" onClick={() => navigate("/")}>
          <div className="brand-icon">
            <Anvil size={24} />
          </div>
          <span>CareerAnvil</span>
        </div>
        
        {/* CONDITIONAL RENDERING */}
        {view === 'login' && renderLogin()}
        {view === 'forgot-email' && renderForgotEmail()}
        {view === 'forgot-otp' && renderForgotOtp()}

      </div>
    </div>
  );
};

export default Login;