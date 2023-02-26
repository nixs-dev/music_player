import React from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

export default class LoadingPopup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            title: null,
            finished: true,
            loaded: 0,
        }
    }

    async newLoading(title, request) {
        if(!this.state.finished) {
            return false;
        }
        

        await new Promise((resolve, reject) => {
            this.setState({ title: title, loaded: 0, finished: false }, () => {
                console.log(title, this.state.finished);
                resolve();
            });
        });

        // Start request

        request = request((loaded) => this.onLoad(loaded));

        return new Promise((resolve, reject) => {
            request.then((response) => {
                setTimeout(() => {
                    this.setState({ finished: true }, () => {
                        this.props.closeHandler();
                        
                        resolve(response);
                    });
                }, 3000);
            })
        });
    }

    onLoad(loaded) {
        this.setState({ loaded : loaded });
    }

    render() {
        return (
            <Popup open={ this.props.appLoading } contentStyle={{ background: "black" }} modal>
                <div className="modal" id="loading-modal">
                    <div className="modal-header">
                        <div className="header-content">
                            { this.state.title ? this.state.title : "" }
                        </div>
                        <button className="close-modal" onClick={ () => this.props.closeHandler() }><i className="fa-solid fa-circle-xmark"></i></button>
                    </div>
                    <div className="modal-content">
                        <div id="loading-bar">
                            <div id="progress-bar" style={{ width: this.state.loaded + "%" }}>

                            </div>
                        </div>
                    </div>
                </div>
            </Popup>
        );
    }
}