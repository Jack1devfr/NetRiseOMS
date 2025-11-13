import { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/api';
import './UserSettings.css';

function UserSettings({ currentUser, onAccountDeleted, onLogout }) {
  const [profilePicture, setProfilePicture] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [accountId, setAccountId] = useState(null);
  const isAdmin = currentUser === 'Jack_dev' || currentUser === 'jack_dev';

  useEffect(() => {
    loadProfile();
    if (isAdmin) {
      loadAllUsers();
    }
  }, [currentUser, isAdmin]);

  const loadProfile = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch(getApiUrl(`/api/auth/profile?username=${currentUser}`), {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProfilePicture(data.profilePicture);
        setAccountId(data.accountId);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadAllUsers = async () => {
    // For admin, we'd need an endpoint to get all users
    // For now, we'll just show a delete button for current user
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        const sessionId = localStorage.getItem('sessionId');
        const response = await fetch(getApiUrl('/api/auth/profile/picture'), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`
          },
          body: JSON.stringify({ profilePicture: base64String })
        });

        if (response.ok) {
          const data = await response.json();
          setProfilePicture(data.profilePicture);
          alert('Profile picture updated!');
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Failed to upload profile picture');
        }
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        alert('Failed to upload profile picture');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = async (targetUsername = null) => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      const usernameToDelete = targetUsername || currentUser;
      
      const response = await fetch(getApiUrl(`/api/auth/account?username=${usernameToDelete}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify({ targetUsername: usernameToDelete })
      });

      if (response.ok) {
        if (usernameToDelete === currentUser) {
          onLogout();
          onAccountDeleted();
        } else {
          alert(`Account ${usernameToDelete} deleted successfully`);
          setShowDeleteConfirm(false);
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  return (
    <div className="user-settings">
      <div className="settings-section">
        <h3>Profile Picture</h3>
        <div className="profile-picture-section">
          <label htmlFor="profile-picture-input" className="profile-picture-label">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="profile-preview" />
            ) : (
              <div className="profile-placeholder">
                {currentUser.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="profile-overlay">
              <span>Click to upload</span>
            </div>
          </label>
          <input
            id="profile-picture-input"
            type="file"
            accept="image/*"
            onChange={handleProfilePictureUpload}
            className="file-input-hidden"
          />
          {accountId && (
            <p className="account-id">Account ID: <strong>{accountId}</strong></p>
          )}
        </div>
      </div>

      <div className="settings-section">
        <h3>Account Management</h3>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="delete-account-btn"
        >
          Delete My Account
        </button>
        {showDeleteConfirm && (
          <div className="delete-confirm">
            <p>Are you sure you want to delete your account? This cannot be undone.</p>
            <div className="confirm-buttons">
              <button onClick={() => handleDeleteAccount()} className="confirm-delete-btn">
                Yes, Delete
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserSettings;

