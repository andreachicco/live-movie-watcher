const movieForm = document.querySelector('.movie-url-form');
const video = document.querySelector('.video');

const socket = io({ forceNew: true });
const socketRoom = document.URL.split('room/')[1];

socket.emit('newUser', socketRoom);

movieForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const movieUrl = document.querySelector('.movie-url').value;
    
    if(movieUrl.length !== 0) setMovieUrl(movieUrl);
    else console.log('Vuoto');
});

function setMovieUrl(url, toSend = true) {
    video.src = url;
    video.load();
    
    if(toSend) socket.emit('loadMovie', socketRoom, url);
}

video.addEventListener('play', (event) => {
    event.preventDefault();
    socket.emit('play', socketRoom);
});

video.addEventListener('pause', (event) => {
    event.preventDefault();
    socket.emit('pause', socketRoom);
});

//Socket connection
socket.on('closeRoom', () => window.location = '/');

socket.on('setMovie', url => setMovieUrl(url, false));

socket.on('moviePlay', () => {
    const promise = document.querySelector('.video').play();
    resolvePromise(promise);
});

socket.on('moviePause', () => {
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