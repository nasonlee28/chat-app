import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io(
  process.env.NODE_ENV === 'production'
    ? 'https://chat-app-nason.azurewebsites.net'
    : 'localhost:8080/',
);

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const callback = (message) => {
      setMessages((prevMessages) => {
        return [...prevMessages, message];
      });
    };
    socket.on(
      // "identity",
      'events',
      callback,
    );

    return () => socket.off('events', callback);
  }, []);

  const sendMessage = () => {
    socket.emit(
      // "identity",
      'events',
      newMessage,
    );
    setNewMessage('');
  };

  return (
    <div className="background">
      <div className="chat">
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <div>
        <input
          className="input"
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
