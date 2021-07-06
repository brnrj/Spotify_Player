import React, { Component } from 'react';
import './App.css';
import SpotifyPlayer from './components/SpotifyPlayer';
import * as $ from 'jquery';
import SpotifyWebApi from 'spotify-web-api-js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token:'BQC1N2l8v2DucBDLowfeeibu2NHHZGrk5pNdPw9H-4oMxrYm5tPNNKb0YApxEO6ppVzbkqzSZKYcQTjtrTnH6gs2T2ZZc1b7Y71quPUR7T7Lpym5-lnEHXfMQIMTD3zANiNMY_29UUdsp-BsPmzXRGD66NM5nvDwRJm5xF6Piy03BcdhHtsC2nw',
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
      podcastsData: [],
    };
    this.handleLogin = this.handleLogin.bind(this);
    this.checkForPlayer = this.checkForPlayer.bind(this);
    this.playerCheckInterval = null;
    this.onPlayClick = this.onPlayClick.bind(this);
    this.onPrevClick = this.onPrevClick.bind(this);
    this.onNextClick = this.onNextClick.bind(this);
    this.handleRewind = this.handleRewind.bind(this);
    this.handleFoward = this.handleFoward.bind(this);
    this.handlePodcastsPlaylist = this.handlePodcastsPlaylist.bind(this);
  }

  async handlePodcastsPlaylist() {
    const { token } = this.state;
    const uri = '6KQIl4LUtifl3S3B37clPZ';
    new SpotifyWebApi().setAccessToken(token);
    new SpotifyWebApi().getShowEpisodes(uri, {}, (err, res) => {
      if (err) {
        console.log(err);
      }
      this.setState({ podcastsData: res });
    });
  }

  async handleFoward() {
    const { token } = this.state;
    const { position, duration } = await this.player
      .getCurrentState()
      .then((state) => {
        if (!state) {
          console.log('User is not playing music through the Web Playback SDK');
          return;
        }
        return state;
      });
    const foward = position + 15000;
    new SpotifyWebApi().setAccessToken(token);
    return new SpotifyWebApi().seek(foward > duration ? duration : foward);
  }

  async handleRewind() {
    const { token } = this.state;
    const { position } = await this.player.getCurrentState().then((state) => {
      if (!state) {
        console.log('User is not playing music through the Web Playback SDK');
        return;
      }
      return state;
    });
    const rewind = position - 15000;
    new SpotifyWebApi().setAccessToken(token);
    return new SpotifyWebApi().seek(rewind < 0 ? 0 : rewind);
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

  play(device_id, token, podcastsData) {
    const { items } = podcastsData;
    const data = items.map(({ uri }) => uri);
    $.ajax({
      url: 'https://api.spotify.com/v1/me/player/play?device_id=' + device_id,
      type: 'PUT',
      data: `{"uris": ${JSON.stringify(data)} ,  "position_ms": 0}`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
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

  async checkForPlayer() {
    const { token } = this.state;

    if (window.Spotify !== null) {
      clearInterval(this.playerCheckInterval);
      this.player = new window.Spotify.Player({
        name: "Bruno's Spotify Player",
        getOAuthToken: (cb) => {
          cb(token);
        },
      });
      this.createEventHandlers();
      // finally, connect!
      await this.player.connect();
    }
  }

  createEventHandlers() {
    const { token, podcastsData } = this.state;

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
    this.player.on(
      'player_state_changed',
      (state) => this.onStateChanged(state) || console.log(state)
    );
    // Ready
    this.player.on('ready', (data) => {
      let { device_id } = data;
      console.log('Let the music play on!');
      this.setState({ deviceId: device_id });
      this.play(device_id, token, podcastsData);
      // this.transferPlaybackHere();
    });
  }

  handleLogin() {
    if (this.state.token !== '') {
      this.setState({ loggedIn: true });
    }
    this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
    this.handlePodcastsPlaylist();
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
    const { position, duration, loggedIn, error } = this.state;
    const totalTime = position / duration > 0 ? position / duration : 0;
    return (
      <div className="App">
        <h2>Now Playing</h2>
        <p>A Spotify Web Playback API Demo.</p>

        {error && <p>Error: {error}</p>}

        {loggedIn ? (
          <>
          <SpotifyPlayer
            data={this.state}
            onPlayClick={this.onPlayClick}
            onNextClick={this.onNextClick}
            onPrevClick={this.onPrevClick}
            handleRewind={this.handleRewind}
            handleFoward={this.handleFoward}
          />
          <div
          style={{ transform: `scaleX(${totalTime })` }}
          id="progress-bar"
        />
          </>
        ) : (
          <div>
            <p className="App-intro">
              Enter your Spotify access token. Get it from{' '}
              <a href="https://beta.developer.spotify.com/documentation/web-playback-sdk/quick-start/#authenticating-with-spotify">
                here
              </a>
              .
            </p>
            {/* <p>
              <input
                type="text"
                value={token}
                onChange={(e) => this.setState({ token: e.target.value })}
              />
            </p> */}
            <p>
              <button onClick={() => this.handleLogin()}>Play Podcasts</button>
            </p>
          </div>
        )}
      </div>
    );
  }
}

export default App;
