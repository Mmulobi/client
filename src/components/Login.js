import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isRegister ? '/api/register' : '/api/login';
      const res = await axios.post(`http://localhost:5000${endpoint}`, { username, password });
      console.log('Auth response:', res.data);
      if (!isRegister) {
        onLogin(res.data.token, res.data.userId);
      } else {
        setIsRegister(false); // Switch to login after register
        console.log('Registered - now login');
      }
    } catch (err) {
      console.error('Auth error:', err.response?.data || err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="input-text"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="input-text"
      />
      <button type="submit" className="input-button">{isRegister ? 'Register' : 'Login'}</button>
      <button type="button" onClick={() => setIsRegister(!isRegister)} className="toggle-btn">
        {isRegister ? 'Switch to Login' : 'Switch to Register'}
      </button>
    </form>
  );
};

export default Login;