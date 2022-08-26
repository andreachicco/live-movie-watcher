import { 
    updateMemberList,
    createNewHistoryEvent,
    resolvePromise,
    setVideoUrl,
    playSound
} from "./utils.js";

class Socket {
    constructor() {
        this.socket = io({ forceNew: true });
        this.#listenForEvents();
    }

    setRoomId() {
        this.roomId = document.URL.split('room/')[1];
    }

    getRoomId() {
        if(!this.roomId) return null;
        else return this.roomId;
    }

    #setToken(token) {
        this.token = token;
    }

    getToken() {
        return this.token;
    }

    joinRoom(username) {
        const payload = {
            roomId: this.getRoomId(),
            username: username
        };

        this.socket.emit('join-room', JSON.stringify(payload));
    }

    setVideoUrl(videoUrl) {
        const payload = {
            roomId: this.getRoomId(),
            videoUrl: videoUrl
        };

        this.socket.emit('load-movie', JSON.stringify(payload));
    }

    playVideo() {
        this.socket.emit('play', this.getRoomId());
    }

    pauseVideo() {
        this.socket.emit('pause', this.getRoomId());
    }

    #listenForEvents() {
        this.socket.on('connection-established', async (token) => {
            this.#setToken(token);
            await updateMemberList(this.getRoomId());
            document.querySelector('.lds-ring').style.display = 'none';
        });
        
        this.socket.on('new-user-connected', async (username) => {
            createNewHistoryEvent({ message: `${username} si è unito alla stanza` })
            playSound('/assets/sounds/water-drop.mp3');
            await updateMemberList(this.getRoomId());
        });

        this.socket.on('user-disconnected', async (username) => {
            createNewHistoryEvent({ message: `${username} si è disconnesso` })
            await updateMemberList(this.getRoomId());
        });
        
        this.socket.on('set-video', url => setVideoUrl(url, false));
        
        this.socket.on('play-video', () => {
            const promise = document.querySelector('.screen').play();
            resolvePromise(promise);
        });
        
        this.socket.on('pause-video', () => {
            const promise = document.querySelector('.screen').pause();
            resolvePromise(promise);
        });
    }
}

const socket = new Socket();

export {
    socket
}