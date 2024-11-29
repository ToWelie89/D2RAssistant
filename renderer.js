import ItemsDictionary from './itemsDictionary.js';
let items;

import ItemSelector from './itemSelector.js';

let farmingPlaces = [{
    name: 'The Pit',
    id: 'the_pit'
}, {
    name: 'Travincal',
    id: 'travincal'
}, {
    name: 'Mephisto',
    id: 'meph'
}, {
    name: 'Andariel',
    id: 'andariel'
}, {
    name: 'Chaos Sanctuary',
    id: 'cs'
}, {
    name: 'Chaos Sanctuary and Diablo',
    id: 'cs_and_diablo'
}, {
    name: 'Baal',
    id: 'baal'
}, {
    name: 'Cow Level',
    id: 'cow_level'
}, {
    name: 'Arcane Sanctuary',
    id: 'arcane_sanctury'
}, {
    name: 'Tristram',
    id: 'tristram'
}, {
    name: 'Ancient Tunnels',
    id: 'ancient_tunnels'
}, {
    name: 'Pindleskin',
    id: 'pindle'
}, {
    name: 'Shenk',
    id: 'shenk'
}, {
    name: 'Eldritch',
    id: 'eldritch'
}, {
    name: 'Shenk and Eldritch',
    id: 'shenk_and_eldritch'
}, {
    name: 'Pindle, Shenk and Eldritch',
    id: 'pindle_and_shenk_and_eldritch'
}, {
    name: 'Pindle and Shenk',
    id: 'pindle_and_shenk'
}];

const byId = id => document.getElementById(id);
const byQuery = query => document.querySelector(query);

const startButton = byId('startRunButton');
const stopButton = byId('stopRunButton');
const nextButton = byId('nextRunButton');
const runDropdown = byId('runDropdown');

let isRunning = false;
let interval;
let intervalNumber;
let timestamp;
let runs = [];

const msToText = ms => {
    let minutes = Math.floor((ms * 0.001) / 60);
    let seconds;
    if (minutes > 0) {
        seconds = Math.floor((ms % (minutes * 60 * 1000)) / 1000);
    } else {
        seconds = Math.floor(ms / 1000);
    }
    let msLeft = ms - (minutes * 60 * 1000) - (seconds * 1000);

    if ((minutes + '').length === 1) minutes = `0${minutes}`;
    if ((seconds + '').length === 1) seconds = `0${seconds}`;
    if ((msLeft + '').length === 1) msLeft = `00${msLeft}`;
    if ((msLeft + '').length === 2) msLeft = `0${msLeft}`;
    if ((msLeft + '').length === 3) msLeft = `${msLeft}`;

    return `${minutes}:${seconds}:${msLeft}`;
}

const setRunDropdown = () => {
    let html = '';
    farmingPlaces.forEach(run => {
        html += `<option value="${run.id}">${run.name}</option>`;
    });
    runDropdown.innerHTML = html;
}

const nextEventHandler = () => {
    if (!isRunning) return;

    const now = Date.now();
    const diff = now - timestamp;
    timestamp = now;

    const el = document.createElement('div');
    el.classList.add('runListItem');

    const e1 = document.createElement('div');
    e1.innerText = (runs.length + 1);
    const e2 = document.createElement('div');
    e2.innerText = msToText(diff);

    el.appendChild(e1);
    el.appendChild(e2);

    byId('runList').appendChild(el);
    runs.push({
        time: diff
    });
    intervalNumber = 0;
}

const stopEventHandler = () => {
    //nextEventHandler();
    if (!isRunning) return;

    isRunning = false;

    startButton.classList.remove('disabled');
    runDropdown.classList.remove('disabled');
    stopButton.classList.add('disabled');
    nextButton.classList.add('disabled');

    intervalNumber = 0;
    clearInterval(interval);
    byId('timerLabel').innerHTML = '';

    byId('finishedRunContainer').classList.remove('hidden');
}

const setListeners = () => {
    window.electronAPI.sendMessage((event, value) => {
        console.log('value', value);
        if (value && value.command) {
            if (value.command === 'next') {
                nextEventHandler();
            } else if (value.command === 'stop') {
                stopEventHandler();
            }
        }
    })

    byId('settingsButton').addEventListener('click', () => {
        byId('settingsMenu').classList.add('open');
    });
    byId('settingsWindowCloseButton').addEventListener('click', () => {
        byId('settingsMenu').classList.remove('open');
    });
    byId('mainWindowCloseButton').addEventListener('click', () => {
        window.electronAPI.quit();
    });
    startButton.addEventListener('click', () => {
        isRunning = true;

        byId('finishedRunContainer').classList.add('hidden');

        startButton.classList.add('disabled');
        runDropdown.classList.add('disabled');
        stopButton.classList.remove('disabled');
        nextButton.classList.remove('disabled');

        intervalNumber = 0;
        timestamp = Date.now();
        interval = setInterval(() => {
            intervalNumber += 10;
            byId('timerLabel').innerHTML = msToText(intervalNumber);
        }, 10);
    });
    stopButton.addEventListener('click', () => {
        stopEventHandler();
    });
    nextButton.addEventListener('click', () => {
        nextEventHandler();
    });
    byId('discardButton').addEventListener('click', () => {
        runs = [];
        byId('runList').innerHTML = '';
        byId('finishedRunContainer').classList.add('hidden');
    });
    byId('saveButton').addEventListener('click', () => {
        byId('saveOverlay').classList.remove('hidden');
        byId('blurOverlay').classList.remove('hidden');
    });
    byId('saveOverlayCancelButton').addEventListener('click', () => {
        byId('saveOverlay').classList.add('hidden');
        byId('blurOverlay').classList.add('hidden');
    });
    byId('saveOverlaySaveButton').addEventListener('click', () => {
        window.electronAPI.saveAsFile({
            characterName: byId('characterName').value,
            characterClass: byId('saveOverlayClass').value,
            characterMf: byId('characterMf').value,
            date: Date.now(),
            loot: document.getElementById('itemsFound').value,
            farmingPlace: byId('runDropdown').value,
            comment: byId('runNote').value,
            itemsFound: [...document.querySelectorAll('#itemsFound .buttonContainer button')].map(x => x.innerText),
            runs: runs
        });
        byId('saveOverlay').classList.add('hidden');
        byId('blurOverlay').classList.add('hidden');
        runs = [];
        byId('runList').innerHTML = '';
        byId('finishedRunContainer').classList.add('hidden');
    });
}

const initUI = async () => {
    const res = await fetch('settings.json');
    if (res) {
        const settings = await res.json();
        if (settings) {
            console.log('Settings fetched', settings);
        
            if (settings.additionalItemsInDictionary) {
                items = [...ItemsDictionary, ...settings.additionalItemsInDictionary];
            }
            if (settings.additionalRuns) {
                farmingPlaces = [...farmingPlaces, ...settings.additionalRuns];
            }

            if (settings.nextHotkey) byId('nextRunHotkey').innerText = settings.nextHotkey.toUpperCase();
            if (settings.stopHotkey) byId('stopRunHotkey').innerText = settings.stopHotkey.toUpperCase();
        }
    }

    setRunDropdown();
    setListeners();
    await ItemSelector.init();
}

initUI();