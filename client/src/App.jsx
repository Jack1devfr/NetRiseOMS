import { useState, useEffect } from 'react';
import Login from './components/Login';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import { initSocket, disconnectSocket, getSocket } from './utils/socket';
import { getApiUrl } from './utils/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatType, setChatType] = useState(null); // 'private' or 'group'

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
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
      <div className="app-content">
        <ChatList
          currentUser={user.username}
          onSelectChat={handleSelectChat}
          selectedChat={selectedChat}
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

