import { useState, useEffect } from 'react';
import Login from './components/Login';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import UserSettings from './components/UserSettings';
import UserProfile from './components/UserProfile';
import AdminPanel from './components/AdminPanel';
import { initSocket, disconnectSocket, getSocket } from './utils/socket';
import { getApiUrl } from './utils/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatType, setChatType] = useState(null); // 'private' or 'group'
  const [showSettings, setShowSettings] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const isAdmin = user?.username === 'Jack_dev' || user?.username === 'jack_dev';

  useEffect(() => {
    // Check for existing session
    const sessionId = localStorage.getItem('sessionId');
    const username = localStorage.getItem('username');

    if (sessionId && username) {
      // Verify session with backend
      fetch(getApiUrl('/api/auth/verify'), {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            setUser({ username, sessionId });
            initSocket(sessionId, username);
          } else {
            localStorage.removeItem('sessionId');
            localStorage.removeItem('username');
          }
        })
        .catch(() => {
          localStorage.removeItem('sessionId');
          localStorage.removeItem('username');
        });
    }

    return () => {
      disconnectSocket();
    };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('sessionId', userData.sessionId);
    localStorage.setItem('username', userData.username);
    initSocket(userData.sessionId, userData.username);
  };

  const handleLogout = () => {
    if (user?.sessionId) {
      fetch(getApiUrl('/api/auth/logout'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId: user.sessionId })
      });
    }
    disconnectSocket();
    setUser(null);
    setSelectedChat(null);
    setChatType(null);
    setShowSettings(false);
    localStorage.removeItem('sessionId');
    localStorage.removeItem('username');
  };

  const handleAccountDeleted = () => {
    // Account was deleted, clear everything
    disconnectSocket();
    setUser(null);
    setSelectedChat(null);
    setChatType(null);
    setShowSettings(false);
    localStorage.removeItem('sessionId');
    localStorage.removeItem('username');
  };

  const handleSelectChat = (chatId, type) => {
    setSelectedChat(chatId);
    setChatType(type);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Message App</h1>
        <div className="user-info">
          <span className="username">{user.username}</span>
          {isAdmin && (
            <button onClick={() => setShowAdminPanel(!showAdminPanel)} className="admin-btn">
              🛡️ Admin
            </button>
          )}
          <button onClick={() => setShowSettings(!showSettings)} className="settings-btn">
            ⚙️ Settings
          </button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
      {showSettings && (
        <UserSettings
          currentUser={user.username}
          onAccountDeleted={handleAccountDeleted}
          onLogout={handleLogout}
        />
      )}
      {viewingProfile && (
        <UserProfile
          username={viewingProfile}
          currentUser={user.username}
          onClose={() => setViewingProfile(null)}
        />
      )}
      {showAdminPanel && isAdmin && (
        <AdminPanel
          currentUser={user.username}
          onClose={() => setShowAdminPanel(false)}
        />
      )}
      <div className="app-content">
        <ChatList
          currentUser={user.username}
          onSelectChat={handleSelectChat}
          selectedChat={selectedChat}
          onViewProfile={setViewingProfile}
        />
        {selectedChat ? (
          <ChatWindow
            chatId={selectedChat}
            chatType={chatType}
            currentUser={user.username}
          />
        ) : (
          <div className="no-chat-selected">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

