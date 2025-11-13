import { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/api';
import './AdminPanel.css';

function AdminPanel({ currentUser, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banForm, setBanForm] = useState({ username: '', hours: '', deviceBan: false });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch(getApiUrl('/api/auth/users'), {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (username) => {
    if (!confirm(`Are you sure you want to delete ${username}'s account?`)) return;

    try {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch(getApiUrl(`/api/auth/account?username=${username}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({ targetUsername: username })
      });

      if (response.ok) {
        alert(`Account ${username} deleted successfully`);
        loadUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  const handleBan = async () => {
    if (!banForm.username) {
      alert('Please enter a username');
      return;
    }

    try {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch(getApiUrl('/api/auth/ban'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({
          targetUsername: targetUsername,
          banDuration: banForm.hours ? parseInt(banForm.hours) : null,
          deviceBan: banForm.deviceBan
        })
      });

      if (response.ok) {
        alert('User banned successfully');
        setBanForm({ username: '', hours: '', deviceBan: false });
        loadUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to ban user');
      }
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user');
    }
  };

  const handleUnban = async (username) => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch(getApiUrl('/api/auth/unban'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({ targetUsername: username })
      });

      if (response.ok) {
        alert('User unbanned successfully');
        loadUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to unban user');
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('Failed to unban user');
    }
  };

  if (loading) {
    return (
      <div className="admin-panel-overlay" onClick={onClose}>
        <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <h2>Admin Panel</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="ban-section">
          <h3>Ban User</h3>
          <div className="ban-form">
            <input
              type="text"
              placeholder="Username"
              value={banForm.username}
              onChange={(e) => setBanForm({ ...banForm, username: e.target.value })}
              className="ban-input"
            />
            <input
              type="number"
              placeholder="Hours (leave empty for permanent)"
              value={banForm.hours}
              onChange={(e) => setBanForm({ ...banForm, hours: e.target.value })}
              className="ban-input"
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={banForm.deviceBan}
                onChange={(e) => setBanForm({ ...banForm, deviceBan: e.target.checked })}
              />
              Device Ban
            </label>
            <button onClick={handleBan} className="ban-btn">Ban User</button>
          </div>
        </div>

        <div className="users-section">
          <h3>All Users ({users.length})</h3>
          <div className="users-list">
            {users.map((user) => {
              const isBanned = user.bannedUntil && new Date(user.bannedUntil) > new Date();
              return (
                <div key={user.username} className="user-item">
                  <div className="user-info">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.username} className="user-avatar-small" />
                    ) : (
                      <div className="user-avatar-small-placeholder">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <strong>{user.username}</strong>
                      {isBanned && (
                        <span className="banned-tag">
                          {user.deviceBanned ? 'Device Banned' : `Banned until ${new Date(user.bannedUntil).toLocaleString()}`}
                        </span>
                      )}
                      {user.reports && user.reports.length > 0 && (
                        <span className="reports-tag">{user.reports.length} report(s)</span>
                      )}
                    </div>
                  </div>
                  <div className="user-actions">
                    {isBanned ? (
                      <button onClick={() => handleUnban(user.username)} className="unban-btn">
                        Unban
                      </button>
                    ) : (
                      <button onClick={() => handleBan(user.username)} className="ban-btn-small">
                        Ban
                      </button>
                    )}
                    <button onClick={() => handleDeleteAccount(user.username)} className="delete-btn-small">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;

