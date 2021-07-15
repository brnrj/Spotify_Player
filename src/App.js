import React, { Component } from 'react';
import './App.css';
import * as $ from 'jquery';
import SpotifyPlayer from './components/SpotifyPlayer';
import SpotifyWebApi from 'spotify-web-api-js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token:
        'BQCENjbBbeZ4fPDYgWpKQ6KgY0s8nTug0_8-mhwHRR9OQf40dABn_qbrt_5TIsPl4UHZxQ9zb078ZybQOGMR5p1Fysxf1ChR_TNa5nYUtlV0gmd80nICabE5GnaTPmB_FHjnJuSwXRDY2ZkVHoXnsc8aGIIwIq7PLTC76T7G_lUyyZ1aCxjrViA',
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
    this.handleTogglePlay = this.handleTogglePlay.bind(this);
    this.handlePreviousTrack = this.handlePreviousTrack.bind(this);
    this.handleNextTrack = this.handleNextTrack.bind(this);
    this.handleRewind = this.handleRewind.bind(this);
    this.handleFoward = this.handleFoward.bind(this);
    this.handleSeekPosition = this.handleSeekPosition.bind(this);
    this.getPodcastsPlaylist = this.getPodcastsPlaylist.bind(this);
  }

  //Carrega uma determinada playlist de Episodios
  async getPodcastsPlaylist() {
    const { token } = this.state;
    const uri = '6KQIl4LUtifl3S3B37clPZ';
    new SpotifyWebApi().setAccessToken(token);
    await new SpotifyWebApi().getShowEpisodes(uri, {}, (err, res) => {
      if (err) {
        console.log(err);
      }
      this.setState({ podcastsData: res });
    });
  }

  // async startResume() {
  //   const { token, podcastsData: {items}, deviceId } = this.state;
  //   const data = items.map(({ uri }) => uri);
  //   new SpotifyWebApi().setAccessToken(token);
  //   new SpotifyWebApi().play({device_id: deviceId, position_ms: 0, uris: data}, (err, ok) => err ? console.log(err) : console.log(ok));
  // }

  // transferPlaybackHere() {
  //   const { deviceId, token } = this.state;
  //   fetch('https://api.spotify.com/v1/me/player', {
  //     method: 'PUT',
  //     headers: {
  //       authorization: `Bearer ${token}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       device_ids: [deviceId],
  //       play: false,
  //     }),
  //   });
  // }

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

  //Inicia o player após receber as informações da playlist
  async play(device_id, token, podcastsData) {
    const { items } = podcastsData;
    await $.ajax({
      url: 'https://api.spotify.com/v1/me/player/play?device_id=' + device_id,
      type: 'PUT',
      data: `{"uris": ${JSON.stringify(
        items.map(({ uri }) => uri)
      )} ,  "position_ms": 0}`,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      },
    });
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

  createEventHandlers() {
    const { token, podcastsData } = this.state;
    //tratamento de erros
    this.player.on('initialization_error', (e) => {
      console.error(e);
      this.setState({ error: e.message });
    });
    this.player.on('authentication_error', (e) => {
      console.error(e);
      this.setState({ error: e.message });
    });
    this.player.on('account_error', (e) => {
      console.error(e);
      this.setState({ error: e.message });
    });
    this.player.on('playback_error', (e) => {
      console.error(e);
      this.setState({ error: e.message });
    });

    // Playback status updates
    this.player.on(
      'player_state_changed',
      (state) => this.onStateChanged(state) || console.log(state)
    );
    // Ready
    this.player.on('ready', async (data) => {
      let { device_id } = data;
      console.log('Let the music play on!');
      this.setState({ deviceId: device_id });
      await this.play(device_id, token, podcastsData);
      this.setState({ loggedIn: true });
      // this.transferPlaybackHere();
    });
  }

  //Botões do Player
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

  handlePreviousTrack() {
    this.player.previousTrack();
  }

  handleTogglePlay() {
    this.player.togglePlay();
  }

  handleNextTrack() {
    this.player.nextTrack();
  }

  handleSeekPosition(position) {
    console.log('funcionou', position)
    this.player.seek(position).then(() => {
      console.log(`Changed position to ${position}`);
    });
  }

  async handleLogin() {
    this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
    await this.getPodcastsPlaylist();
  }

  render() {
    const { loggedIn, error, duration, position } = this.state;
    const progressTime = position / duration > 0 ? position / duration : 0;
    return (
      <>
        <div className="App">
          <h2>Now Playing</h2>
          <p>A Spotify Web Playback API Demo.</p>

          {error && <p>Error: {error}</p>}

          {loggedIn ? (
            <>
              <SpotifyPlayer
                data={this.state}
                handleTogglePlay={this.handleTogglePlay}
                handleNextTrack={this.handleNextTrack}
                handlePreviousTrack={this.handlePreviousTrack}
                handleRewind={this.handleRewind}
                handleFoward={this.handleFoward}
                handleSeekPosition={this.handleSeekPosition}
              />
            </>
          ) : (
            <div className="App-intro">
              <p>
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
                <button onClick={() => this.handleLogin()}>
                  Play Podcasts
                </button>
              </p>
            </div>
          )}
        </div>
        <div
          style={{ transform: `scaleX(${progressTime})` }}
          className="progress-bar"
        />
      </>
    );
  }
}

export default App;
