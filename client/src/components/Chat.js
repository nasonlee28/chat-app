import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io(
  process.env.NODE_ENV === 'production'
    ? 'https://chat-app-nason.azurewebsites.net'
    : 'localhost:8080/',
);

const Message = ({ message }) => {
  const isMe = message.socketId === socket.id;
  return (
    <>
      <div className={isMe ? 'me-message-name' : 'other-message-name'}>
        {message.socketId}
      </div>
      <div className={isMe ? 'me' : 'other'}>
        <div>{message.message}</div>
      </div>
    </>
  );
};

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const messageEndRef = useRef(null);

  useEffect(() => {
    console.log('registering callback');
    const callback = (message) => {
      console.log('xx message', message);
      console.log('xx socket', socket);
      setMessages((prevMessages) => {
        return [...prevMessages, message];
      });
    };
    socket.on('chat', callback);

    return () => {
      socket.off('chat', callback);
    };
  }, []);

  /**
   * Scroll to bottom of chat when new message is received
   */
  useEffect(() => {
    messageEndRef.current?.scrollIntoView?.();
  }, [messages]);

  const sendMessage = () => {
    socket.emit('chat', { socketId: socket.id, message: newMessage });
    setNewMessage('');
  };

  return (
    <div className="background">
      <div className="chat">
        {messages.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
        <div ref={messageEndRef} />
      </div>
      <div className="edit-bar">
        <input
          className="input"
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
        />
        <button className="send" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
