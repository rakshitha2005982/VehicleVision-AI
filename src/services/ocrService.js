const Tesseract = require("tesseract.js");
const { preprocessImage } = require("./preprocessService");

const extractVehicleNumber = async (imagePath) => {
    try {

        // Preprocess image before OCR
        const processedImage = await preprocessImage(imagePath);

        console.log("Processed Image:", processedImage);

        // Run OCR on processed image
        const result = await Tesseract.recognize(
            processedImage,
            "eng"
        );

        // Full OCR text
        const text = result.data.text
            .replace(/\n/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        console.log("OCR Text:", text);

        // Regex for Indian vehicle numbers
        const vehicleRegex =
            /\b[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{3,4}\b/gi;

        const matches = text.match(vehicleRegex);

        // Return detected vehicle number
        if (matches && matches.length > 0) {
            return matches[0].replace(/\s+/g, "");
        }

        // No valid vehicle number found
        return "NOT_DETECTED";

    } catch (error) {
        console.error("OCR Error:", error);
        throw error;
    }
};

module.exports = {
    extractVehicleNumber
};