import React from 'react';
import './styles.css';

const SpotifyPlayer = (props) => {
  const {
    data: {
      loggedIn,
      artistName,
      trackName,
      albumName,
      error,
      position,
      duration,
      playing,
      images,
    },
    handlePreviousTrack,
    handleTogglePlay,
    handleNextTrack,
    handleRewind,
    handleFoward,
  } = props;
  
  return (
    <>
      {error && <p>Error: {error}</p>}
      {loggedIn && (
        <>
          <div className="player">
            <img src={images.url || null} alt="Album" />
            <p>Artist: {artistName}</p>
            <p>Track: {trackName}</p>
            <p>Album: {albumName}</p>
            <p>{position}</p>
            <p>{duration}</p>
            <p>
              <button onClick={handlePreviousTrack}>Previous</button>
              <button onClick={handleTogglePlay}>
                {playing ? 'Pause' : 'Play'}
              </button>
              <button onClick={handleNextTrack}>Next</button>
              <button onClick={handleRewind}>-15sec</button>
              <button onClick={handleFoward}>+15sec</button>
            </p>
          </div>
      </>
      )}
    </>
  );
};

export default SpotifyPlayer;
