import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Login.css';

function Login({ onLogin }) {
  const { t } = useTranslation();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simple authentication (in production, this should be server-side)
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', credentials.username);
      onLogin(true);
    } else {
      setError(t('login.error'));
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-header">
            <div className="logo-container">
              <div className="logo-icon">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  <circle cx="30" cy="30" r="28" stroke="#2563eb" strokeWidth="2" fill="white"/>
                  <path d="M30 15L40 25H20L30 15Z" fill="#2563eb"/>
                  <path d="M30 45L20 35H40L30 45Z" fill="#2563eb"/>
                  <circle cx="30" cy="30" r="8" fill="#2563eb"/>
                </svg>
              </div>
              <h1>{t('login.title')}</h1>
              <p className="subtitle">{t('login.subtitle')}</p>
            </div>
          </div>

          <div className="tech-intro">
            <div className="tech-card">
              <div className="tech-icon docker-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M40 20H36V16H32V20H28V16H24V20H20V16H16V20H12V16H8V20H4C4 20 4 28 8 32C12 36 20 36 20 36H36C36 36 40 36 44 32C48 28 48 20 48 20H40V20Z" fill="#2496ED"/>
                  <rect x="10" y="22" width="4" height="4" fill="white"/>
                  <rect x="16" y="22" width="4" height="4" fill="white"/>
                  <rect x="22" y="22" width="4" height="4" fill="white"/>
                  <rect x="28" y="22" width="4" height="4" fill="white"/>
                  <rect x="34" y="22" width="4" height="4" fill="white"/>
                </svg>
              </div>
              <h3>Docker Container</h3>
              <p>Lightweight, standalone, executable package that includes everything needed to run applications</p>
            </div>

            <div className="tech-card">
              <div className="tech-icon k8s-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="#326CE5" strokeWidth="3" fill="white"/>
                  <path d="M24 8L28 16H20L24 8Z" fill="#326CE5"/>
                  <path d="M24 40L20 32H28L24 40Z" fill="#326CE5"/>
                  <path d="M8 24L16 20V28L8 24Z" fill="#326CE5"/>
                  <path d="M40 24L32 28V20L40 24Z" fill="#326CE5"/>
                  <circle cx="24" cy="24" r="6" fill="#326CE5"/>
                </svg>
              </div>
              <h3>Kubernetes Orchestration</h3>
              <p>Automated deployment, scaling, and management of containerized applications</p>
            </div>

            <div className="tech-card">
              <div className="tech-icon cloud-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M38 32H12C8 32 4 28 4 24C4 20 8 16 12 16C12 10 18 6 24 6C30 6 36 10 36 16C40 16 44 20 44 24C44 28 40 32 38 32Z" fill="#2563eb"/>
                  <path d="M16 38L20 42L24 38L28 42L32 38" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Cloud Native</h3>
              <p>Build and run scalable applications in modern, dynamic environments</p>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-container">
            <div className="login-form-header">
              <h2>{t('login.welcome')}</h2>
              <p>{t('login.signIn')}</p>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username">{t('login.username')}</label>
                <div className="input-group">
                  <span className="input-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    placeholder={t('login.username')}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">{t('login.password')}</label>
                <div className="input-group">
                  <span className="input-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder={t('login.password')}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-login" disabled={loading}>
                {loading ? t('login.signingIn') : t('login.signInBtn')}
              </button>

              <div className="login-footer">
                <p>{t('login.demo')}</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
