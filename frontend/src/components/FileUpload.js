import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FileUpload.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

function FileUpload() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [mountInfo, setMountInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFiles();
    fetchMountInfo();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/files/list`);
      setFiles(response.data);
    } catch (error) {
      showMessage('Failed to fetch files: ' + error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchMountInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/files/mount-info`);
      setMountInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch mount info:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage({ text: `Selected: ${file.name} (${formatFileSize(file.size)})`, type: 'info' });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showMessage('Please select a file first', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/files/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showMessage(`File uploaded successfully: ${response.data.originalFilename}`, 'success');
      setSelectedFile(null);
      // Reset file input
      document.getElementById('file-input').value = '';
      fetchFiles();
    } catch (error) {
      showMessage('Upload failed: ' + (error.response?.data?.message || error.message), 'danger');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/files/download/${filename}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showMessage('Download failed: ' + error.message, 'danger');
    }
  };

  const handleDelete = async (filename) => {
    if (window.confirm(`Are you sure you want to delete ${filename}?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/files/delete/${filename}`);
        showMessage('File deleted successfully', 'success');
        fetchFiles();
      } catch (error) {
        showMessage('Delete failed: ' + error.message, 'danger');
      }
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="file-upload-container">
      {/* Mount Info Card */}
      {mountInfo && (
        <div className="mount-info-card">
          <div className="mount-info-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
            </svg>
            <span>存储挂载信息</span>
            <span className="mount-type-badge">{mountInfo.mountType === 'obs' ? 'OBS' : '本地'}</span>
          </div>
          <div className="mount-info-body">
            <div className="mount-info-item">
              <span className="label">挂载类型:</span>
              <span className="value">{mountInfo.mountType === 'obs' ? '华为云OBS对象存储' : '本地文件系统'}</span>
            </div>
            <div className="mount-info-item">
              <span className="label">存储路径:</span>
              <span className="value">{mountInfo.uploadDir}</span>
            </div>
            {mountInfo.absolutePath && (
              <div className="mount-info-item">
                <span className="label">绝对路径:</span>
                <span className="value">{mountInfo.absolutePath}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="upload-section">
        <h5>上传文件</h5>
        <div className="upload-area">
          <input
            type="file"
            id="file-input"
            onChange={handleFileSelect}
            className="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
            </svg>
            <span>{selectedFile ? selectedFile.name : '点击选择文件或拖拽到此处'}</span>
            {selectedFile && (
              <span className="file-size">{formatFileSize(selectedFile.size)}</span>
            )}
          </label>
        </div>
        
        <button 
          className="btn btn-primary upload-btn" 
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              上传中...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="me-2">
                <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
              </svg>
              上传
            </>
          )}
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
        </div>
      )}

      {/* File List */}
      <div className="file-list-section">
        <div className="file-list-header">
          <h5>文件列表</h5>
          <button className="btn btn-sm btn-outline-primary" onClick={fetchFiles}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="me-1">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            刷新
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
            </svg>
            <p>暂无上传文件</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>文件名</th>
                  <th>大小</th>
                  <th>上传时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, index) => (
                  <tr key={index}>
                    <td>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="me-2 text-muted">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      </svg>
                      {file.filename}
                    </td>
                    <td>{formatFileSize(file.fileSize)}</td>
                    <td>{formatDate(file.lastModified)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => handleDownload(file.filename)}
                      >
                        下载
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(file.filename)}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
