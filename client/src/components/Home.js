import React, { useEffect, useRef, useState } from 'react';
import './Home.css';

const LazyChatComponent = React.lazy(() => import('./Chat'));

const Home = () => {
  const [name, setName] = useState('');
  const [startChatting, setStartChatting] = useState(false);
  const [isFinishedInput, setFinishedInput] = useState(false);
  const inputRef = useRef(null);

  const startChat = () => {
    if (!name) {
      alert('Please input your name');
      return;
    }
    setStartChatting(true);
  };

  useEffect(() => {
    inputRef.current?.focus?.();
  }, []);

  return startChatting ? (
    <React.Suspense fallback={<div>Loading...</div>}>
      <LazyChatComponent name={name} />
    </React.Suspense>
  ) : (
    <div className="background">
      <div className="home">
        <h1>Chat App</h1>
        <h2>Input the name and Click "Chat" to start chatting!</h2>
        <div>Name:</div>
        <input
          ref={inputRef}
          className="name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          /** if user is not yet finished typing like Mandarin, don't send message out */
          onCompositionStart={() => setFinishedInput(false)}
          onBeforeInput={() => setFinishedInput(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isFinishedInput) {
              startChat();
            }
          }}
        ></input>
        <button type="text" className="chat-button" onClick={startChat}>
          Chat
        </button>
      </div>
    </div>
  );
};

export default Home;
