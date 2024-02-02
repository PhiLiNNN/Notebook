let titels = [];
let contents = [];
let draggingNoteId;
let targetNoteId = null;
let notesIdArr = [];


function render() {
    load();
    createNoteContainers();
    setupTextarea();
    setupDragAndDrop();
}


function setupTextarea() {
    let textarea = document.getElementById("input1");
    textarea.addEventListener("input", resizeTextarea);
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keyup", handleDocumentClick);
}


function setupDragAndDrop() {
    let notesContainer = document.getElementById("notes-container-id");
    
    notesContainer.addEventListener('dragstart', handleDragStart);
    notesContainer.addEventListener('dragover', handleDragOver);
    notesContainer.addEventListener('dragend', handleDragEnd);
    
}


function handleDragStart(e) { 
    if (e.target.classList.contains('notes')) {  e.target.classList.add('dragging'); } 
}


function handleDragEnd(e) {
    if (e.target.classList.contains('notes')) {
        e.target.classList.remove('dragging');
        draggingNoteId = e.target.id;
    }
    
    renderAfterDragging(draggingNoteId, targetNoteId)
    targetNoteId = null;
}


function handleDragOver(e) {
    e.preventDefault();
    let draggingNote = document.querySelector('.dragging');
    let targetNote = e.target.closest('.notes');
    
    if (targetNote && draggingNote !== targetNote) {
        let { top, height } = targetNote.getBoundingClientRect();
        let offset = e.clientY - top;
        let insertBefore = offset <= height / 2;

        targetNoteId = targetNote.id;
        targetNote.parentNode.insertBefore(draggingNote, insertBefore ? targetNote : targetNote.nextSibling); 
    } 
}


function renderAfterDragging(draggedNote, targetdNote) {
    let draggedNum = parseInt(draggedNote.replace('note', ''), 10);
    let draggedContainer = document.getElementById(draggedNote);
    let getContainerData = container => ({
        titel: container.querySelector('.input').value,
        content: container.querySelector('.textarea').value
    });
    let temp = [];
    temp.push(notesIdArr[draggedNum]);
    let draggedData = getContainerData(draggedContainer);
    let newNotePos = checkDraggingCondition(draggedNum, targetdNote);
    [titels[newNotePos], contents[newNotePos]] = [draggedData.titel, draggedData.content];
    notesIdArr[newNotePos] = temp[0];
    
    save();
    createNoteContainers();
}

function checkDraggingCondition(draggedNum, targetdNote) {
    if (targetdNote === null) { return; }
    let targetNum = parseInt(targetdNote.replace('note', ''), 10);

    if (targetNum === null)  { return; }
    if (draggedNum < targetNum) {
        for (let i = draggedNum; i < targetNum; i++) {
            [titels[i], contents[i]] = [titels[i + 1], contents[i + 1]];
            notesIdArr[i] = notesIdArr[i + 1]; 
        }
        return targetNum;
    }
    else if (draggedNum > targetNum) {
        for (let i = draggedNum; i > targetNum; i--) {
            [titels[i], contents[i]] = [titels[i - 1], contents[i - 1]];
            notesIdArr[i] = notesIdArr[i - 1];             
        }
        return targetNum;
    }
}

function load() {
    titels = loadDataFromLocalStorage('titels') || [];
    contents = loadDataFromLocalStorage('contents') || [];
    notesIdArr = loadDataFromLocalStorage('data') || [];
}


function loadDataFromLocalStorage(key) {
    let dataText = localStorage.getItem(key);
    return JSON.parse(dataText);
}


function createNoteContainers() {
    let notes = document.getElementById('notes-container-id');
    notes.innerHTML = '';
    titels.forEach((notesTitel, i) => {
        let notesContent = contents[i];
        let date = notesIdArr[i].date;
        let time = notesIdArr[i].time;
        notes.innerHTML += templateNotes(i, notesTitel, notesContent, date, time);
    });
}


function resizeTextarea() {
    let textarea = document.getElementById("input1");
    textarea.style.height = "auto";
    let scHeight = textarea.scrollHeight;
    textarea.style.height = `${scHeight}px`;
}


function handleDocumentClick(event) {
    let clickedNoteId = getClickedNoteId(event);
    let content = document.getElementById('input1'); 
    let titel = document.getElementById('input2'); 
    let noteBlock = document.getElementById('note-block'); 

    if (!noteBlock.contains(event.target)) {
        // handleContentAndTitleClick aufrufen, wenn außerhalb des noteBlock geklickt wurde
        handleContentAndTitleClick(content, titel);
    }

    if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.altKey) {
        // handleContentAndTitleClick aufrufen, wenn die Enter-Taste gedrückt wurde
        handleContentAndTitleClick(content, titel);
    }
    if (clickedNoteId && !event.target.classList.contains('button')) {
        let targetNote = document.getElementById(clickedNoteId);
        openPopup(targetNote, clickedNoteId);
    }
}


function resetTextareaSize() {
    let textarea = document.getElementById("input1");
    textarea.style.height = "10px";
}


function saveDataToLocalStorage(key, data) { localStorage.setItem(key, JSON.stringify(data)); }


function save() {
    saveDataToLocalStorage('titels', titels);
    saveDataToLocalStorage('contents', contents);
    saveDataToLocalStorage('data', notesIdArr );
}



function deleteNote(note) {
    let deletedTitels = loadDataFromLocalStorage('deletedTitels');
    let deletedContents = loadDataFromLocalStorage('deletedContents');
    let deletedNotesId = loadDataFromLocalStorage('deletedNotesId');
    
    if (!deletedTitels) { deletedTitels = []; }
    if (!deletedContents) { deletedContents = []; }
    if (!deletedNotesId) { deletedNotesId = []; }

    if (titels[note] || contents[note]) {
        deletedTitels.push(titels[note]);
        deletedContents.push(contents[note]);
        deletedNotesId.push(notesIdArr[note]);
    }

    saveDataToLocalStorage('deletedTitels', deletedTitels);
    saveDataToLocalStorage('deletedContents', deletedContents);
    saveDataToLocalStorage('deletedNotesId', deletedNotesId);

    titels.splice(note, 1);
    contents.splice(note, 1);
    notesIdArr.splice(note, 1);

    save();
    createNoteContainers();
}


function changeNote(noteID) {
    let idAsNumber = parseInt(noteID.replace('note', ''), 10);
    let newContent = document.getElementById('tempContent').value;
    let newTitel = document.getElementById('tempTitel').value;

    contents[idAsNumber] = newContent;
    titels[idAsNumber] = newTitel;
    document.getElementById('popupid').classList.add('d-none');

    save();
    createNoteContainers();
}


function openPopup(targetNote, noteID) {
    document.getElementById('popupid').classList.remove('d-none');
    document.activeElement.blur();

    let popup = document.getElementById('popupid');
    let inputField = targetNote.querySelector('.input');
    let textareaField = targetNote.querySelector('.textarea');
    let inputValue = inputField.value;
    let textareaValue = textareaField.value;
    
    popup.innerHTML = templatePopup(inputValue, textareaValue, noteID);
    document.addEventListener('click', closePopup); 
}


function closePopup(event) {
    let popupContent = document.querySelector('.popup');
    if (!popupContent.contains(event.target)) {
        document.getElementById('popupid').classList.add('d-none');
        document.removeEventListener('click', closePopup);
    }
}


function getClickedNoteId(event) {
    let targetNote = event.target.closest('.notes');
    
    if (targetNote) {
        let clickedNoteId = targetNote.id;
        return clickedNoteId;
    } 
}

function isContentOnlyNewlines(content) { return content.replace(/[\s\n\r]+/g, ''); }

function resetInputs(titel, content) {
    titel.value = '';
    content.value = '';
    resetTextareaSize();
}

function handleContentAndTitleClick(content, titel) {
    let trimmedContent = isContentOnlyNewlines(content.value);

    if (titel.value.trim() !== "" || trimmedContent.trim() !== "") {
        titels.push(titel.value);
        contents.push(content.value);

        let { date, time } = dateAndTime();
        let fullID = (date + time).replace(/[-:. ]/g, '');
        let timeWoMs = time.slice(0, -4);
        let noteObject = {
            fullID: fullID,
            date: date,
            time: timeWoMs
        };

        notesIdArr.push(noteObject);
        save();
        createNoteContainers(date, time);
    }
    resetInputs(titel, content);
}


function dateAndTime() {
    let currentDate = new Date();
    let year = currentDate.getFullYear();
    let month = ('0' + (currentDate.getMonth() + 1)).slice(-2); 
    let day = ('0' + currentDate.getDate()).slice(-2);
    let hours = ('0' + currentDate.getHours()).slice(-2);
    let minutes = ('0' + currentDate.getMinutes()).slice(-2);
    let seconds = ('0' + currentDate.getSeconds()).slice(-2);
    let milliseconds = ('00' + currentDate.getMilliseconds()).slice(-3);
    let fullDate = `${year}-${month}-${day}`;
    let fullTime = `${hours}:${minutes}:${seconds}:${milliseconds}`;
   
    return { date: fullDate, time: fullTime };
}
function templatePopup(inputValue, textareaValue, noteID) {
    return /*html*/`
            <div class="popup">
                <input id="tempTitel" type="text"  placeholder="Titel" value="${inputValue}" >
                <textarea id="tempContent" placeholder="Notiz schreiben...">${textareaValue}</textarea>
                <button  class="button" onclick="changeNote('${noteID}')">Änderungen speichern</button> 
            </div>
        `;
}


function templateNotes(noteID, titel, content, date, time) {
    return /*html*/`
            <div id="note${noteID}" class="notes" draggable="true">
                <input class="input" type="text" value="${titel}">
                <textarea class="textarea">${content}</textarea>
                <div class="date-and-Clock-container">
                    <button class="button" onclick="deleteNote('${noteID}')">Löschen</button> 
                    <div class="date-and-Clock">
                        <p>erstellt:</p>
                        <span>${date}</span>
                        <span>${time} Uhr</span>
                    </div> 
                </div>
            </div>
        `;
}