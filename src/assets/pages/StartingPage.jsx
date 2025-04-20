import React from 'react';
import { useNavigate } from 'react-router-dom';

const StartingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <style jsx>{`
        .home-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          width: 100vw;
          background-color: #f3f4f6; /* Light gray background */
          background-image: url('/path/to/your/background-image.jpg'); /* Add background image */
          background-size: cover; /* Cover the entire background */
          background-position: center; /* Center the image */
        }

        .button-containers {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          align-items: center;
          padding: 20px; /* Add padding around buttons */
          background-color: white; /* White background for buttons */
          border-radius: 8px; /* Rounded corners */
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Add shadow */
        }

        .custom-button {
          padding: 12px 24px;
          font-weight: 600;
          color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow */
          transition: background 0.3s ease;
          width: 100%;
          max-width: 250px;
          text-align: center;
        }

        .custom-button.red {
          background-color: #ef4444;
        }

        .custom-button.red:hover {
          background-color: #dc2626;
        }

        .custom-button.blue {
          background-color: #3b82f6;
        }

        .custom-button.blue:hover {
          background-color: #2563eb;
        }

        .logo {
          position: absolute;
          top: 20px;
          left: 20px;
          width: 100px; /* Adjust size as needed */
        }
      `}</style>

      <div className="home-container">
        <img src="uiclogo.png" alt="University Logo" className="logo" /> {/* Add your logo */}
        <div className="button-containers">
          <button onClick={() => navigate('/check-status')} className="custom-button red">
            Check Evaluation Status
          </button>
          <button onClick={() => navigate('/login')} className="custom-button blue">
            Evaluate Now
          </button>
        </div>
      </div>
    </>
  );
};

export default StartingPage;
