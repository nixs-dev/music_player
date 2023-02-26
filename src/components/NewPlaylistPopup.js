import React from "react";
import Popup from "reactjs-popup";
import PlaylistService from "../services/Playlist";


export default class NewPlaylistPopup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            playlistData: {
                cover: null,
                name: null,
                description: null
            }
        }
    }

    createPlaylist() {

    }

    render() {
        return (
            <Popup trigger={ this.props.trigger } contentStyle={{ background: "black" }} modal>
                <div className="modal" id="new-playlist-modal">
                    <div className="modal-header">
                        <i className="fa-solid fa-circle-xmark"></i>
                    </div>
                    <div className="modal-content">
                        <label>Nova Playlist</label>
                        <div id="playlist-data">
                            <div className="playlist-info">
                                <label>Capa</label>
                                <input type="file" onChange={ (event) => this.setState({ playlistData: {...this.state.playlistData, cover: event.target.files[0]}}) }/>
                            </div>
                            <div className="playlist-info">
                                <label>Nome</label>
                                <input type="text" onChange={ (event) => this.setState({ playlistData: {...this.state.playlistData, name: event.target.value}}) }/>
                            </div>
                            <div className="playlist-info">
                                <label>Descrição</label>
                                <input type="text" onChange={ (event) => this.setState({ playlistData: {...this.state.playlistData, description: event.target.value}}) }/>
                            </div>
                        </div>

                        <button type="button" onClick={ () => this.createPlaylist() }>ubmit</button>
                    </div>
                </div>
            </Popup>
        );
    }
}