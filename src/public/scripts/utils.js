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

export {
    deviceType,
    createNewHistoryEvent,
    resolvePromise
}