import React from 'react';
import './style.css';

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
    onPrevClick,
    onPlayClick,
    onNextClick
  } = props
  
  return (
    <>
      {error && <p>Error: {error}</p>}
      {loggedIn && (
        <div>
          <img src={images.url || null} alt="Album" />
          <p>Artist: {artistName}</p>
          <p>Track: {trackName}</p>
          <p>Album: {albumName}</p>
          <p>{position}</p>
          <p>{duration}</p>
          <p>
            <button onClick={onPrevClick}>Previous</button>
            <button onClick={onPlayClick}>
              {playing ? 'Pause' : 'Play'}
            </button>
            <button onClick={onNextClick}>Next</button>
          </p>
        </div>
      )}
    </>
  );
};

export default SpotifyPlayer;
