import React from 'react';
import { ChevronLeft, ChevronRight, Search, LogOut, User, Sparkles } from 'lucide-react';

export default function Header({
  searchQuery,
  setSearchQuery,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenUpload
}) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="history-nav">
          <button className="btn-circle" title="Go back">
            <ChevronLeft size={20} />
          </button>
          <button className="btn-circle" title="Go forward">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="search-bar">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="search-input"
            placeholder="What do you want to play?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="header-right">
        {currentUser ? (
          <>
            {currentUser.role === 'artist' && (
              <button
                className="btn-auth-register"
                style={{ fontSize: '13px', padding: '8px 18px', background: 'var(--accent-primary)' }}
                onClick={onOpenUpload}
              >
                Upload Song
              </button>
            )}
            <div className="user-pill" title={`Logged in as ${currentUser.username}`}>
              <div className="user-avatar">
                {currentUser.username ? currentUser.username[0].toUpperCase() : <User size={16} />}
              </div>
              <span className="user-name">{currentUser.username}</span>
              <span className="user-role-badge">{currentUser.role || 'user'}</span>
              <button
                className="btn-circle"
                style={{ width: '28px', height: '28px', background: 'transparent' }}
                onClick={onLogout}
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
            <button className="btn-auth-login" onClick={() => onOpenAuth('login')}>
              Log in
            </button>
            <button className="btn-auth-register" onClick={() => onOpenAuth('register')}>
              Sign up
            </button>
          </>
        )}
      </div>
    </header>
  );
}
