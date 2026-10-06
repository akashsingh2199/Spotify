import React from 'react';
import { Home, Search, Library, PlusCircle, Music, Radio } from 'lucide-react';
import { getTrackGradient, getInitials } from '../utils/helpers';

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenUpload,
  songs = [],
  currentTrack,
  onSelectTrack,
  isPlaying,
  currentUser
}) {
  return (
    <aside className="sidebar">
      {/* Brand & Main Nav */}
      <div className="sidebar-box">
        <div className="sidebar-logo" onClick={() => setActiveTab('home')}>
          <div className="logo-icon">
            <Radio size={22} />
          </div>
          <span className="logo-text">Spotify</span>
          <span className="logo-badge">Web</span>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home size={22} />
            <span>Home</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <Search size={22} />
            <span>Search</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            <Library size={22} />
            <span>Your Library</span>
          </button>
        </nav>
      </div>

      {/* Library & Quick Upload Box */}
      <div className="sidebar-box sidebar-library">
        <div className="library-header">
          <div className="library-title">
            <Music size={20} />
            <span>Quick Tracks ({songs.length})</span>
          </div>
        </div>

        {/* Upload Button or Listener notice */}
        {(!currentUser || currentUser.role === 'artist') ? (
          <button
            className="btn-upload-nav"
            onClick={onOpenUpload}
            title={currentUser ? "Upload new song to ImageKit" : "Log in as Artist to upload"}
          >
            <PlusCircle size={18} />
            <span>Upload Track</span>
          </button>
        ) : (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '16px',
              textAlign: 'center',
              border: '1px solid var(--border-subtle)'
            }}
          >
            🎧 Listener Account
          </div>
        )}

        {/* Playlist / Library items */}
        <div className="library-list">
          {songs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '12px 6px' }}>
              No tracks uploaded yet.
            </div>
          ) : (
            songs.map((song) => {
              const isActive = currentTrack && currentTrack._id === song._id;
              return (
                <div
                  key={song._id || song.id}
                  className={`library-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectTrack(song)}
                >
                  <div
                    className="library-item-art"
                    style={{ background: getTrackGradient(song.title) }}
                  >
                    {getInitials(song.title)}
                  </div>
                  <div className="library-item-meta">
                    <div className="library-item-title">{song.title}</div>
                    <div className="library-item-artist">
                      {typeof song.artist === 'object' ? song.artist?.username : song.artist || 'Artist'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
