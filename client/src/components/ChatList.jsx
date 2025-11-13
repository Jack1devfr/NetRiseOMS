import { useState, useEffect } from 'react';
import { getSocket } from '../utils/socket';
import './ChatList.css';

function ChatList({ currentUser, onSelectChat, selectedChat, onViewProfile }) {
  const [privateChats, setPrivateChats] = useState([]);
  const [groups, setGroups] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Request available users
    socket.emit('getAvailableUsers');
    socket.emit('getMyGroups');

    // Listen for available users
    socket.on('availableUsers', (users) => {
      setAvailableUsers(users);
      // Initialize private chats for each user
      // Generate consistent chat IDs by sorting usernames
      const chats = users.map(username => {
        const sortedUsernames = [currentUser, username].sort();
        return {
          id: `private_${sortedUsernames[0]}_${sortedUsernames[1]}`,
          name: username,
          type: 'private'
        };
      });
      setPrivateChats(chats);
    });

    // Listen for groups
    socket.on('myGroups', (userGroups) => {
      setGroups(userGroups.map(group => ({
        id: group.id,
        name: group.name,
        type: 'group',
        members: group.members
      })));
    });

    // Listen for new group created
    socket.on('groupCreated', (group) => {
      setGroups(prev => [...prev, {
        id: group.id,
        name: group.name,
        type: 'group',
        members: group.members
      }]);
      setShowCreateGroup(false);
      setNewGroupName('');
      setSelectedUsers([]);
    });

    // Listen for online users
    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    socket.on('userOnline', (username) => {
      setOnlineUsers(prev => [...prev, username]);
    });

    socket.on('userOffline', (username) => {
      setOnlineUsers(prev => prev.filter(u => u !== username));
    });

    return () => {
      socket.off('availableUsers');
      socket.off('myGroups');
      socket.off('groupCreated');
      socket.off('onlineUsers');
      socket.off('userOnline');
      socket.off('userOffline');
    };
  }, [currentUser]);

  const handleCreateGroup = () => {
    const socket = getSocket();
    if (!socket || !newGroupName.trim() || selectedUsers.length === 0) return;

    socket.emit('createGroup', {
      groupName: newGroupName.trim(),
      members: selectedUsers
    });
  };

  const toggleUserSelection = (username) => {
    setSelectedUsers(prev =>
      prev.includes(username)
        ? prev.filter(u => u !== username)
        : [...prev, username]
    );
  };

  const getChatDisplayName = (chat) => {
    if (chat.type === 'group') {
      return chat.name;
    }
    return chat.name;
  };

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2>Chats</h2>
        <button
          onClick={() => setShowCreateGroup(!showCreateGroup)}
          className="create-group-btn"
        >
          + New Group
        </button>
      </div>

      {showCreateGroup && (
        <div className="create-group-panel">
          <input
            type="text"
            placeholder="Group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="group-name-input"
          />
          <div className="user-selection">
            <p>Select members:</p>
            {availableUsers.map(username => (
              <label key={username} className="user-checkbox">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(username)}
                  onChange={() => toggleUserSelection(username)}
                />
                <span>{username}</span>
              </label>
            ))}
          </div>
          <div className="create-group-actions">
            <button onClick={handleCreateGroup} className="create-btn">
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateGroup(false);
                setNewGroupName('');
                setSelectedUsers([]);
              }}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="chat-sections">
        <div className="chat-section">
          <h3>Private Chats</h3>
          <div className="chat-items">
            {privateChats.map(chat => (
              <div
                key={chat.id}
                className={`chat-item ${selectedChat === chat.id ? 'active' : ''}`}
              >
                <div 
                  className="chat-item-content"
                  onClick={() => onSelectChat(chat.id, 'private')}
                >
                  <div className="chat-avatar">
                    {getChatDisplayName(chat).charAt(0).toUpperCase()}
                  </div>
                  <div className="chat-info">
                    <div className="chat-name-row">
                      <span className="chat-name">{getChatDisplayName(chat)}</span>
                      {onlineUsers.includes(chat.name) && (
                        <span className="online-indicator">●</span>
                      )}
                    </div>
                    <span className="chat-type">Private</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProfile(chat.name);
                  }}
                  className="profile-view-btn"
                  title="View profile"
                >
                  👤
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-section">
          <h3>Groups</h3>
          <div className="chat-items">
            {groups.map(group => (
              <div
                key={group.id}
                className={`chat-item ${selectedChat === group.id ? 'active' : ''}`}
                onClick={() => onSelectChat(group.id, 'group')}
              >
                <div className="chat-item-content">
                  <div className="chat-avatar group-avatar">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="chat-info">
                    <span className="chat-name">{group.name}</span>
                    <span className="chat-type">
                      {group.members?.length || 0} members
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatList;

