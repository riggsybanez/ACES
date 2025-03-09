import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/authService'; // Import Firestore
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';


const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const evaluatorCredentials = {
    username: 'evaluator',
    password: 'evaluator123',
  };

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      // Access the specific Admin document
      const adminDocRef = doc(db, 'Admin', 'Admin');
      const adminDocSnap = await getDoc(adminDocRef);
  
      if (adminDocSnap.exists()) {
        const adminData = adminDocSnap.data();
        
        // Check if the password matches
        if (adminData.Password === password) {
          navigate('/admin-dashboard');
        } else {
          setError('Invalid password. Please try again.');
        }
      } else {
        setError('Admin not found.');
      }
    } catch (err) {
      console.error('Error fetching admin:', err);
      setError('An error occurred. Please try again.');
    }
  };


  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">User Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="login-button">
            Login
          </button>
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

  .login-button {
    width: 90%;
    padding: 10px;
    background-color:rgb(233, 97, 97);
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .login-button:hover {
    background-color: #2563eb;
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
