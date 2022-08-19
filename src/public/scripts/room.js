import { 
    deviceType,
    createNewHistoryEvent,
    resolvePromise,
    updateMemberList
} from "./utils.js";

const popupForm = document.querySelector('.pop-up > form');

let username;
popupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    username = event.target[0].value;
    popupForm.reset();

    document.querySelector('body').style.pointerEvents = 'all';
    document.querySelector('.pop-up-container').style.display = 'none';

    document.querySelector('.lds-ring').style.opacity = '1';

    socket.emit('new-connection-created', socketRoomId, username);
});

const movieForm = document.querySelector('.movie-url-form');
const video = document.querySelector('.screen');

const inviteFriends = document.querySelector('.room-code');

const socket = io({ forceNew: true });
const socketRoomId = document.URL.split('room/')[1];

//Nuova client nella stanza

inviteFriends.addEventListener('click', async () => {
    const device = deviceType();

    console.log(device)

    if(device === 'tablet' || device === 'mobile') {

        if(!navigator.share) {
            alert('Funzionalità non disponibile');
            return;
        }

        try {
            await navigator.share({
                title: "WeMovie",
                url: document.URL,
            });
        } catch (error) {
            console.error(error);
        }  
        
        return;
    }
    
    if(!navigator.clipboard) {
        alert('Funzionalità non disponibile'); 
        return;
    }

    try {
        await navigator.clipboard.writeText(document.URL);
    } catch (error) {
        console.error(error);
    }
});

movieForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const movieUrl = document.querySelector('.movie-url').value;
    
    if(movieUrl.length !== 0) setMovieUrl(movieUrl);
    else console.log('Vuoto');
});

function setMovieUrl(url, toSend = true) {
    video.src = url;
    video.load();
    
    if(toSend) socket.emit('load-movie', socketRoomId, url);
}

video.addEventListener('play', () => socket.emit('play', socketRoomId));
video.addEventListener('pause', () => socket.emit('pause', socketRoomId));

//Socket connections
socket.on('connection-established', async () => {
    await updateMemberList(socketRoomId)
    document.querySelector('.lds-ring').style.display = 'none';
});

socket.on('new-user-connected', async (username) => {
    createNewHistoryEvent({ message: `${username} si è unito alla stanza` })
    await updateMemberList(socketRoomId);
});
socket.on('user-disconnected', async (username) => {
    createNewHistoryEvent({ message: `${username} si è disconnesso` })
    await updateMemberList(socketRoomId);
});

socket.on('set-movie', url => setMovieUrl(url, false));

socket.on('movie-play', () => {
    const promise = document.querySelector('.screen').play();
    resolvePromise(promise);
});

socket.on('movie-pause', () => {
    const promise = document.querySelector('.screen').pause();
    resolvePromise(promise);
});