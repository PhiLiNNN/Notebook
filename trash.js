let deletedTitels = [];
let deletedContent = [];
let deletedNotesId = [];

function renderTrash() {
    loadtrash();
    createNoteContainers();
    checkClickEvent();
}

function createNoteContainers() {
    let trash = document.getElementById('trashcontainer');
    trash.innerHTML = '';

    for (let i = 0; i < deletedTitels.length; i++) {
        let titel = deletedTitels[i];
        let content = deletedContent[i];
        let deltedTime = deletedNotesId[i].time;
        let deltedDate = deletedNotesId[i].date;
        let deltedID = deletedNotesId[i].fullID;
        trash.innerHTML += templateDeltedNote(i, titel, content, deltedTime, deltedDate, deltedID);
    }
}


function loadDataFromLocalStorage(key) {
    let dataText = localStorage.getItem(key);
    return JSON.parse(dataText);
}


function saveDataToLocalStorage(key, data) { localStorage.setItem(key, JSON.stringify(data)); }


function loadtrash() {
    deletedTitels = loadDataFromLocalStorage('deletedTitels')|| [];
    deletedContent = loadDataFromLocalStorage('deletedContents')|| [];
    deletedNotesId = loadDataFromLocalStorage('deletedNotesId')|| [];
}


function save() {
    saveDataToLocalStorage('deletedTitels', deletedTitels);
    saveDataToLocalStorage('deletedContents', deletedContent);
    saveDataToLocalStorage('deletedNotesId', deletedNotesId);
}


function deleteNoteForever(note) {
    deletedTitels.splice(note, 1);
    deletedContent.splice(note, 1);
    deletedNotesId.splice(note, 1);
    save();
    createNoteContainers();
}


function recoverNote(titel, content, note, time, date, fullID) {
    let titels = loadDataFromLocalStorage('titels');
    let contents = loadDataFromLocalStorage('contents');
    let notesIdArr = loadDataFromLocalStorage('data');
    let noteObject = {
        fullID: fullID,
        date: date,
        time: time
    };
  
    titels.push(titel);
    contents.push(content);
    notesIdArr.push(noteObject);

    saveDataToLocalStorage('titels', titels);
    saveDataToLocalStorage('contents', contents);
    saveDataToLocalStorage('data', notesIdArr);
    deleteNoteForever(note);
}


function replaceLineBreakes(content) { return content.replace(/\n/g, '\\n'); }


function templateDeltedNote(noteID, titel, content, time, date, fullID) {
    return /*html*/`
            <div id="note${noteID}" class="notes">
                <input class="input" type="text" value="${titel}">
                <textarea class="textarea">${content}</textarea>
                <div class="button-flex">
                    <button class="button click" onclick="deleteNoteForever(${noteID})">Löschen</button> 
                    <button class="button click" onclick="recoverNote('${titel}', '${replaceLineBreakes(content)}', '${noteID}','${time}' ,'${date}' ,'${fullID}')">Wiederherstellen</button>
                </div>
                <div class="icons ">
                    <img classe="click" onclick="deleteNoteForever(${noteID})" src="./icons/trash_button_blue.png">
                    <img classe="click" onclick="recoverNote('${titel}', '${replaceLineBreakes(content)}', '${noteID}','${time}' ,'${date}' ,'${fullID}')" src="./icons/recycle_button_blue.png">
                </div>
            </div>
        `;
}


function checkClickEvent() {
    document.addEventListener('click', (event) => {
        let clickedNoteId = getClickedNoteId(event);
        if (clickedNoteId && !event.target.classList.contains('click')) {
            let targetNote = document.getElementById(clickedNoteId);
            openTrashPopup(targetNote, clickedNoteId);
        }
    })
}


function openTrashPopup(targetNote, noteID) {
    document.getElementById('popupTrashid').classList.remove('d-none');
    document.activeElement.blur();

    let popup = document.getElementById('popupTrashid');
    let inputField = targetNote.querySelector('.input');
    let textareaField = targetNote.querySelector('.textarea');
    let inputValue = inputField.value;
    let textareaValue = textareaField.value;
    
    popup.innerHTML = templateTrashPopup(inputValue, textareaValue, noteID);
    document.addEventListener('click', closeTrashPopup); 
}


function closeTrashPopup() {
    let popupContent = document.querySelector('.popup');
    if (!popupContent.contains(event.target)) {
        document.getElementById('popupTrashid').classList.add('d-none');
        document.removeEventListener('click', closeTrashPopup);
    }
}


function getClickedNoteId(event) {
    let targetNote = event.target.closest('.notes');
    
    if (targetNote) {
        let clickedNoteId = targetNote.id;
        return clickedNoteId;
    } 
}


function templateTrashPopup(inputValue, textareaValue) {
    return /*html*/`
            <div class="popup">
                <input id="tempTitel" disabled type="text"  placeholder="Titel" value="${inputValue}" >
                <textarea id="tempContent" disabled placeholder="Notiz schreiben...">${textareaValue}</textarea>
            </div>
        `;
}