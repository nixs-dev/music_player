import React from "react";
import NewPlaylistPopup from "./NewPlaylistPopup";


export default class DropdownMenu extends React.Component {
    constructor(props) {
        super(props);

        this.newPlaylistTrigger = React.createRef();
        this.state = {
            open: false
        };
    }

    toggleMenu() {
        this.setState({ open: !this.state.open });
    }

    openPlaylistModal() {

    }

    render() {
        return (
            <div id="app-menu">
                <button className="button" onClick={ (event) => this.toggleMenu() }>Menu</button>

                { this.state.open &&
                    <ul id="menu">
                        <div class="menu-item">
                            <li>Minhas playlists</li>

                            <ul id="submenu">

                                { this.props.playlists.map((p) => {
                                return (
                                    <div key={ `playlist-${p.id}` } class="menu-item">
                                    <li>
                                        <a href={ `/?playlist=${p.id}` }>{ p.name }</a>
                                    </li>
                                    </div>
                                );
                                }) }

                                <NewPlaylistPopup trigger={
                                    <button ref={ this.newPlaylistTrigger } class="menu-item" id="new-playlist" type="button">
                                        Nova
                                    </button>
                                }/>
                            </ul>
                        </div>
                        <div class="menu-item">
                            <li>Sobre</li>
                        </div>
                        <div class="menu-item">
                            <li>Sair</li>
                        </div>
                    </ul>
                }
            </div>
        )
    }
}