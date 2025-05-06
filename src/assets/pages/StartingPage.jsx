import React from 'react';
import { useNavigate } from 'react-router-dom';

const COLLEGE_NAME = 'Automated Course Evaluation';

const StartingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <style jsx>{`
        .home-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          width: 100vw;
          background-color: #f3f4f6;
          background-size: cover;
          background-position: center;
        }

        .logos-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 18px;
          margin-top: 0;
        }

        .logo-img {
          height: 180px;
          width: auto;
          object-fit: contain;
          display: block;
        }
        

        .content-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 24px 24px 24px;
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.10);
          min-width: 340px;
          position: relative;
        }

        .college-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #22223b;
          text-align: center;
          margin-bottom: 24px;
          margin-top: 4px;
          line-height: 1.4;
          letter-spacing: 0.01em;
        }

        .button-containers {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          align-items: center;
          width: 100%;
        }

        .custom-button {
          position: relative;
          padding: 16px 24px 12px 24px;
          font-weight: 600;
          color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: background 0.3s, box-shadow 0.2s;
          width: 100%;
          max-width: 250px;
          text-align: center;
          font-size: 1.12rem;
          border: none;
          outline: none;
          cursor: pointer;
          margin-bottom: 0;
        }

        .custom-button.red {
          background-color: #f55d5d;
        }
        .custom-button.red:hover, .custom-button.red:focus {
          background-color: #B32F2F;
        }

        .custom-button.blue {
          background-color: #3b82f6;
        }
        .custom-button.blue:hover, .custom-button.blue:focus {
          background-color: #2563eb;
        }

        .button-subtext {
          display: block;
          font-size: 0.85rem;
          color: #f9fafb;
          opacity: 0.85;
          margin-top: 4px;
          font-weight: 400;
          letter-spacing: 0.01em;
          pointer-events: none;
          user-select: none;
        }

        @media (max-width: 600px) {
          .content-box {
            min-width: 0;
            width: 90vw;
            padding: 18px 6vw 16px 6vw;
          }
          .logos-wrapper {
            gap: 8px;
            margin-bottom: 10px;
          }
          .logo-img {
            height: 42px;
          }
          .college-name {
            font-size: 0.96rem;
            margin-bottom: 16px;
          }
        }
      `}</style>

      <div className="home-container">
        {/* LOGOS OUTSIDE CONTENT BOX */}
        <div className="logos-wrapper" role="img" aria-label="UIC and CCS Logos">
          <img
            src="/uiclogo.png"
            
            className="logo-img"
            draggable={false}
          />
          <img
            src="/ccslogo.png"
            alt="College of Computer Science Logo"
            className="logo-img"
            draggable={false}
          />
        </div>
        <div className="content-box">
          <div className="college-name">{COLLEGE_NAME}</div>
          <div className="button-containers">
            <button
              onClick={() => navigate('/check-status')}
              className="custom-button red"
              type="button"
              aria-label="Check Evaluation Status"
            >
              Check Evaluation Status
              <span className="button-subtext">Students click here</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="custom-button blue"
              type="button"
              aria-label="Evaluate Now"
            >
              Evaluate Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StartingPage;