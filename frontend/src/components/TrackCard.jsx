import React from 'react';
import { Play, Pause } from 'lucide-react';
import { getTrackGradient, getInitials } from '../utils/helpers';

export default function TrackCard({ song, isCurrent, isPlaying, onPlay, onPause }) {
  const artistName =
    typeof song.artist === 'object' ? song.artist?.username : song.artist || 'Artist';

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isCurrent && isPlaying) {
      onPause();
    } else {
      onPlay(song);
    }
  };

  return (
    <div
      className={`music-card ${isCurrent ? 'playing' : ''}`}
      onClick={() => onPlay(song)}
    >
      <div className="card-artwork">
        <div
          className="artwork-gradient"
          style={{ background: getTrackGradient(song.title) }}
        >
          {getInitials(song.title)}
        </div>

        <button
          className="card-play-btn"
          onClick={handlePlayClick}
          title={isCurrent && isPlaying ? 'Pause' : 'Play'}
        >
          {isCurrent && isPlaying ? (
            <Pause size={22} fill="#000" />
          ) : (
            <Play size={22} fill="#000" style={{ marginLeft: '2px' }} />
          )}
        </button>
      </div>

      <div className="card-title" title={song.title}>
        {song.title}
      </div>
      <div className="card-artist" title={artistName}>
        {artistName}
      </div>
    </div>
  );
}
