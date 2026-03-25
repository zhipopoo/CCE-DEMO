import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import axios from 'axios';
import FileUpload from './FileUpload';
import './Dashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

function Dashboard({ onLogout, username }) {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      showMessage(t('user.fetchFailed') + ': ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/users/${editingId}`, formData);
        showMessage(t('user.updated'), 'success');
      } else {
        await axios.post(`${API_BASE_URL}/users`, formData);
        showMessage(t('user.created'), 'success');
      }
      setFormData({ name: '', email: '', phone: '' });
      setEditingId(null);
      fetchUsers();
    } catch (error) {
      showMessage(t('user.failed') + ': ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone
    });
    setEditingId(user.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('user.confirmDelete'))) {
      setLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/users/${id}`);
        showMessage(t('user.deleted'), 'success');
        fetchUsers();
      } catch (error) {
        showMessage(t('user.deleteFailed') + ': ' + error.message, 'danger');
      } finally {
        setLoading(false);
      }
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', phone: '' });
    setEditingId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    onLogout(false);
  };

  return (
    <div className="dashboard">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary professional-nav">
        <div className="container">
          <span className="navbar-brand">
            <svg width="32" height="32" viewBox="0 0 60 60" fill="none" className="nav-logo">
              <circle cx="30" cy="30" r="28" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M30 15L40 25H20L30 15Z" fill="white"/>
              <path d="M30 45L20 35H40L30 45Z" fill="white"/>
              <circle cx="30" cy="30" r="8" fill="white"/>
            </svg>
            CCE Demo Platform
          </span>
          <div className="navbar-nav ml-auto">
            <span className="nav-item nav-link user-info">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="user-icon">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
              {t('nav.welcome')}, {username}
            </span>
            <LanguageSwitcher />
            <button className="btn btn-outline-light btn-sm logout-btn" onClick={handleLogout}>
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        {/* Tab Navigation */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              {t('user.title')}
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'files' ? 'active' : ''}`}
              onClick={() => setActiveTab('files')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="me-2">
                <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
              </svg>
              {t('file.title')}
            </button>
          </li>
        </ul>

        {activeTab === 'files' ? (
          <FileUpload />
        ) : (
        <>
        {message.text && (
          <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
            {message.text}
            <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
          </div>
        )}

        <div className="row">
          <div className="col-md-4">
            <div className="card professional-card">
              <div className="card-header">
                <h5 className="mb-0">
                  {editingId ? t('user.edit') : t('user.addNew')}
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">{t('user.name')}</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t('user.email')}</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t('user.phone')}</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? t('common.loading') : (editingId ? t('user.updated').split('!')[0] : t('user.created').split('!')[0])}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCancel}
                      >
                        {t('user.cancel')}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card professional-card">
              <div className="card-header">
                <h5 className="mb-0">{t('user.title')}</h5>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>{t('user.name')}</th>
                          <th>{t('user.email')}</th>
                          <th>{t('user.phone')}</th>
                          <th>{t('user.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center">
                              {t('user.noUsers')}
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => (
                            <tr key={user.id}>
                              <td>{user.id}</td>
                              <td>{user.name}</td>
                              <td>{user.email}</td>
                              <td>{user.phone || '-'}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-info me-2"
                                  onClick={() => handleEdit(user)}
                                >
                                  {t('user.editBtn')}
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDelete(user.id)}
                                >
                                  {t('user.deleteBtn')}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
