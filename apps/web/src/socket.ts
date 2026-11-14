import { io } from 'socket.io-client';

console.log('Socket file loaded');

export const socket = io(
  'http://localhost:3000',
  {
    autoConnect: false,
  },
);