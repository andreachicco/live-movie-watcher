import { socket } from "./socket.js";

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

const createNewHistoryEvent = (event) => {
    const eventMessage = event.message;
    
    const historyEventList = document.querySelector('.history-events');

    historyEventList.innerHTML += `<li class="event">${eventMessage}</li>`;

    setTimeout(() => {
        historyEventList.innerHTML = '';
    }, 2000);
}

const resolvePromise = (promise) => {
    if(promise !== undefined) {
        promise
            .then(_ => {})
            .catch(err => console.error(err));
    }
}

const getPartecipants = async (roomId) => {
    const response = await fetch(`/room/${roomId}/clients`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });

    const data = await response.json();
    return data;
}

const updateMemberList = async (roomId) => {

    const memberList = document.querySelector('.members');
    const members = await getPartecipants(roomId);

    memberList.innerHTML = '';

    members.forEach(member => memberList.innerHTML += 
        `<li class="member">
            <i class="fa-solid fa-user-tie"></i>
            <p class="username">${member}</p>
        </li>`
    );
}

const setVideoUrl = (url, toSend = true) => {
    const videoElement = document.querySelector('.screen');

    videoElement.src = url;
    videoElement.load();

    if(toSend) socket.setVideoUrl(url);
} 

export {
    deviceType,
    createNewHistoryEvent,
    resolvePromise,
    getPartecipants,
    updateMemberList,
    setVideoUrl
}