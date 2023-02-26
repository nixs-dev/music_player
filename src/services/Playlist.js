import axios from "axios";


export default class PlaylistService {
    static getPlaylistContent(playlist, progressCallback=null) {
        return axios.get(`http://127.0.0.1:8000/playlist/${playlist}`, {
            onDownloadProgress: (event) => progressCallback ? progressCallback(Math.round(event.loaded/event.total) * 100) : null
        });
    }

    static getPlaylists(progressCallback=null) {
        return axios.get(`http://127.0.0.1:8000/playlist`, {
            onDownloadProgress: (event) => progressCallback ? progressCallback(Math.round(event.loaded/event.total) * 100) : null
        });
    }
}