import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './theme.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated') === 'true';
    const user = localStorage.getItem('username') || '';
    setIsAuthenticated(auth);
    setUsername(user);
  }, []);

  return (
    <div className="App">
      {isAuthenticated ? (
        <Dashboard onLogout={setIsAuthenticated} username={username} />
      ) : (
        <Login onLogin={setIsAuthenticated} />
      )}
    </div>
  );
}

export default App;
