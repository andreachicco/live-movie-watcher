const movieForm = document.querySelector('.movie-url-form');
const video = document.querySelector('.screen');

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

let timeOut;

function createNewHistoryEvent(event) {
    const eventMessage = event.message;
    
    const historyEventList = document.querySelector('.history-events');

    historyEventList.innerHTML += `<li class="event">${eventMessage}</li>`;


    if(timeOut) clearTimeout();

    timeOut = setTimeout(() => {
        historyEventList.innerHTML = '';
    }, 2000);
}

//Socket connections
socket.on('new-user-connected', () => createNewHistoryEvent({ message: 'Nuovo utente connesso' }));
socket.on('user-disconnected', () => createNewHistoryEvent({ message: 'Utente disconnesso' }));

socket.on('set-movie', url => setMovieUrl(url, false));

socket.on('movie-play', () => {
    const promise = document.querySelector('.screen').play();
    resolvePromise(promise);
});

socket.on('movie-pause', () => {
    const promise = document.querySelector('.screen').pause();
    resolvePromise(promise);
});

function resolvePromise(promise) {
    if(promise !== undefined) {
        promise
            .then(_ => {})
            .catch(err => console.error(err));
    }
}