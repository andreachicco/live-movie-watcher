const movieForm = document.querySelector('.movie-url-form');
const video = document.querySelector('.screen');

const inviteFriends = document.querySelector('.room-code');

const socket = io({ forceNew: true });
const socketRoomId = document.URL.split('room/')[1];

//Nuova client nella stanza
socket.emit('new-connection-created', socketRoomId);

const deviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "tablet";
    }
    else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return "mobile";
    }
    return "desktop";
};

inviteFriends.addEventListener('click', async (event) => {
    event.preventDefault();

    const device = deviceType();

    if(device === 'tablet' || device === 'mobile') {
        if(navigator.share) {
            try {
                await navigator.share({
                    title: "WeMovie",
                    url: document.URL,
                });
            } catch (error) {
                console.error(error);
            }  
        }
        else {
            alert('Funzionalità non disponibile');
        }
        
        return;
    }
    
    if(!navigator.clipboard) alert('Funzionalità non disponibile');

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