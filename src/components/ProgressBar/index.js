import React, { useRef, useEffect, useState } from 'react';
import './styles.css';
import SpotifyWebApi from 'spotify-web-api-js';
import Timer from '../Timer';

const ProgressBar = (props) => {
  const { position, duration, playing, handleSeekPosition } = props;
  const [seekValue, setSeekValue] = useState();

  const progressBar = useRef();

  useEffect(() => {
    progressBar.current.value = position;
  }, [position]);

  return (
    <>
      <input
        type="range"
        id="progress-bar"
        min="0"
        max={duration}
        ref={progressBar}
        onChange={() => setSeekValue(progressBar.current.value)}
        onMouseUp={() => handleSeekPosition(seekValue)}
        on
      />
      <Timer playerStatus={playing} position={position} duration={duration} />
    </>
  );
};

export default ProgressBar;
