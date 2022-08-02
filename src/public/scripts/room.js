const movieForm = document.querySelector('.movie-url-form');
const video = document.querySelector('.video');

const socket = io({ forceNew: true });
const socketRoomId = document.URL.split('room/')[1];

//Nuova client nella stanza
socket.emit('new-connection-created', socketRoomId);

movieForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const movieUrl = document.querySelector('.movie-url').value;
    
    if(movieUrl.length !== 0) setMovieUrl(movieUrl);
    else console.log('Vuoto');
});

function setMovieUrl(url, toSend = true) {
    console.log(url);
    video.src = url;
    video.load();
    
    if(toSend) socket.emit('load-movie', socketRoomId, url);
}

video.addEventListener('play', (event) => {
    event.preventDefault();
    socket.emit('play', socketRoomId);
});

video.addEventListener('pause', (event) => {
    event.preventDefault();
    socket.emit('pause', socketRoomId);
});

//Socket connections
socket.on('new-user-connected', () => console.log('New User Connected'));
socket.on('user-disconnected', () => console.log('User Disconnected'));

// socket.on('closeRoom', () => window.location = '/');

socket.on('set-movie', url => setMovieUrl(url, false));

socket.on('movie-play', () => {
    const promise = document.querySelector('.video').play();
    resolvePromise(promise);
});

socket.on('movie-pause', () => {
    const promise = document.querySelector('.video').pause();
    resolvePromise(promise);
});

function resolvePromise(promise) {
    if(promise !== undefined) {
        promise
            .then(_ => {})
            .catch(err => console.error(err));
    }
}