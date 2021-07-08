import React, { useRef, useEffect, useState } from 'react';
import './styles.css'
import SpotifyWebApi from 'spotify-web-api-js';

const ProgressBar = (props) => {
  const {position, duration, token} = props
  const [seekValue, setSeekValue] = useState()
  const progressBar = useRef();

  async function seekPosition(){
    new SpotifyWebApi().setAccessToken(token);
    await new SpotifyWebApi().seek(seekValue)
  }

  useEffect(() => {
    progressBar.current.value = position
    
  }, [position])

  return (
    <>
      <input
        type="range"
        id="progress-bar"
        min="0"
        max={duration}
        ref={progressBar}
        onChange={() => setSeekValue(progressBar.current.value)}
        onMouseUp={seekPosition}
      />
    </>
  );
};

export default ProgressBar;