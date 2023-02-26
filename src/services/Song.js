import axios from "axios";


export default class SongService {
    static insertSong(playlist, song, progressCallback=null) {
        let url = `http://127.0.0.1:8000/playlist/${playlist}/add`;
        let formData = new FormData();

        formData.append("song", song);

        return axios.post(url, formData, {
            onUploadProgress: (event) => progressCallback ? progressCallback(Math.round(event.loaded/event.total) * 100) : null
        });
    }
}