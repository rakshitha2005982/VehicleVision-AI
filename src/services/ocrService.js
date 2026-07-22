const Tesseract = require("tesseract.js");
const { preprocessImage } = require("./preprocessService");

// ===============================
// Extract Vehicle Number
// ===============================

const extractVehicleNumber = async (imagePath) => {

    try {

        const processedImage = await preprocessImage(imagePath);

        console.log("Processed Image:", processedImage);

        const result = await Tesseract.recognize(
            processedImage,
            "eng",
            {
                tessedit_pageseg_mode: 7,
                tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            }
        );

        const text = result.data.text
            .replace(/\n/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .toUpperCase();

        console.log("OCR Text:", text);

        const vehicleRegex =
            /\b[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{3,4}\b/g;

        const matches = text.match(vehicleRegex);

        if (matches && matches.length > 0) {
            return matches[0].replace(/\s+/g, "");
        }

        return "NOT_DETECTED";

    } catch (error) {

        console.error("OCR Error:", error);
        return "NOT_DETECTED";

    }

};

// ===============================
// Extract Complete OCR Text
// ===============================

const extractText = async (imagePath) => {

    try {

        const processedImage = await preprocessImage(imagePath);

        const result = await Tesseract.recognize(
            processedImage,
            "eng",
            {
                tessedit_pageseg_mode: 7,
                tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            }
        );

        const text = result.data.text
            .replace(/\n/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .toUpperCase();

        console.log("Full OCR Text:", text);

        return text;

    } catch (error) {

        console.error("OCR Text Extraction Error:", error);

        return "";

    }

};

module.exports = {
    extractVehicleNumber,
    extractText
};