// script.js

let caption = ''; // Global variable for the speaker

// DOM Element References
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const submitBtn = document.getElementById('submitBtn');
const speakBtn = document.getElementById('speakBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const imageCaptionElement = document.getElementById('imageCaption');
const captionOutputArea = document.querySelector('.caption-output');
const styleSelect = document.getElementById('captionStyleSelect'); // +++ Get reference to the new dropdown +++

// Event Listener for Image Preview Updates
imageInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        imagePreview.src = URL.createObjectURL(file);
        imageCaptionElement.textContent = 'Captions will appear here after submitting the new image.';
        captionOutputArea.style.display = 'block';
        loadingSpinner.style.display = 'none';
        speakBtn.disabled = true;
        caption = '';
    } else {
        imagePreview.src = "https://placehold.co/500x300/6c757d/white?text=Image+Preview";
        imageCaptionElement.textContent = 'Captions will appear here after submitting an image.';
        captionOutputArea.style.display = 'block';
        loadingSpinner.style.display = 'none';
        speakBtn.disabled = true;
        caption = '';
    }
});

// Event Listener for Submit Button Click
submitBtn.addEventListener('click', function() {
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const selectedStyle = styleSelect.value; // +++ Read selected style +++

        // Update UI for processing state
        imageCaptionElement.textContent = '';
        captionOutputArea.style.display = 'none';
        loadingSpinner.style.display = 'block';
        submitBtn.disabled = true;
        speakBtn.disabled = true;
        caption = '';

        // Process image, passing the selected style
        getCaptionForImage(file, selectedStyle); // +++ Pass style to function +++
    } else {
        alert("Please select an image file first.");
    }
});

// Function to Process Caption via API
// +++ Update function signature to accept captionStyle +++
async function getCaptionForImage(imageFile, captionStyle) {
    let formData = new FormData();
    formData.append('file', imageFile);
    formData.append('style', captionStyle); // +++ Add style to FormData +++

    try {
        // Make the API call
        let response = await axios.post('http://localhost:3000/caption-image', formData, {
            // Axios automatically sets Content-Type to multipart/form-data when FormData is used
            // So explicit header might not be needed, but doesn't hurt
             headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Update UI on Success
        imageCaptionElement.textContent = response.data;
        caption = response.data;
        speakBtn.disabled = false;
        console.log("Caption received.");

    } catch (error) {
        console.error("Error fetching caption:", error);
        // Update UI on Error
        let errorMessage = 'Error generating caption: ';
        if (error.response) {
            errorMessage += `${error.response.data || error.response.statusText || 'Server error'}`;
        } else if (error.request) {
            errorMessage += 'Could not connect to the server. Please check the connection or if the server is running.';
        } else {
            errorMessage += error.message || 'An unknown error occurred.';
        }
        imageCaptionElement.textContent = errorMessage;
        caption = '';
        speakBtn.disabled = true;

    } finally {
        // Always run after try or catch
        loadingSpinner.style.display = 'none';
        captionOutputArea.style.display = 'block';
        submitBtn.disabled = false;
    }
}

// Event Listener for Voicing Button Click
speakBtn.addEventListener('click', function() {
    if (caption && caption.trim() !== '') {
       speakText(caption);
    } else {
        console.log("No valid caption available to speak.");
    }
});

// Text-to-Speech Function (no changes needed here)
function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = 'en-US';
        speech.rate = 1;
        speech.pitch = 1;
        speech.volume = 1;
        window.speechSynthesis.speak(speech);
        speech.onerror = (event) => console.error('Speech synthesis error:', event);
    } else {
        alert("Sorry, your browser does not support text-to-speech!");
    }
}