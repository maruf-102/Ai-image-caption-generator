// server.js

const express = require("express");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");
const bodyParser = require("body-parser"); // Keep this - multer only handles multipart, this can handle other types if needed
const multer = require('multer');
const path = require('path');
const fs = require("fs");
const mime = require('mime-types');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
// bodyParser needed to parse non-file fields in multipart requests when using multer
app.use(bodyParser.urlencoded({ extended: false })); // Handle URL-encoded data
app.use(bodyParser.json()); // Handle JSON data

// Google Generative AI Setup
if (!process.env.API_KEY) {
    console.error("FATAL ERROR: GOOGLE_API_KEY is not defined in the .env file.");
}
const googleGenAI = new GoogleGenerativeAI(process.env.API_KEY);
const geminiProModel = googleGenAI.getGenerativeModel({
    model: "gemini-2.0-flash" 
});

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = './uploads/';
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error(`File upload only supports the following filetypes - ${allowedTypes}`));
    }
}).single('file'); // Use multer middleware here

// --- Routes ---
app.get("/", (req, res) => {
    res.send("Welcome to the Image Captioning API");
});

// Image Captioning route
// Apply multer middleware *before* the main handler logic runs
app.post("/caption-image", upload, async (req, res) => {
    // Now req.file should be populated by multer
    // and req.body should contain other form fields (like 'style')

    let filePath = null; // Define here for access in finally block

    try {
        if (!req.file) {
            console.log("Upload request completed, but req.file is undefined.");
            return res.status(400).send('No file uploaded or file type rejected.');
        }
        filePath = req.file.path;
        console.log(`File upload successful: ${filePath}`);

        // +++ Get the requested style from req.body +++
        const requestedStyle = req.body.style || 'default'; // Default if not provided
        console.log(`Requested caption style: ${requestedStyle}`);

        if (!process.env.API_KEY) {
            throw new Error("API_KEY is missing.");
        }

        const mimeType = mime.lookup(filePath);
        if (!mimeType) {
            console.error(`Could not determine mime type for file: ${filePath}`);
            return res.status(400).send('Could not determine file type.');
        }
        console.log(`Determined mime type: ${mimeType}`);

        if (!fs.existsSync(filePath)) {
             throw new Error(`File system inconsistency: Uploaded file not found at ${filePath}`);
        }
        const base64Data = fs.readFileSync(filePath).toString("base64");
        console.log(`Read file: ${filePath}`);

        const imagePart = {
            inlineData: { data: base64Data, mimeType },
        };

        // +++ Construct the prompt based on the requested style +++
        let basePrompt = "Write 5 distinct captions for this image";
        let styleInstruction = "";

        switch (requestedStyle) {
            case 'short':
                styleInstruction = "Make the captions very short and punchy (like keywords or brief phrases).";
                break;
            case 'detailed':
                styleInstruction = "Make the captions detailed, describing elements thoroughly.";
                break;
            case 'humorous':
                styleInstruction = "Make the captions lighthearted and humorous.";
                break;
            case 'formal':
                styleInstruction = "Make the captions formal and descriptive.";
                break;
            // Default case (or 'default' value) uses the base prompt without extra instruction
            case 'default':
            default:
                 styleInstruction = "Make the captions descriptive."; // Explicit default instruction
                break;
        }

        // Combine instructions
        const finalPrompt = `${basePrompt} ${styleInstruction} Ensure captions are clearly numbered.`;
        // +++ End Prompt Construction +++


        const contents = [finalPrompt, imagePart]; // Send updated prompt and image

        console.log(`Sending request to Google AI model: ${geminiProModel.model} with style: ${requestedStyle}`);
        console.log(`Prompt: "${finalPrompt}"`); // Log the final prompt being sent

        const result = await geminiProModel.generateContent(contents);
        const response = result.response;

        if (response && typeof response.text === 'function') {
            const captionText = response.text();
            console.log("Generated Captions received.");
            res.send(captionText);
        } else {
            console.error("Google AI Error: Invalid response structure or content blocked.");
            let apiErrorMsg = 'Failed to get caption from AI service.';
            if (response?.promptFeedback?.blockReason) {
                apiErrorMsg += ` Reason: ${response.promptFeedback.blockReason}`;
            } else if (response?.candidates?.[0]?.finishReason) {
                apiErrorMsg += ` Finish Reason: ${response.candidates[0].finishReason}`;
            }
            res.status(500).send(apiErrorMsg);
        }

    } catch (error) {
        console.error("Error processing /caption-image:", error);
        if (!res.headersSent) {
            res.status(500).send(`Server error: ${error.message || 'Unknown processing error'}`);
        }
    } finally {
        // File Cleanup Logic
        if (filePath) {
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Cleaned up uploaded file: ${filePath}`);
                } else {
                    console.log(`File already removed, skipping finally cleanup: ${filePath}`);
                }
            } catch (unlinkError) {
                console.error("Error during file cleanup:", unlinkError);
            }
        }
    }
});


// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    const uploadDir = path.resolve('./uploads');
    try {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log(`Created uploads directory: ${uploadDir}`);
        } else {
            console.log(`Uploads directory found: ${uploadDir}`);
        }
    } catch (mkdirErr) {
         console.error(`ERROR: Could not create/access uploads directory: ${uploadDir}. Check permissions.`, mkdirErr);
    }
    if (process.env.API_KEY) {
        console.log("GOOGLE_API_KEY found.");
    } else {
         console.warn("WARNING: GOOGLE_API_KEY is not set in .env file.");
    }
});