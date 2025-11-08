import { useState, useEffect, useRef } from 'react';
import { getSocket } from '../utils/socket';
import MessageInput from './MessageInput';
import './ChatWindow.css';

function ChatWindow({ chatId, chatType, currentUser }) {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    if (!socket || !chatId) return;

    // Join the chat room
    socket.emit('joinChat', { chatId, chatType });

    // Request chat history
    socket.emit('getChatHistory', { chatId });

    // Listen for chat history
    const handleChatHistory = (data) => {
      if (data.chatId === chatId) {
        setMessages(data.messages || []);
      }
    };

    // Listen for new messages
    const handleReceiveMessage = (messageData) => {
      if (messageData.chatId === chatId) {
        setMessages(prev => [...prev, messageData]);
      }
    };

    socket.on('chatHistory', handleChatHistory);
    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.emit('leaveChat', { chatId });
      socket.off('chatHistory', handleChatHistory);
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [chatId, chatType, socket]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (message) => {
    if (!socket || !message.trim()) return;

    socket.emit('sendMessage', {
      chatId,
      chatType,
      message: message.trim()
    });
  };

  const getChatTitle = () => {
    // Extract the other user's name from private chat ID
    if (chatType === 'private') {
      const parts = chatId.split('_');
      const otherUser = parts.find(part => part !== 'private' && part !== currentUser);
      return otherUser || 'Private Chat';
    }
    return 'Group Chat';
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>{getChatTitle()}</h3>
        <span className="chat-type-badge">{chatType}</span>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender === currentUser ? 'sent' : 'received'}`}
            >
              {msg.sender !== currentUser && (
                <div className="message-sender">{msg.sender}</div>
              )}
              <div className="message-bubble">
                <p>{msg.message}</p>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}

export default ChatWindow;

