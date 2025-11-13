import { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/api';
import './UserProfile.css';

function UserProfile({ username, currentUser, onClose }) {
  const [profile, setProfile] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [loading, setLoading] = useState(true);
  const isAdmin = currentUser === 'Jack_dev' || currentUser === 'jack_dev';
  const isOwnProfile = currentUser === username;

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch(getApiUrl(`/api/auth/profile?username=${username}`), {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      alert('Please provide a reason for reporting');
      return;
    }

    try {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch(getApiUrl('/api/auth/report'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({
          reportedUsername: username,
          reason: reportReason.trim()
        })
      });

      if (response.ok) {
        alert('User reported successfully');
        setShowReport(false);
        setReportReason('');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to report user');
      }
    } catch (error) {
      console.error('Error reporting user:', error);
      alert('Failed to report user');
    }
  };

  if (loading) {
    return (
      <div className="user-profile-overlay" onClick={onClose}>
        <div className="user-profile" onClick={(e) => e.stopPropagation()}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="user-profile-overlay" onClick={onClose}>
        <div className="user-profile" onClick={(e) => e.stopPropagation()}>
          <p>User not found</p>
          <button onClick={onClose} className="close-btn">Close</button>
        </div>
      </div>
    );
  }

  const isBanned = profile.bannedUntil && new Date(profile.bannedUntil) > new Date();

  return (
    <div className="user-profile-overlay" onClick={onClose}>
      <div className="user-profile" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <h2>{profile.username}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        {profile.accountId && (
          <div className="account-id-display">
            Account ID: <strong>{profile.accountId}</strong>
          </div>
        )}

        <div className="profile-picture-section">
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt="Profile" className="profile-large" />
          ) : (
            <div className="profile-large-placeholder">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {isBanned && (
          <div className="banned-badge">
            {profile.deviceBanned ? 'Device Banned' : `Banned until: ${new Date(profile.bannedUntil).toLocaleString()}`}
          </div>
        )}

        {isAdmin && profile.reports && profile.reports.length > 0 && (
          <div className="reports-section">
            <h3>Reports ({profile.reports.length})</h3>
            {profile.reports.map((report, index) => (
              <div key={index} className="report-item">
                <p><strong>{report.reportedBy}</strong>: {report.reason}</p>
                <span className="report-time">{new Date(report.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {!isOwnProfile && !isAdmin && (
          <div className="profile-actions">
            <button onClick={() => setShowReport(!showReport)} className="report-btn">
              Report User
            </button>
            {showReport && (
              <div className="report-form">
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Reason for reporting..."
                  className="report-textarea"
                />
                <div className="report-buttons">
                  <button onClick={handleReport} className="submit-report-btn">
                    Submit Report
                  </button>
                  <button onClick={() => {
                    setShowReport(false);
                    setReportReason('');
                  }} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;

