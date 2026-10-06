import React, { useState, useRef } from 'react';
import { X, UploadCloud, Music, FileAudio, CheckCircle2 } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess, currentUser, onPromptAuth }) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectFile = (selectedFile) => {
    setError('');
    // Verify audio file
    if (!selectedFile.type.startsWith('audio/') && !selectedFile.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
      setError('Please select a valid audio file (.mp3, .wav, .m4a, etc.)');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('Audio file must be under 50MB');
      return;
    }

    setFile(selectedFile);
    if (!title) {
      // Auto-populate title without extension
      const cleanTitle = selectedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(cleanTitle);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      onPromptAuth();
      return;
    }

    if (currentUser.role !== 'artist') {
      setError("Forbidden: Only accounts with the 'Artist' role can upload music. You are signed in as a Listener.");
      return;
    }

    if (!file) {
      setError('Please select an audio file to upload');
      return;
    }

    if (!title.trim()) {
      setError('Please specify a title for the track');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('music', file); // field name matching music.router.js upload.single('music')

      const res = await fetch('/api/music/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Upload failed');
      }

      onUploadSuccess(data.music);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="logo-icon" style={{ width: '32px', height: '32px' }}>
              <Music size={18} />
            </div>
            <h2 className="modal-title">Upload Music</h2>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {!currentUser ? (
          <div style={{ background: 'rgba(29, 185, 84, 0.1)', border: '1px solid var(--accent-primary)', padding: '12px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            You need to be logged in to upload songs to Spotify.
          </div>
        ) : currentUser.role !== 'artist' ? (
          <div style={{ background: 'rgba(255, 85, 85, 0.12)', border: '1px solid #ff5555', padding: '12px 16px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', color: '#ffb3b3' }}>
            ⚠️ <strong>Artist Account Required:</strong> You are currently signed in as a <strong>Listener</strong>. Only accounts registered with the <strong>Artist</strong> role can publish music.
          </div>
        ) : null}

        {error && (
          <div style={{ color: '#ff5555', fontSize: '13px', marginBottom: '16px', background: 'rgba(255,85,85,0.1)', padding: '10px 14px', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Drag & Drop Zone */}
          <div
            className={`dropzone ${isDragging ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleSelectFile(e.target.files[0])}
            />
            <UploadCloud className="dropzone-icon" />
            <div className="dropzone-text">
              {file ? 'Click or drop to replace audio' : 'Drop your audio file here or browse'}
            </div>
            <div className="dropzone-hint">Supports MP3, WAV, FLAC, M4A up to 50MB</div>
          </div>

          {/* Selected File Details */}
          {file && (
            <div className="selected-file-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <FileAudio size={20} color="var(--accent-primary)" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Track Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Blinding Lights, Starboy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={loading || !file || (currentUser && currentUser.role !== 'artist')}
          >
            {loading ? (
              <>
                <div className="spinner" />
                <span>Uploading to ImageKit...</span>
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                <span>Publish Track</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
