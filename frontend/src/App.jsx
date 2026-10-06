import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Player from './components/Player';
import TrackCard from './components/TrackCard';
import TrackTable from './components/TrackTable';
import AuthModal from './components/AuthModal';
import UploadModal from './components/UploadModal';
import Toast from './components/Toast';
import { Play, Sparkles, Music2, UploadCloud, Grid, List } from 'lucide-react';
import './App.css';

// Demo fallback tracks if MongoDB has no songs uploaded yet
const DEMO_FALLBACK_TRACKS = [
  {
    _id: 'demo-1',
    title: 'Midnight City Beats',
    artist: { username: 'Luna Horizon', role: 'artist' },
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'demo-2',
    title: 'Neon Velvet Lounge',
    artist: { username: 'Kavinsky Wave', role: 'artist' },
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'demo-3',
    title: 'Cyberpunk Odyssey',
    artist: { username: 'Solaris', role: 'artist' },
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // User & Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const audioRef = useRef(null);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // 1. Fetch current user session
  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      }
    } catch {
      // Not logged in or backend booting
    }
  };

  // 2. Fetch all songs from backend
  const fetchSongs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/music');
      const data = await res.json();
      if (data.success && Array.isArray(data.musics)) {
        if (data.musics.length > 0) {
          setSongs(data.musics);
          if (!currentTrack) setCurrentTrack(data.musics[0]);
        } else {
          // Fallback to sample demo tracks if DB empty
          setSongs(DEMO_FALLBACK_TRACKS);
          if (!currentTrack) setCurrentTrack(DEMO_FALLBACK_TRACKS[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch songs from backend, using demo tracks:', err);
      setSongs(DEMO_FALLBACK_TRACKS);
      if (!currentTrack) setCurrentTrack(DEMO_FALLBACK_TRACKS[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
    fetchSongs();
  }, []);

  // Audio Playback Listeners
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (repeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNext();
    }
  };

  // Play / Pause controls
  const handlePlay = (track) => {
    if (!track) return;
    if (currentTrack && currentTrack._id === track._id) {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
        }
      }, 50);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else if (currentTrack) {
      handlePlay(currentTrack);
    }
  };

  const handleSeek = (newTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = volume || 0.5;
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  // Track switching (Next/Prev)
  const handleNext = () => {
    if (!songs.length || !currentTrack) return;
    let nextIndex;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else {
      const currentIndex = songs.findIndex((s) => s._id === currentTrack._id);
      nextIndex = (currentIndex + 1) % songs.length;
    }
    handlePlay(songs[nextIndex]);
  };

  const handlePrev = () => {
    if (!songs.length || !currentTrack) return;
    const currentIndex = songs.findIndex((s) => s._id === currentTrack._id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    handlePlay(songs[prevIndex]);
  };

  // Delete Track
  const handleDeleteTrack = async (trackId) => {
    try {
      const res = await fetch(`/api/music/${trackId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete track');
      }

      setSongs((prev) => prev.filter((s) => s._id !== trackId));
      addToast('Track deleted successfully');
      if (currentTrack && currentTrack._id === trackId) {
        handlePause();
        setCurrentTrack(songs.find((s) => s._id !== trackId) || null);
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Auth Handlers
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setCurrentUser(null);
      addToast('Logged out successfully');
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenUpload = () => {
    if (!currentUser) {
      setAuthModal({ open: true, mode: 'login' });
      addToast('Please log in or register as an Artist to upload music', 'error');
      return;
    }
    if (currentUser.role !== 'artist') {
      addToast("Listener accounts cannot upload music! Only 'Artist' accounts have upload permissions.", 'error');
      return;
    }
    setUploadModalOpen(true);
  };

  // Filter songs based on search and active tab
  const filteredSongs = songs.filter((song) => {
    const artistName =
      typeof song.artist === 'object' ? song.artist?.username : song.artist || '';
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artistName.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'library' && currentUser) {
      const artistId = typeof song.artist === 'object' ? song.artist?._id || song.artist?.id : song.artist;
      return matchesSearch && (currentUser.id === artistId || currentUser._id === artistId);
    }

    return matchesSearch;
  });

  return (
    <div className="app-container">
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack ? currentTrack.uri : undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={handleOpenUpload}
        songs={songs}
        currentTrack={currentTrack}
        onSelectTrack={handlePlay}
        isPlaying={isPlaying}
        currentUser={currentUser}
      />

      {/* Main Workspace */}
      <main className="main-wrapper">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
          onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
          onLogout={handleLogout}
          onOpenUpload={handleOpenUpload}
        />

        <div className="main-content">
          {/* Hero Banner */}
          {activeTab === 'home' && !searchQuery && (
            <div className="hero-banner">
              <div className="hero-content">
                <div className="hero-tag">
                  <Sparkles size={16} />
                  <span>Featured Collection</span>
                </div>
                <h1 className="hero-title">Experience Studio-Quality Sound</h1>
                <p className="hero-subtitle">
                  Upload high-fidelity audio streams directly to your cloud library, listen seamlessly, and share with your listeners.
                </p>
                <div className="hero-actions">
                  <button
                    className="btn-primary-hero"
                    onClick={() => songs[0] && handlePlay(songs[0])}
                  >
                    <Play size={18} fill="#000" />
                    <span>Play Spotlight Track</span>
                  </button>
                  {(!currentUser || currentUser.role === 'artist') && (
                    <button
                      className="btn-secondary-hero"
                      onClick={handleOpenUpload}
                    >
                      Upload Your Music
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section Heading & View Toggle */}
          <div className="section-header">
            <div>
              <h2 className="section-title">
                {activeTab === 'library'
                  ? 'Your Uploaded Tracks'
                  : searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : 'Popular Tracks & Uploads'}
              </h2>
              <span className="section-subtitle">
                {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'} available
              </span>
            </div>

            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <Grid size={16} />
              </button>
              <button
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Content Rendering: Grid or Table */}
          {filteredSongs.length === 0 ? (
            <div className="empty-state">
              <Music2 className="empty-icon" />
              <div className="empty-title">
                {activeTab === 'library' ? 'You haven’t uploaded any tracks yet' : 'No tracks found'}
              </div>
              <p className="empty-desc">
                {activeTab === 'library'
                  ? 'Upload your first audio track to start building your artist library on Spotify.'
                  : 'Try searching with different keywords or upload a new track.'}
              </p>
              {(!currentUser || currentUser.role === 'artist') && (
                <button
                  className="btn-primary-hero"
                  style={{ margin: '0 auto' }}
                  onClick={handleOpenUpload}
                >
                  <UploadCloud size={18} />
                  <span>Upload a Song</span>
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="cards-grid">
              {filteredSongs.map((song) => (
                <TrackCard
                  key={song._id || song.id}
                  song={song}
                  isCurrent={currentTrack && currentTrack._id === song._id}
                  isPlaying={isPlaying}
                  onPlay={handlePlay}
                  onPause={handlePause}
                />
              ))}
            </div>
          ) : (
            <TrackTable
              songs={filteredSongs}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlay={handlePlay}
              onPause={handlePause}
              onDelete={handleDeleteTrack}
              currentUser={currentUser}
            />
          )}
        </div>
      </main>

      {/* Persistent Bottom Music Player */}
      <Player
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onPrev={handlePrev}
        onNext={handleNext}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        shuffle={shuffle}
        onToggleShuffle={() => setShuffle(!shuffle)}
        repeat={repeat}
        onToggleRepeat={() => setRepeat(!repeat)}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={authModal.open}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ open: false, mode: 'login' })}
        onAuthSuccess={(user, msg) => {
          setCurrentUser(user);
          addToast(msg);
        }}
      />

      {/* Upload Track Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        currentUser={currentUser}
        onPromptAuth={() => setAuthModal({ open: true, mode: 'login' })}
        onUploadSuccess={(newSong) => {
          setSongs((prev) => [newSong, ...prev.filter((s) => !s._id.startsWith('demo-'))]);
          addToast(`"${newSong.title}" uploaded successfully!`);
          handlePlay(newSong);
        }}
      />

      {/* Floating Notifications */}
      <Toast toasts={toasts} />
    </div>
  );
}
