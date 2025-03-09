import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>
        {`
            .home-container {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh; /* Full screen height */
                width: 100vw; /* Full screen width */
                background-color: #f3f4f6; /* Light gray background */
            }

            .button-container {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
                align-items: center;
            }

            .custom-button {
                padding: 12px 24px;
                font-weight: 600;
                color: white;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

                    `}
      </style>

      <div className="home-container">
        <div className="button-container">
          <button onClick={() => navigate('/route1')} className="custom-button red">
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

export default HomePage;
