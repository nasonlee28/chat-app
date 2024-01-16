import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io(
  process.env.NODE_ENV === 'production'
    ? 'chat-app-nason.azurewebsites.net'
    : 'localhost:8080/',
);

const Message = ({ message }) => {
  const isMe = message.socketId === socket.id;
  return (
    <>
      <div className={isMe ? 'me-message-name' : 'other-message-name'}>
        {message.socketId}
      </div>
      <div className={isMe ? 'me-message' : 'other-message'}>
        <div>{message.message}</div>
      </div>
    </>
  );
};

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newTypingMessage, setNewTypingMessage] = useState('');
  const [isFinishedInput, setFinishedInput] = useState(false);

  useEffect(() => {
    const receiveMassageCallback = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };
    socket.on('chat', receiveMassageCallback);

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

    socket.emit('chat', { socketId: socket.id, message: newTypingMessage });
    setNewTypingMessage('');
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
        <button className="send" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
