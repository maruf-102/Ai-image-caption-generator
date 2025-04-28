# AI Image Captioning Tool
![Screenshot of AI Image Captioning Tool](https://github.com/user-attachments/assets/1f71b5b2-2543-446e-89f2-bce76cd1f28e)

## About This Project

This web application leverages the power of the Google Gemini AI model to generate descriptive captions for uploaded images. It aims to provide helpful descriptions, particularly for visually impaired users, and includes options for different caption styles and text-to-speech output.

## Features

* **Image Upload:** Supports uploading common image formats (JPEG, PNG, GIF, WEBP).
* **AI Caption Generation:** Connects to the Google Gemini API (configurable model, e.g., `gemini-1.5-pro`) to generate 5 distinct captions for the uploaded image.
* **Style Selection:** Allows users to choose a desired style/tone for the generated captions (e.g., Default, Short, Detailed, Humorous, Formal).
* **Text-to-Speech:** Reads the generated captions aloud using the browser's built-in speech synthesis capabilities.
* **Modern UI:** Responsive interface built with Bootstrap and enhanced with custom styling, including loading indicators.
* **Backend Server:** Uses Node.js and Express to handle image uploads and communication with the Gemini API securely.

## Technologies Used

* **Frontend:**
    * HTML5
    * CSS3 (with Bootstrap 4)
    * JavaScript (Vanilla JS)
    * Axios (for API requests)
* **Backend:**
    * Node.js
    * Express.js
    * `@google/generative-ai` (Google AI SDK for Node.js)
    * Multer (for handling file uploads)
    * `dotenv` (for environment variables)
* **AI Service:**
    * Google Gemini API

## Setup and Installation

Follow these steps to get the project running locally:

1.  **Prerequisites:**
    * Node.js and npm (or yarn) installed.
    * Git installed.
    * A Google Gemini API Key (obtain from [Google AI Studio](https://aistudio.google.com/app/apikey)).

2.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/maruf-102/Ai-image-caption-generator.git](https://github.com/maruf-102/Ai-image-caption-generator.git) # Replace with your actual repo URL if different
    cd Ai-image-caption-generator
    ```

3.  **Backend Setup:**
    * Navigate to the backend directory:
        ```bash
        cd backend
        ```
    * Install backend dependencies:
        ```bash
        npm install
        # or: yarn install
        ```
    * Create an environment file named `.env` in the `backend` directory.
    * Add your Google Gemini API key to the `.env` file:
        ```dotenv
        API_KEY="YOUR_GOOGLE_API_KEY"
        ```
        *(Replace `YOUR_GOOGLE_API_KEY` with your actual key)*

4.  **Frontend Setup:**
    * No specific installation steps are usually required for the frontend if you haven't added separate build tools.

## Running the Application

1.  **Start the Backend Server:**
    * Make sure you are in the `backend` directory in your terminal.
    * Run the server:
        ```bash
        node server.js
        ```
    * The server should start, typically on port 3000 (or as configured). Keep this terminal running.

2.  **Access the Frontend:**
    * Open the `frontend` directory in your file explorer.
    * Double-click the `index.html` file to open it in your web browser.
    * Alternatively, if you have a simple HTTP server extension (like VS Code's Live Server), you can serve the `frontend` directory.

## Usage

1.  Open the `index.html` page in your browser.
2.  Click "Choose Image File" to select an image from your computer. A preview will be shown.
3.  Select the desired caption style from the dropdown menu.
4.  Click the "Generate Captions" button.
5.  Wait for the loading spinner to disappear. The generated captions will appear in the text area.
6.  Click the "Hear Captions" button to listen to the generated text.

