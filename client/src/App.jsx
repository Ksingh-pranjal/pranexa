import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import Composer from './components/Composer';
import Auth from './components/Auth';
import './index.css';

const API_BASE = import.meta.env.VITE_API_BASE;

function App() {
  const [token, setToken] = useState(localStorage.getItem('pranexa_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pranexa_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeChat = chats.find(c => c._id === activeChatId);

  // helper so every request automatically includes the auth token
  const authFetch = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
      }
    });
  };

  // load chats once we have a token
  useEffect(() => {
    if (!token) return;
    authFetch(`${API_BASE}/api/chats`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setChats(data);
          if (data.length > 0) setActiveChatId(data[0]._id);
        }
      });
  }, [token]);

  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleRenameChat = async (chatId, newTitle) => {
    const res = await authFetch(`${API_BASE}/api/chats/${chatId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle })
    });
    const updated = await res.json();
    setChats(prev => prev.map(c => c._id === chatId ? updated : c));
  };

  const handleLogout = () => {
    localStorage.removeItem('pranexa_token');
    localStorage.removeItem('pranexa_user');
    setToken(null);
    setUser(null);
    setChats([]);
    setActiveChatId(null);
  };

  const handleNewChat = async () => {
    const res = await authFetch(`${API_BASE}/api/chats`, { method: 'POST' });
    const newChat = await res.json();
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat._id);
  };

  const handleDeleteChat = async (chatId) => {
    await authFetch(`${API_BASE}/api/chats/${chatId}`, { method: 'DELETE' });
    setChats(prev => {
      const remaining = prev.filter(c => c._id !== chatId);
      if (chatId === activeChatId) {
        setActiveChatId(remaining.length > 0 ? remaining[0]._id : null);
      }
      return remaining;
    });
  };

  const handleSend = async (text, imageBase64, mimeType, imagePreview) => {
    let chatId = activeChatId;

    if (!chatId) {
      const res = await authFetch(`${API_BASE}/api/chats`, { method: 'POST' });
      const newChat = await res.json();
      chatId = newChat._id;
      setChats(prev => [newChat, ...prev]);
      setActiveChatId(chatId);
    }

    // save user message (with image, if any) to DB
    const userSaveRes = await authFetch(`${API_BASE}/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'user', text, image: imagePreview || null })
    });
    const updatedChat = await userSaveRes.json();
    setChats(prev => prev.map(c => c._id === chatId ? updatedChat : c));

    setIsThinking(true);

    setChats(prev => prev.map(c =>
      c._id === chatId ? { ...c, messages: [...c.messages, { role: 'bot', text: '' }] } : c
    ));

    try {
      const res = await fetch(`${API_BASE}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, image: imageBase64, mimeType })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      setIsThinking(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value);
        const lines = chunkStr.split('\n\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          const jsonStr = line.replace('data: ', '');
          if (jsonStr === '[DONE]') continue;

          const parsed = JSON.parse(jsonStr);
          if (parsed.text) {
            fullText += parsed.text;
            setChats(prev => prev.map(c =>
              c._id === chatId
                ? { ...c, messages: c.messages.map((m, i) => i === c.messages.length - 1 ? { ...m, text: fullText } : m) }
                : c
            ));
          }
        }
      }

      await authFetch(`${API_BASE}/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'bot', text: fullText })
      });

    } catch (err) {
      console.error(err);
      setIsThinking(false);
    }
  };

  // 🔒 gate: if not logged in, show the auth screen instead of the app
  if (!token) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={setActiveChatId}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      {!sidebarOpen && (
        <button className="expand-btn" onClick={() => setSidebarOpen(true)} title="Show sidebar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
        </button>
      )}
      <div className="chat-main">
        <div className="chat-header">
          <span className="chat-header-title">{activeChat?.title || 'PraNexa'}</span>
          <div className="account-badge" onClick={handleLogout} title="Click to log out">
            <div className="avatar"></div>
            <div>
              <div className="account-name">{user?.name || 'User'}</div>
              <div className="account-plan">Free plan</div>
            </div>
          </div>
        </div>
        <ChatWindow messages={activeChat?.messages || []} isThinking={isThinking} />
        <Composer onSend={handleSend} disabled={isThinking} />
      </div>
    </div>
  );
}

export default App;