import { useState } from 'react';

function Sidebar({ chats, activeChatId, onNewChat, onSelectChat, onDeleteChat, onRenameChat, searchTerm, onSearchChange, sidebarOpen, onToggleSidebar }) {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const filtered = chats.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEditing = (chat) => {
    setEditingId(chat._id);
    setEditValue(chat.title);
  };

  const commitEdit = () => {
    if (editValue.trim() && editValue.trim() !== chats.find(c => c._id === editingId)?.title) {
      onRenameChat(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-mark"></div>
          <span className="brand-name">PraNexa</span>
        </div>
        <button className="collapse-btn" onClick={onToggleSidebar} title="Collapse sidebar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
        </button>
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>+ New Chat</button>

      <div className="search-box">
        <input
          placeholder="Search chats..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="chat-list-label">Recent</div>
      <div className="chat-list">
        {filtered.map(chat => (
          <div
            key={chat._id}
            className={`chat-item ${chat._id === activeChatId ? 'active' : ''}`}
            onClick={() => editingId !== chat._id && onSelectChat(chat._id)}
          >
            {editingId === chat._id ? (
              <input
                className="rename-input"
                value={editValue}
                autoFocus
                onChange={(e) => setEditValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit();
                  if (e.key === 'Escape') setEditingId(null);
                }}
              />
            ) : (
              <span className="chat-item-title">{chat.title}</span>
            )}

            <div className="chat-item-actions">
              <button
                className="icon-btn-sm"
                title="Rename"
                onClick={(e) => { e.stopPropagation(); startEditing(chat); }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button
                className="icon-btn-sm"
                title="Delete chat"
                onClick={(e) => { e.stopPropagation(); onDeleteChat(chat._id); }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;