import { 
    deviceType,
    setVideoUrl
} from "./utils.js";

import {
    socket
} from "./socket.js";

const popupForm = document.querySelector('.pop-up > form');

let username;
popupForm.addEventListener('submit', (event) => {
    event.preventDefault();

    //Get user username
    username = event.target[0].value;
    popupForm.reset();

    document.querySelector('body').style.pointerEvents = 'all';
    document.querySelector('.pop-up-container').style.display = 'none';

    document.querySelector('.lds-ring').style.opacity = '1';

    //Establish connection
    if(!socket.getRoomId()) socket.setRoomId();
    socket.joinRoom(username);
});

const movieForm = document.querySelector('.movie-url-form');
const video = document.querySelector('.screen');

const inviteFriends = document.querySelector('.room-code');

inviteFriends.addEventListener('click', async () => {
    const device = deviceType();

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
    
    if(movieUrl.length !== 0) setVideoUrl(movieUrl);
    else console.log('Vuoto');
});

video.addEventListener('play', () => socket.playVideo());
video.addEventListener('pause', () => socket.pauseVideo());