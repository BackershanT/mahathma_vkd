import React, { useState, useContext } from 'react';
import './Login.css';
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../AuthContext/AuthContext';
import { db } from '../Firebase/Firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // First check hardcoded credentials
      const validCredentials = {
        'admin@gmail.com': { password: '123456', isAdmin: true },
        'user@gmail.com': { password: '123456', isAdmin: false }
      };

      if (validCredentials[email] && validCredentials[email].password === password) {
        const user = {
          email: email,
          isAdmin: validCredentials[email].isAdmin
        };
        
        login(user);
        alert("Login successful!");
        
        if (user.isAdmin) {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
        setIsLoading(false);
        return;
      }

      // If not found in hardcoded, check Firestore
      const usersQuery = query(collection(db, 'users'), where('email', '==', email));
      const usersSnapshot = await getDocs(usersQuery);
      
      if (!usersSnapshot.empty) {
        let userFound = false;
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.password === password) {
            const user = {
              email: email,
              isAdmin: userData.isAdmin || false
            };
            
            login(user);
            alert("Login successful!");
            
            if (user.isAdmin) {
              navigate('/dashboard');
            } else {
              navigate('/');
            }
            userFound = true;
          }
        });
        
        if (!userFound) {
          alert("Invalid email or password.");
        }
      } else {
        alert("Invalid email or password.");
      }
    } catch (error) {
      console.error('Login error:', error);
      alert("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Welcome Back</h2>
        <p>Login to your account to continue</p>
        <input
          type="email"
          placeholder="Email Address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <p className="login-footer">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
        <p className="setup-link">
          <a href="/setup">Need to create admin/member accounts? Click here</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
