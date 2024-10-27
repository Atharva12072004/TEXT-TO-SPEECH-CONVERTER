const textInput = document.getElementById('text-input');
const speakBtn = document.getElementById('speak-btn');
const pauseBtn = document.getElementById('pause-btn');
const audioElement = document.getElementById('audio');
const languageSelect = document.getElementById('language-select');
const languageSearch = document.getElementById('language-search');
const selectedLanguageDisplay = document.getElementById('selected-language-display');
const progressBar = document.getElementById('progress-bar');
const speedRange = document.getElementById('speed-range');
const speedValue = document.getElementById('speed-value');
let utterance;
let selectedVoice;  // Variable to store the selected voice

const synth = window.speechSynthesis;

// Function to populate the voice select dropdown
function populateLanguageSelect() {
    const voices = synth.getVoices();
    languageSelect.innerHTML = '';  // Clear existing options

    voices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;  // Use the voice name to select the voice
        option.setAttribute('data-lang', voice.lang);  // Store language
        option.setAttribute('data-name', voice.name);  // Store voice name
        option.textContent = `${voice.name} (${voice.lang})`;
        languageSelect.appendChild(option);
    });

    // Automatically set the first language as selected language in the dropdown
    if (voices.length > 0) {
        selectedVoice = voices[0];
        updateSelectedLanguageDisplay(selectedVoice.name, selectedVoice.lang);
    }
}

function filterLanguages() {
    const searchTerm = languageSearch.value.toLowerCase();
    const options = languageSelect.options;

    for (let i = 0; i < options.length; i++) {
        const optionText = options[i].textContent.toLowerCase();
        if (optionText.includes(searchTerm)) {
            options[i].style.display = '';
        } else {
            options[i].style.display = 'none';
        }
    }
}

function updateSelectedLanguageDisplay(voiceName, lang) {
    selectedLanguageDisplay.textContent = `Selected Language: ${voiceName} (${lang})`;
}

// Ensure voices are loaded before populating
if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = populateLanguageSelect;
} else {
    populateLanguageSelect();
}

function speakText() {
    const text = textInput.value.trim();
    if (!text) {
        return;  // Do nothing if text is empty
    }

    if (synth.speaking) {
        synth.cancel();  // Stop any current speech
    }

    // Retrieve selected voice based on the language-select dropdown
    const selectedOption = languageSelect.selectedOptions[0];
    const selectedVoiceName = selectedOption.getAttribute('data-name');

    utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = synth.getVoices().find(voice => voice.name === selectedVoiceName);  // Set the selected voice
    utterance.lang = selectedOption.getAttribute('data-lang');  // Set the language for the selected voice

    // Set the speech rate based on the speed slider
    utterance.rate = speedRange.value;

    utterance.onend = () => {
        progressBar.style.width = '0%';  // Reset progress bar
    };

    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
    };

    utterance.onboundary = (event) => {
        updateProgressBar(event);
    };

    synth.speak(utterance);
}

function updateProgressBar(event) {
    const { charIndex } = event;
    const textLength = textInput.value.length;
    const progress = (charIndex / textLength) * 100;
    progressBar.style.width = `${progress}%`;
}

function pauseSpeech() {
    if (synth.speaking && !synth.paused) {
        synth.pause();
        audioElement.controls = true;  // Show audio controls if speech is paused
    }
}

function resumeSpeech() {
    if (synth.paused) {
        synth.resume();
    }
}

// Update the selected language display when a new voice is selected
languageSelect.addEventListener('change', () => {
    const selectedOption = languageSelect.selectedOptions[0];
    const selectedVoiceName = selectedOption.getAttribute('data-name');
    const selectedLang = selectedOption.getAttribute('data-lang');
    updateSelectedLanguageDisplay(selectedVoiceName, selectedLang);
});

// Event listener for the speed slider to update the displayed value
speedRange.addEventListener('input', () => {
    speedValue.textContent = speedRange.value;
});

// Event listeners
speakBtn.addEventListener('click', speakText);
pauseBtn.addEventListener('click', pauseSpeech);

// Speech recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

function startSpeechRecognition() {
    let mic = document.getElementById('mic');
    mic.classList.add('glowing');  // Add glowing effect when mic is clicked

    recognition.start();

    recognition.onresult = function(event) {
        let transcript = event.results[0][0].transcript;
        textInput.value = transcript;  // Set input to recognized text
        mic.classList.remove('glowing');  // Remove glowing effect when speech recognition ends
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        mic.classList.remove('glowing');  // Remove glowing effect in case of error
    };

    recognition.onend = function() {
        mic.classList.remove('glowing');  // Remove glowing effect when recognition stops
    };
}
