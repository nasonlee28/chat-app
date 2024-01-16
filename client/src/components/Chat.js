import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './Chat.css';

const socket = io(
  process.env.NODE_ENV === 'production'
    ? 'chat-app-nason.azurewebsites.net'
    : 'localhost:8080',
);

const Message = ({ message }) => {
  const isMe = message.socketId === socket.id;
  return (
    <>
      <div className={isMe ? 'me-message-name' : 'other-message-name'}>
        {message.name}
      </div>
      <div className={isMe ? 'me-message' : 'other-message'}>
        <div>{message.text}</div>
      </div>
      <div className={isMe ? 'me-message-time' : 'other-message-time'}>
        {message.time}
      </div>
    </>
  );
};

const Chat = ({ name }) => {
  const [messages, setMessages] = useState([]);
  const [newTypingMessage, setNewTypingMessage] = useState('');
  const [users, setUsers] = useState([]); // [{name, socketId}]
  const [isFinishedInput, setFinishedInput] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const receiveMassageCallback = ({ message, onlineUsers }) => {
      setUsers(onlineUsers);
      if (message?.text) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };

    socket.on('chat', receiveMassageCallback);
    // send name to server with a delay to make sure server is ready
    setTimeout(() => {
      socket.emit('chat', { socketId: socket.id, name });
    }, 100);

    inputRef.current?.focus?.();

    return () => {
      socket.off('chat', receiveMassageCallback);
    };
  }, []);

  /**
   * Scroll to bottom of chat when new message is received
   */
  const messageEndRef = useRef(null);
  useEffect(() => {
    messageEndRef.current?.scrollIntoView?.();
  }, [messages]);

  const sendMessage = () => {
    if (!newTypingMessage) return;

    socket.emit('chat', {
      socketId: socket.id,
      text: newTypingMessage,
      name,
      time: new Date().toLocaleTimeString(),
    });
    setNewTypingMessage('');
  };

  return (
    <div className="background">
      <div className="online-users">
        <div className="online-users-title">Online Users: </div>
        {users.map((user) => user.name).join(', ')}
      </div>
      <div className="chat">
        {messages.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
        <div ref={messageEndRef} />
      </div>
      <div className="edit-bar">
        <input
          ref={inputRef}
          className="input"
          type="text"
          value={newTypingMessage}
          onChange={(e) => setNewTypingMessage(e.target.value)}
          /** if user is not yet finished typing like Mandarin, don't send message out */
          onCompositionStart={() => setFinishedInput(false)}
          onBeforeInput={() => setFinishedInput(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isFinishedInput) {
              sendMessage();
            }
          }}
        />
        <button className="send-button" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
