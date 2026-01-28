import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Hash, ArrowRight, Anvil } from "lucide-react";
import { toast } from "sonner";
import apiClient from "../../lib/api.js";
import { ENDPOINTS } from "../../lib/endpoints.js";
import "./Login.css";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- NEW: Google Login Handler ---
  const handleGoogleSignup = () => {
    // Same URL as login - Google handles both scenarios
    window.location.href = "https://career-anvil-backend.vercel.app/api/v1/users/auth/google";
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post(ENDPOINTS.USERS.REGISTER, formData);
      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "Registration failed.";
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
          <h2>Create Account</h2>
          <p>Join the ecosystem for developers</p>
        </div>

        {/* --- NEW: Google Button --- */}
        <button 
          type="button" 
          className="google-btn" 
          onClick={handleGoogleSignup}
        >
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google" 
            className="google-icon" 
          />
          Sign up with Google
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        <form className="login-form" onSubmit={handleSignup}>
          
          {/* Full Name Field */}
          <div className="form-field">
            <label>Full Name</label>
            <div className="input-container">
              <User className="field-icon" size={18} />
              <input 
                type="text" 
                name="name"
                placeholder="John Doe" 
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          {/* Username Field */}
          <div className="form-field">
            <label>Username</label>
            <div className="input-container">
              <Hash className="field-icon" size={18} />
              <input 
                type="text" 
                name="username"
                placeholder="johndoe123" 
                value={formData.username}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

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
            <label>Password</label>
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
            {loading ? "Creating..." : <>Sign Up <ArrowRight size={18} style={{marginLeft: '8px'}} /></>}
          </button>
        </form>

        <div className="login-footer">
          Already have an account? <span className="signup-trigger" onClick={() => navigate("/login")}>Log in</span>
        </div>
      </div>
    </div>
  );
};

export default Signup;