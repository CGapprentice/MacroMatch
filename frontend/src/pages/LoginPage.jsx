import React, { useState } from "react";
import { loginWithEmail, registerWithEmail } from "../firebase";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  function validateForm(data) {
    const errors = {};
    if (!data.email) errors.email = "Email is required";
    if (!data.password) errors.password = "Password is required";
    
    if (!isLogin) {
      if (data.password !== data.confirmPassword) {
        errors.confirmPassword = "Passwords don't match";
      }
      if (data.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
    }
    
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    setMessage("");

    try {
      let userCredential;
      
      if (isLogin) {
        userCredential = await loginWithEmail(formData.email, formData.password);
      } else {
        userCredential = await registerWithEmail(formData.email, formData.password);
      }

      // Get and store the Firebase ID token
      const idToken = await userCredential.user.getIdToken();
      localStorage.setItem("firebaseToken", idToken);
      
      // Navigate to dashboard - backend will verify token on protected API calls
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);

    } catch (error) {
      console.error("Auth error:", error);
      
      // Handle Firebase Auth errors
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setMessage("Invalid email or password");
          break;
        case 'auth/email-already-in-use':
          setMessage("Email already in use");
          break;
        case 'auth/weak-password':
          setMessage("Password is too weak");
          break;
        case 'auth/invalid-email':
          setMessage("Invalid email format");
          break;
        default:
          setMessage("Authentication failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>{isLogin ? "Login to MacroMatch" : "Create MacroMatch Account"}</h2>
        
        <input 
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        {errors.email && <div className="error">{errors.email}</div>}
        
        <input 
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
        {errors.password && <div className="error">{errors.password}</div>}
        
        {!isLogin && (
          <>
            <input 
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
            {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
          </>
        )}
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : (isLogin ? "Login" : "Create Account")}
        </button>
        
        <button 
          type="button" 
          onClick={() => setIsLogin(!isLogin)}
          className="toggle-auth"
        >
          {isLogin ? "Need an account? Register" : "Have an account? Login"}
        </button>
        
        {message && <div className="message">{message}</div>}
      </form>
    </div>
  );
};

export default LoginPage;
