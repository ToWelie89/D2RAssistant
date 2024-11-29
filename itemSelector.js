import ItemsDictionary from './itemsDictionary.js';
let items;

const byId = id => document.getElementById(id);
const byQuery = query => document.querySelector(query);

const addItemToItemSelector = (itemSelector, autoComplete, autoCompleteElementId) => {
    const input = itemSelector.querySelector('.textInput');
    const buttonsContainer = itemSelector.querySelector('.buttonContainer');

    let selectedSuggestion;
    let text;

    if (autoComplete) {
        selectedSuggestion = byQuery(`#${autoCompleteElementId} div.selected`);
    }

    if (autoComplete && selectedSuggestion) {
        text = selectedSuggestion.innerText;
        byId(autoCompleteElementId).innerHTML = '';
        byId(autoCompleteElementId).classList.add('hidden');
    } else {
        text = input.value;
    }

    const box = document.createElement('button');
    box.innerText = text;
    box.addEventListener('click', () => box.remove());
    buttonsContainer.prepend(box);
    input.value = '';
}

const init = async () => {
    const res = await fetch('settings.json');
    if (res) {
        const settings = await res.json();
        if (settings) {
            if (settings.additionalItemsInDictionary) {
                items = [...ItemsDictionary, ...settings.additionalItemsInDictionary];
            }
        }
    }

    document.querySelectorAll('div[type=ITEM_SELECTOR]').forEach(itemSelector => {
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('buttonContainer');

        const placeholder = itemSelector.getAttribute('placeholder');

        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('placeholder', placeholder);
        input.classList.add('textInput');

        itemSelector.appendChild(buttonsContainer);
        itemSelector.appendChild(input);

        const autoComplete = itemSelector.getAttribute('autocomplete') === 'true';
        let autoCompleteElementId;

        if (autoComplete) {
            autoCompleteElementId = itemSelector.getAttribute('autocompleteDiv');
        }

        input.addEventListener('keyup', ev => {
            if (ev.key === 'Escape') {
                if (autoComplete) {
                    byId(autoCompleteElementId).innerHTML = '';
                    byId(autoCompleteElementId).classList.add('hidden');
                }
            } else if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
                if (autoComplete) {
                    const down = (ev.key === 'ArrowDown');
                    const selectedSuggestion = byQuery(`#${autoCompleteElementId} div.selected`);
                    if (!selectedSuggestion) {
                        byQuery(`#${autoCompleteElementId} div:first-child`).classList.add('selected');
                    } else {
                        selectedSuggestion.classList.remove('selected');
                        if (down) {
                            let next = selectedSuggestion.nextSibling ? selectedSuggestion.nextSibling : byQuery(`#${autoCompleteElementId} div:first-child`);
                            next.classList.add('selected');
                        } else {
                            let next = selectedSuggestion.previousSibling ? selectedSuggestion.previousSibling : byQuery(`#${autoCompleteElementId} div:last-child`);
                            next.classList.add('selected');
                        }
        
                        byQuery(`#${autoCompleteElementId} div.selected`).scrollIntoViewIfNeeded(true);
                    }
                }
            } else if (ev.key === 'Enter') {
                addItemToItemSelector(itemSelector, autoComplete, autoCompleteElementId);
            } else { // check with dictionary
                const text = input.value.trim();
                if (ev.key.length === 1 && ev.key.match(/[a-zA-Z0-9åöä ]/g).length > 0) {
                    if (text.length >= 2) {
                        let matches = items.filter(x => x.replace('\'', '').toLowerCase().includes(text.toLowerCase()));
    
                        console.log(matches);
        
                        if (autoComplete) byId(autoCompleteElementId).innerHTML = '';

                        if (matches.length > 0) {
                            matches.forEach(x => {
                                const suggestionBox = document.createElement('div');
                                suggestionBox.innerText = x;
    
                                suggestionBox.addEventListener('click', () => {
                                    const box = document.createElement('button');
                                    box.innerText = x;
                                    box.addEventListener('click', () => box.remove());
                                    buttonsContainer.prepend(box);
                                    input.value = '';

                                    if (autoComplete) {
                                        byId(autoCompleteElementId).innerHTML = '';
                                        byId(autoCompleteElementId).classList.add('hidden');
                                    }
                                });
    
                                if (autoComplete) byId(autoCompleteElementId).append(suggestionBox);
                            });
                            if (autoComplete) {
                                const bbox = input.getBoundingClientRect();
                                console.log(bbox);

                                byId(autoCompleteElementId).style.top = `${Math.floor(bbox.top + bbox.height) + 3}px`;
                                byId(autoCompleteElementId).style.left = `${Math.floor(bbox.left) + 3}px`;
                                byId(autoCompleteElementId).classList.remove('hidden');
                            }
                        } else {
                            if (autoComplete) {
                                byId(autoCompleteElementId).innerHTML = '';
                                byId(autoCompleteElementId).classList.add('hidden');    
                            }
                        }
                    } else {
                        if (autoComplete) {
                            byId(autoCompleteElementId).innerHTML = '';
                            byId(autoCompleteElementId).classList.add('hidden');
                        }
                    }
                } else {
                    if (autoComplete) {
                        byId(autoCompleteElementId).innerHTML = '';
                        byId(autoCompleteElementId).classList.add('hidden');
                    }
                }
            }
        });
    });
}

export default {
    init
}