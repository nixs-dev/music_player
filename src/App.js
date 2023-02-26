import './App.css';
import React from 'react';
import { Buffer } from 'buffer';
import AppInfo from "./data.json";
import defaultAlbumCover from "./images/disk.png";
import defaultPlaylistCover from "./images/default_playlist_cover.png";
import PlaylistService from './services/Playlist';
import SongService from './services/Song';
import DropdownMenu from './components/DropdownMenu';
import LoadingPopup from './components/LoadingPopup';


export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.inputSong = React.createRef();
    this.timeBar = React.createRef();
    this.loadingBar = React.createRef();
    this.state = {
      loading: false,
      playlist: null,
      playlists: [],
      playlistSongs: [],
      currentSong: null, // keys: songIndex, song, playing
      playing: false,
      songCurrentTime: null,
      songDuration: null,
      songCurrentTimeReadable: null,
      songDurationReadable: null,
    };
  }

  secondsToShortTime(seconds) {
    let parts = {
      "hours": 0,
      "minutes": 0,
      "seconds": 0
    };

    parts["minutes"] = Math.floor(seconds/60);
    parts["seconds"] = Math.floor(((seconds/60) - parts["minutes"]) * 60);

    return `${ parts["minutes"].toString().padStart(2, "0") }:${ parts["seconds"].toString().padStart(2, "0") }`;
  }
  
  setAudioTime(time) {
    this.state.currentSong.song.currentTime = time; 
  }

  setAudio(id, path) {
    let currentSong = {
      songIndex: this.state.playlistSongs.map((s) => s.id).indexOf(id),
      song: new Audio("http://localhost:8000" + path),
      playing: false
    };
    let itWasPlaying = this.state.currentSong ? this.state.currentSong.playing : false;

    if(itWasPlaying) this.play();

    this.songHasChanged(currentSong).then(() => 
    {
      this.state.currentSong.song.ondurationchange = (event) => {
        this.setState({ songDuration: this.state.currentSong.song.duration });
        this.setState({ songDurationReadable: this.secondsToShortTime(this.state.currentSong.song.duration) });
      }

      this.state.currentSong.song.ontimeupdate = (event) => {
        this.setState({ songCurrentTime: this.state.currentSong.song.currentTime });
        this.setState({ songCurrentTimeReadable: this.secondsToShortTime(this.state.currentSong.song.currentTime) });
      }

      this.state.currentSong.song.onended = (event) => {
        this.play();
        this.state.currentSong.song.currentTime = 0;
      }

      if(itWasPlaying) this.play();
    });
  }

  play() {
    this.state.playing ? this.state.currentSong.song.pause() : this.state.currentSong.song.play();
    this.setState({playing: !this.state.playing});
    this.setState({currentSong: {...this.state.currentSong, playing: !this.state.playing }});
  }

  changeCurrentSong(next=true) {
    let newSong = {...this.state.currentSong};
    let itWasPlaying = this.state.currentSong.playing;

    if(next) {
      newSong.songIndex = (this.state.currentSong.songIndex === this.state.playlistSongs.length - 1 ? 0 : this.state.currentSong.songIndex + 1);
    }
    else {
      newSong.songIndex = (this.state.currentSong.songIndex === 0 ? this.state.playlistSongs.length - 1 : this.state.currentSong.songIndex - 1);
    }

    newSong.song = new Audio("http://localhost:8000" + this.state.playlistSongs[newSong.songIndex].path);
    newSong.playing = false;

    if(itWasPlaying) this.play();
    this.songHasChanged(newSong).then(() => {
      if(itWasPlaying) this.play();
    });
  }

  async songHasChanged(newSong) {
    return new Promise((resolve, reject) => {
      this.setState({ currentSong: newSong, playing: false, songCurrentTime: null, songDuration: null, songCurrentTimeReadable: null, songDurationReadable: null}, () => {
        resolve();
      });
    });
  }

  addSongs(files) {
    this.setState({ loading: true });

    Array.from(files).forEach(async (file) => { 
      await this.loadingBar.current.newLoading(`Enviando "${ file.name }"...`, (loadCallback) => SongService.insertSong(this.state.playlist.id, file, loadCallback));
    });

    this.getServerData();
  }

  getServerData() {
    let params = new URLSearchParams(window.location.search);

    if(params.get("playlist")) {
      this.setState({ loading: true });

      this.loadingBar.current.newLoading(`Carregando playlist...`, (loadCallback) => PlaylistService.getPlaylistContent(params.get("playlist"), loadCallback)).then((response) => {
        this.setState({ playlist: response.data.content.playlist });
        this.setState({ playlistSongs: response.data.content.songs });

        localStorage.setItem("lastPlaylist", params.get("playlist"));
      });
    }
    else {
      if(localStorage.getItem("lastPlaylist")) {
        window.location = `/?playlist=${localStorage.getItem("lastPlaylist")}`;
      } 
    }

    this.loadingBar.current.newLoading(`Carregando playlists...`, (loadCallback) => PlaylistService.getPlaylists(loadCallback)).then((response) => {
      this.setState({ playlists: response.data.content });
    });
  }

  componentDidMount() {
    this.getServerData();
  }

  render() {
    return (
      <div id="app">
        <div className="not-render">
          <input type="file" ref={ this.inputSong } accept="audio/*" multiple={ true } onChange={ (event) => this.addSongs(event.target.files) }/>
        </div>
        <div id="app-header">
          <div id="app-logo">
            <img src="/logo.png" alt="icon"/>
          </div>
          <label id="app-title">{ AppInfo.APP_NAME }</label>
          <DropdownMenu playlists={this.state.playlists}/>
        </div>
        <div id="app-body">
          <div id="player">
            <div id="player-frame">
              <div id="album-cover">
                { this.state.currentSong && this.state.playlistSongs[this.state.currentSong.songIndex].cover ? <img className="static-cover" alt="Capa" src={ "data:image/png;base64," + Buffer.from(this.state.playlistSongs[this.state.currentSong.songIndex].cover.data).toString("base64") }/> : <img className={ this.state.playing ? "spin" : null } alt="Capa" src={defaultAlbumCover}/> }
              </div>

              <div id="song-info">
                <label id="song-name">{ this.state.currentSong ? this.state.playlistSongs[this.state.currentSong.songIndex].name : "Desconhecido"}</label>
                <label id="album-name">{ this.state.currentSong ? this.state.playlistSongs[this.state.currentSong.songIndex].album : "Desconhecido"}</label>
              </div>

              <div id="song-progress">
                <input ref={ this.timeBar } type="range" max={ this.state.songDuration } value={ this.state.songCurrentTime === null ? 0 : this.state.songCurrentTime } onChange={ (event) => this.setAudioTime(event.target.value) }/>

                <div id="song-duration">
                  <label id="song-time">{ this.state.songCurrentTimeReadable === null ? "00:00" : this.state.songCurrentTimeReadable }</label>
                  /
                  <label id="song-limit">{ this.state.songDurationReadable === null ? "00:00" : this.state.songDurationReadable }</label>
                </div>
              </div>

              <div id="song-options" className={ this.state.currentSong ? null : "disabled"}>
                <button className="button-player small"><i className="fa-solid fa-arrows-spin"></i></button>
                <button className="button-player"><i className="fa-solid fa-backward-fast" onClick={ (event) => this.changeCurrentSong(false) }></i></button>
                <button className="button-player" onClick={ () => this.play() }>{ this.state.playing ? <i className="fa-solid fa-circle-pause"></i> : <i className="fa-solid fa-circle-play"></i> }</button>
                <button className="button-player"><i className="fa-solid fa-forward-fast" onClick={ (event) => this.changeCurrentSong() }></i></button>
                <button className="button-player small"><i className="fa-solid fa-repeat"></i></button>
              </div>
            </div>
          </div>
          <div id="playlist">
            <div id="playlist-info">
              <div id="playlist-cover">
                <img src={ this.state.playlist && this.state.playlist.cover ? `data:image/png;base64, ${Buffer.from(this.state.playlist.cover.data).toString("base64")}` : defaultPlaylistCover } alt="Capa"/>
              </div>
              <div id="playlist-literal-info">
                <label id="playlist-name">{ this.state.playlist ? this.state.playlist.name : null }</label>
                <p id="playlist-description">{ this.state.playlist ? this.state.playlist.description : null }</p>

                <div id="playlist-options">
                  <button><i className="fa-solid fa-trash"></i></button>
                  <button><i className="fa-solid fa-pen-to-square"></i></button>
                  <button onClick={ (event) => this.inputSong.current.click() }><i className="fa-solid fa-plus"></i></button>
                </div>
              </div>
            </div>
            <div id="songs-list">
              { this.state.playlistSongs.map((s) => {
                  return (
                    <div key={ `song-${s.id}` } className="song" onClick={ () => this.setAudio(s.id, s.path) }>
                      <img className="song-album-cover" src={ s.cover ? "data:image/png;base64," + Buffer.from(s.cover.data).toString("base64") : defaultAlbumCover}/>
                      <label className="song-title">{ s.name }</label>
                      { this.state.currentSong && this.state.playlistSongs[this.state.currentSong.songIndex].id === s.id && this.state.currentSong.playing ? <i className="fa-solid fa-music"></i> : null }
                    </div>
                  );
                })
              }
            </div>
            <div id="playlist-footer">
              <label id="playlist-author">Nixs</label>
              <label id="playlist-update-datetime">{ this.state.playlist ? new Date(this.state.playlist.updatedAt).toDateString() : null }</label>
            </div>
          </div>
        </div>

        <LoadingPopup ref={ this.loadingBar } appLoading={ this.state.loading } closeHandler={ () => this.setState({ loading: false }) } />
      </div>
    );
  }
}
