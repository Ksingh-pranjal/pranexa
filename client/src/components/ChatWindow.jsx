import { useEffect, useRef } from 'react';
import MessageContent from './MessageContent';

function ChatWindow({ messages, isThinking }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  if (messages.length === 0 && !isThinking) {
    return (
      <div className="empty-state">
        <h2>Hey, I'm PraNexa 👋</h2>
        <p>Ask me anything to get started.</p>
      </div>
    );
  }

  return (
    <div className="messages">
      {messages.map((m, i) => (
        <div key={i} className={`msg ${m.role}`}>
          {m.image && <img src={m.image} alt="attachment" className="msg-image" />}
          <MessageContent text={m.text} />
        </div>
      ))}
      {isThinking && <div className="msg bot thinking">Thinking...</div>}
      <div ref={bottomRef}></div>
    </div>
  );
}

export default ChatWindow;