import { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/api';
import './UserSettings.css';

function UserSettings({ currentUser, onAccountDeleted, onLogout }) {
  const [profilePicture, setProfilePicture] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showProfileUpload, setShowProfileUpload] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const isAdmin = currentUser === 'Jack_dev';

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
          setShowProfileUpload(false);
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
          {profilePicture ? (
            <img src={profilePicture} alt="Profile" className="profile-preview" />
          ) : (
            <div className="profile-placeholder">
              {currentUser.charAt(0).toUpperCase()}
            </div>
          )}
          <button onClick={() => setShowProfileUpload(!showProfileUpload)} className="upload-btn">
            {profilePicture ? 'Change Picture' : 'Upload Picture'}
          </button>
          {showProfileUpload && (
            <div className="upload-section">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="file-input"
              />
            </div>
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

