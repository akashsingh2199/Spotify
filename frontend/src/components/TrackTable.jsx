import React from 'react';
import { Play, Pause, Trash2, Clock } from 'lucide-react';
import { getTrackGradient, getInitials } from '../utils/helpers';

export default function TrackTable({
  songs,
  currentTrack,
  isPlaying,
  onPlay,
  onPause,
  onDelete,
  currentUser
}) {
  return (
    <table className="track-table">
      <thead>
        <tr>
          <th style={{ width: '50px', textAlign: 'center' }}>#</th>
          <th>Title</th>
          <th>Artist</th>
          <th>Uploaded</th>
          <th style={{ width: '60px' }}></th>
        </tr>
      </thead>
      <tbody>
        {songs.map((song, index) => {
          const isCurrent = currentTrack && currentTrack._id === song._id;
          const artistName =
            typeof song.artist === 'object' ? song.artist?.username : song.artist || 'Artist';
          const artistId = typeof song.artist === 'object' ? song.artist?._id || song.artist?.id : song.artist;
          const isOwner = currentUser && (currentUser.id === artistId || currentUser._id === artistId);
          const dateStr = song.createdAt
            ? new Date(song.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            : 'Recently';

          return (
            <tr
              key={song._id || index}
              className={`track-row ${isCurrent ? 'playing' : ''}`}
              onClick={() => (isCurrent && isPlaying ? onPause() : onPlay(song))}
            >
              <td className="track-number">
                {isCurrent && isPlaying ? (
                  <Pause size={14} fill="var(--accent-primary)" color="var(--accent-primary)" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </td>

              <td>
                <div className="track-main">
                  <div
                    className="track-mini-art"
                    style={{ background: getTrackGradient(song.title) }}
                  >
                    {getInitials(song.title)}
                  </div>
                  <div>
                    <div className="track-title-text">{song.title}</div>
                  </div>
                </div>
              </td>

              <td className="track-artist-text">{artistName}</td>

              <td className="track-date">{dateStr}</td>

              <td>
                {isOwner && (
                  <button
                    className="btn-delete-track"
                    title="Delete track"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete track "${song.title}"?`)) {
                        onDelete(song._id);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
