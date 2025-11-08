import { io } from 'socket.io-client';
import { API_URL } from './api';

let socket = null;

export const initSocket = (sessionId, username) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(API_URL, {
    transports: ['websocket'],
    reconnection: true
  });

  socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('login', { username, sessionId });
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

