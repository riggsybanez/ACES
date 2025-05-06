import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if both fields are empty
    if (!username.trim() && !password.trim()) {
      setError('Please fill in both the ID and password to log in.');
      setLoading(false);
      return;
    }

    try {
      const result = await login(username, password);
      
      if (result.success) {
        if (result.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/evaluator-dashboard');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid credentials. Please try again.');
    }
    
    setLoading(false);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">User Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="ID"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <div className="button-container">
            <button 
              type="button" 
              className="back-button" 
              onClick={handleBack}
              disabled={loading}
            >
              Back
            </button>
            <button 
              type="submit" 
              className="login-button" 
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

// CSS inside the JSX file
const styles = `
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    background: white;
    position: fixed;
    top: 0;
    left: 0;
  }

  .login-card {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
    width: 350px;
    text-align: center;
  }

  .login-title {
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: black;
  }

  .input-field {
    width: 90%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .button-container {
    display: flex;
    justify-content: space-between;
    width: 90%;
    margin: 0 auto;
  }

  .login-button {
    width: 48%;
    padding: 10px;
    background-color: rgb(233, 97, 97);
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .back-button {
    width: 48%;
    padding: 10px;
    background-color: #6c757d;
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .login-button:hover {
    background-color: #d84545;
  }

  .back-button:hover {
    background-color: #5a6268;
  }

  .error-message {
    color: red;
    text-align: center;
    margin-bottom: 10px;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);