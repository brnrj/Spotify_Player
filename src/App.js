import React, { Component } from 'react';
import './App.css';
import SpotifyPlayer from './components/SpotifyPlayer';
import * as $ from 'jquery';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      deviceId: '',
      loggedIn: false,
      error: '',
      trackName: '',
      artistName: '',
      albumName: '',
      playing: false,
      position: 0,
      duration: 0,
      images: [],
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.checkForPlayer = this.checkForPlayer.bind(this);
    this.playerCheckInterval = null;
    this.onPlayClick = this.onPlayClick.bind(this);
    this.onPrevClick = this.onPrevClick.bind(this);
    this.onNextClick = this.onNextClick.bind(this);
  }

  onStateChanged(state) {
    // if we're no longer listening to music, we'll get a null state.
    if (state !== null) {
      const {
        current_track: {
          album: { images, name: album },
          name: musicName,
          artists,
        },
      } = state.track_window;
      const trackName = musicName;
      const albumName = album;
      const artistName = artists.map((artist) => artist.name).join(', ');
      const playing = !state.paused;
      this.setState({
        position: state.position,
        duration: state.duration,
        trackName,
        albumName,
        artistName,
        playing,
        images: images[0],
      });
    }
  }

  play(device_id, token) {
    $.ajax({
      url: 'https://api.spotify.com/v1/me/player/play?device_id=' + device_id,
      type: 'PUT',
      data: '{"uris": ["spotify:episode:3F3g7GrkBEDTZdtZDtXPG6"],  "position_ms": 0}',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      },
      success: function (data) {
        console.log(data);
      },
    });
  }

  transferPlaybackHere() {
    const { deviceId, token } = this.state;
    fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device_ids: [deviceId],
        play: false,
      }),
    });
  }

  checkForPlayer() {
    const { token } = this.state;

    if (window.Spotify !== null) {
      clearInterval(this.playerCheckInterval);
      this.player = new window.Spotify.Player({
        name: "Bruno's Spotify Player",
        getOAuthToken: (cb) => {
          cb(token);
        },
        body: JSON.stringify({
          uris: ['spotify:track:48UPSzbZjgc449aqz8bxox'],
        }),
      });
      this.createEventHandlers();

      // finally, connect!
      this.player.connect();
    }
  }

  createEventHandlers() {
    const {token} = this.state
    
    this.player.on('initialization_error', (e) => {
      console.error(e);
    });
    this.player.on('authentication_error', (e) => {
      console.error(e);
      this.setState({ loggedIn: false });
    });
    this.player.on('account_error', (e) => {
      console.error(e);
    });
    this.player.on('playback_error', (e) => {
      console.error(e);
    });

    // Playback status updates
    this.player.on('player_state_changed', (state) => {
      console.log(state);
    });
    this.player.on('player_state_changed', (state) =>
      this.onStateChanged(state)
    );
    // Ready
    this.player.on('ready', async (data) => {
      let { device_id } = data;
      console.log('Let the music play on!');
      await this.setState({ deviceId: device_id });
      // this.transferPlaybackHere();
      this.play(device_id, token)
    });
  }

  handleLogin() {
    if (this.state.token !== '') {
      this.setState({ loggedIn: true });
    }
    this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
  }

  onPrevClick() {
    this.player.previousTrack();
  }

  onPlayClick() {
    this.player.togglePlay();
  }

  onNextClick() {
    this.player.nextTrack();
  }

  render() {
    const { token, loggedIn, error } = this.state;

    return (
      <div className="App">
        <h2>Now Playing</h2>
        <p>A Spotify Web Playback API Demo.</p>

        {error && <p>Error: {error}</p>}

        {loggedIn ? (
          <SpotifyPlayer
            data={this.state}
            onPlayClick={this.onPlayClick}
            onNextClick={this.onNextClick}
            onPrevClick={this.onPrevClick}
          />
        ) : (
          <div>
            <p className="App-intro">
              Enter your Spotify access token. Get it from{' '}
              <a href="https://beta.developer.spotify.com/documentation/web-playback-sdk/quick-start/#authenticating-with-spotify">
                here
              </a>
              .
            </p>
            <p>
              <input
                type="text"
                value={token}
                onChange={(e) => this.setState({ token: e.target.value })}
              />
            </p>
            <p>
              <button onClick={() => this.handleLogin()}>Go</button>
            </p>
          </div>
        )}
      </div>
    );
  }
}

export default App;
