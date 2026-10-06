import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Volume1
} from 'lucide-react';
import { formatTime, getTrackGradient, getInitials } from '../utils/helpers';

export default function Player({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  shuffle,
  onToggleShuffle,
  repeat,
  onToggleRepeat
}) {
  if (!currentTrack) {
    return (
      <footer className="player-bar">
        <div className="player-left" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Select a track to start playback
        </div>
        <div className="player-center">
          <div className="player-controls">
            <button className="control-btn" disabled><SkipBack size={20} /></button>
            <button className="play-pause-btn" disabled><Play size={18} fill="#000" /></button>
            <button className="control-btn" disabled><SkipForward size={20} /></button>
          </div>
        </div>
        <div className="player-right"></div>
      </footer>
    );
  }

  const artistName =
    typeof currentTrack.artist === 'object'
      ? currentTrack.artist?.username
      : currentTrack.artist || 'Unknown Artist';

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="player-bar">
      {/* Track Details */}
      <div className="player-left">
        <div
          className="player-track-art"
          style={{ background: getTrackGradient(currentTrack.title) }}
        >
          {getInitials(currentTrack.title)}
        </div>
        <div className="player-track-meta">
          <div className="player-track-title" title={currentTrack.title}>
            {currentTrack.title}
          </div>
          <div className="player-track-artist" title={artistName}>
            {artistName}
          </div>
        </div>

        {/* Animated Equalizer when playing */}
        {isPlaying && (
          <div className="equalizer" title="Now Playing">
            <div className="equalizer-bar" />
            <div className="equalizer-bar" />
            <div className="equalizer-bar" />
          </div>
        )}
      </div>

      {/* Main Playback Controls & Timeline */}
      <div className="player-center">
        <div className="player-controls">
          <button
            className={`control-btn ${shuffle ? 'active' : ''}`}
            onClick={onToggleShuffle}
            title={shuffle ? 'Disable shuffle' : 'Enable shuffle'}
          >
            <Shuffle size={18} />
          </button>

          <button className="control-btn" onClick={onPrev} title="Previous track">
            <SkipBack size={20} />
          </button>

          <button
            className="play-pause-btn"
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={20} fill="#000" />
            ) : (
              <Play size={20} fill="#000" style={{ marginLeft: '2px' }} />
            )}
          </button>

          <button className="control-btn" onClick={onNext} title="Next track">
            <SkipForward size={20} />
          </button>

          <button
            className={`control-btn ${repeat ? 'active' : ''}`}
            onClick={onToggleRepeat}
            title={repeat ? 'Disable repeat' : 'Enable repeat'}
          >
            <Repeat size={18} />
          </button>
        </div>

        <div className="playback-bar">
          <span className="playback-time">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime || 0}
            onChange={(e) => onSeek(Number(e.target.value))}
            style={{
              background: `linear-gradient(to right, var(--accent-primary) ${progressPercent}%, rgba(255, 255, 255, 0.2) ${progressPercent}%)`
            }}
          />
          <span className="playback-time">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume & Additional Options */}
      <div className="player-right">
        <div className="volume-control">
          <button className="control-btn" onClick={onToggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted || volume === 0 ? (
              <VolumeX size={20} />
            ) : volume < 0.5 ? (
              <Volume1 size={20} />
            ) : (
              <Volume2 size={20} />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            style={{
              background: `linear-gradient(to right, var(--accent-primary) ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.2) ${(isMuted ? 0 : volume) * 100}%)`
            }}
          />
        </div>
      </div>
    </footer>
  );
}
