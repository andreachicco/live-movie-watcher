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
    const response = await fetch(`http://localhost:5050/room/${roomId}/clients`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });

    const data = await response.json();
    console.log(data);
}

export {
    deviceType,
    createNewHistoryEvent,
    resolvePromise,
    getPartecipants
}