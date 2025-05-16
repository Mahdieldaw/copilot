import { useState } from 'react';
import './App.css';
import { AuthDemo } from './views';

function AppWithAuth() {
  const [showOriginalApp, setShowOriginalApp] = useState(false);

  return (
    <div className="app-container">
      {/* Toggle button to switch between original app and auth demo */}
      <div className="app-toggle">
        <button 
          onClick={() => setShowOriginalApp(!showOriginalApp)}
          className="toggle-button"
        >
          {showOriginalApp ? 'Show Auth Demo' : 'Show Original App'}
        </button>
      </div>

      {/* Conditionally render either the original app or the auth demo */}
      {showOriginalApp ? (
        <div className="placeholder-message">
          <h2>Original App</h2>
          <p>The original app would be displayed here.</p>
          <p>Switch back to see the Authentication Demo.</p>
        </div>
      ) : (
        <AuthDemo />
      )}

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          background-color: #f9f9f9;
        }
        
        .app-toggle {
          padding: 1rem;
          display: flex;
          justify-content: flex-end;
          background-color: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .toggle-button {
          background-color: #2196f3;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .toggle-button:hover {
          background-color: #1976d2;
        }
        
        .placeholder-message {
          max-width: 600px;
          margin: 4rem auto;
          padding: 2rem;
          text-align: center;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .placeholder-message h2 {
          margin-top: 0;
          color: #333;
        }
        
        .placeholder-message p {
          color: #666;
        }
      `}</style>
    </div>
  );
}

export default AppWithAuth;