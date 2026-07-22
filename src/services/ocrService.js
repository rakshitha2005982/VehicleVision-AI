const fs = require("fs");
const Tesseract = require("tesseract.js");
const { preprocessImage } = require("./preprocessService");

const runOCR = async (imagePath, timeoutMs = 15000) => {
    let processedImage = imagePath;
    try {
        processedImage = await preprocessImage(imagePath);
    } catch (err) {
        console.warn("⚠️ Preprocessing failed, using raw image for OCR:", err.message);
    }

    try {
        const ocrTask = Tesseract.recognize(
            processedImage,
            "eng",
            {
                tessedit_pageseg_mode: 7,
                tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            }
        );

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("OCR timed out")), timeoutMs);
        });

        const result = await Promise.race([ocrTask, timeoutPromise]);

        const text = (result && result.data && result.data.text) ? result.data.text
            .replace(/\n/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .toUpperCase() : "";

        return text;
    } finally {
        if (processedImage && processedImage !== imagePath && fs.existsSync(processedImage)) {
            fs.unlink(processedImage, (err) => {
                if (err) console.warn("Failed to delete temp preprocessed file:", err.message);
            });
        }
    }
};

// ===============================
// Extract Vehicle Number
// ===============================

const extractVehicleNumber = async (imagePathOrText) => {
    try {
        let text = imagePathOrText;

        // If it looks like a file path, run OCR
        if (typeof imagePathOrText === "string" && (imagePathOrText.includes("/") || imagePathOrText.includes("\\") || fs.existsSync(imagePathOrText))) {
            text = await runOCR(imagePathOrText);
        }

        console.log("OCR Text for vehicle number check:", text);

        if (!text) return "NOT_DETECTED";

        const vehicleRegex = /\b[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{3,4}\b/g;
        const matches = text.match(vehicleRegex);

        if (matches && matches.length > 0) {
            return matches[0].replace(/\s+/g, "");
        }

        return "NOT_DETECTED";
    } catch (error) {
        console.warn("⚠️ OCR vehicle number extraction failed. Returning fallback.", error.message);
        return "NOT_DETECTED";
    }
};

// ===============================
// Extract Complete OCR Text
// ===============================

const extractText = async (imagePath) => {
    try {
        const text = await runOCR(imagePath);
        console.log("Full OCR Text:", text);
        return text;
    } catch (error) {
        console.warn("⚠️ OCR text extraction failed. Returning empty text.", error.message);
        return "";
    }
};

module.exports = {
    runOCR,
    extractVehicleNumber,
    extractText
};