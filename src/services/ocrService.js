const Tesseract = require("tesseract.js");
const { preprocessImage } = require("./preprocessService");

const runOCR = async (imagePath, timeoutMs = 10000) => {
    const processedImage = await preprocessImage(imagePath);

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

    return result.data.text
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();
};

// ===============================
// Extract Vehicle Number
// ===============================

const extractVehicleNumber = async (imagePath) => {

    try {
        const text = await runOCR(imagePath);

        console.log("OCR Text:", text);

        const vehicleRegex =
            /\b[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{3,4}\b/g;

        const matches = text.match(vehicleRegex);

        if (matches && matches.length > 0) {
            return matches[0].replace(/\s+/g, "");
        }

        return "NOT_DETECTED";

    } catch (error) {
        console.warn("⚠️ OCR unavailable. Returning fallback value.", error.message);
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
    extractVehicleNumber,
    extractText
};