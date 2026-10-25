 // ==========================================
// 1. SELECT DOM ELEMENTS
// ==========================================
const searchForm = document.getElementById('search-form');
const wordInput = document.getElementById('word-input');
const errorMessage = document.getElementById('error-message');
const themeToggle = document.getElementById('theme-toggle');

// Result elements from HTML
const resultWord = document.getElementById('result-word');
const resultPhonetic = document.getElementById('result-phonetic');
const audioButton = document.getElementById('audio-button');
const definitionsList = document.getElementById('definitions-list');
const synonymsList = document.getElementById('synonyms-list');
const antonymsList = document.getElementById('antonyms-list');


// ==========================================
// 2. EVENT LISTENER FOR SEARCH FORM
// ==========================================
searchForm.addEventListener('submit', function(event) {
    // Prevent the page from refreshing on submit
    event.preventDefault();
    
    // Get the word from input and remove extra spaces
    const word = wordInput.value.trim();
    
    if (word !== "") {
        getWordData(word);
    }
});


// ==========================================
// 3. FETCH DATA FROM API
// ==========================================
async function getWordData(word) {
    // Clear old errors and show loading text
    errorMessage.textContent = "";
    resultWord.textContent = "Searching...";
    resultPhonetic.textContent = "";
    definitionsList.innerHTML = "";
    synonymsList.innerHTML = "";
    antonymsList.innerHTML = "";
    audioButton.style.display = "none";

    try {
        // Use encodeURIComponent to make sure the URL is safe for the API
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        
        // If the server returns a 404 or 500 error
        if (!response.ok) {
            throw new Error("Word not found in the dictionary. Please try another word.");
        }
        
        const data = await response.json();
        displayWordData(data[0]);

    } catch (error) {
        resultWord.textContent = "";
        // This will catch "Failed to fetch" (network/internet issues) or our custom errors
        if (error.name === "TypeError") {
            errorMessage.textContent = "Network error: Please check your internet connection.";
        } else {
            errorMessage.textContent = error.message;
        }
    }
}


// ==========================================
// 4. DISPLAY DATA IN THE DOM
// ==========================================
function displayWordData(wordData) {
    // Display the word and phonetic text
    resultWord.textContent = wordData.word;
    
    if (wordData.phonetic) {
        resultPhonetic.textContent = wordData.phonetic;
    } else {
        resultPhonetic.textContent = "";
    }

    // Handle Audio Pronunciation (loop through phonetics to find an audio link)
    let audioUrl = "";
    for (let i = 0; i < wordData.phonetics.length; i++) {
        if (wordData.phonetics[i].audio) {
            audioUrl = wordData.phonetics[i].audio;
            break; // Stop searching once we find one audio link
        }
    }

    // If an audio link exists, show the button and add click event
    if (audioUrl !== "") {
        audioButton.style.display = "inline-block";
        audioButton.onclick = function() {
            const sound = new Audio(audioUrl);
            sound.play();
        };
    }

    // Loop through meanings to get definitions, synonyms, and antonyms
    for (let i = 0; i < wordData.meanings.length; i++) {
        let meaning = wordData.meanings[i];
        let partOfSpeech = meaning.partOfSpeech;

        // 1. Loop through definitions
        for (let j = 0; j < meaning.definitions.length; j++) {
            let defObj = meaning.definitions[j];
            
            // Create a list item for the definition
            let li = document.createElement('li');
            li.textContent = `(${partOfSpeech}) ${defObj.definition}`;
            definitionsList.appendChild(li);
        }

        // 2. Loop through synonyms (if any)
        if (meaning.synonyms) {
            for (let k = 0; k < meaning.synonyms.length; k++) {
                let li = document.createElement('li');
                li.textContent = meaning.synonyms[k];
                synonymsList.appendChild(li);
            }
        }

        // 3. Loop through antonyms (if any)
        if (meaning.antonyms) {
            for (let m = 0; m < meaning.antonyms.length; m++) {
                let li = document.createElement('li');
                li.textContent = meaning.antonyms[m];
                antonymsList.appendChild(li);
            }
        }
    }

    // Fallback messages if lists are empty
    if (definitionsList.innerHTML === "") {
        definitionsList.innerHTML = "<li>No definitions found.</li>";
    }
    if (synonymsList.innerHTML === "") {
        synonymsList.innerHTML = "<li>No synonyms found.</li>";
    }
    if (antonymsList.innerHTML === "") {
        antonymsList.innerHTML = "<li>No antonyms found.</li>";
    }
}


// ==========================================
// 5. THEME TOGGLE (Dark / Light Mode)
// ==========================================
themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    // Change button text based on current mode
    if (document.body.classList.contains('dark-mode')) {
        themeToggle.textContent = "Light Mode";
    } else {
        themeToggle.textContent = "Dark Mode";
    }
});