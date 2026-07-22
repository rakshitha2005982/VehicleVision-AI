const sharp = require("sharp");

async function analyzeImage(imagePath, ocrText = "") {

    try {

        // Read metadata
        const metadata = await sharp(imagePath).metadata();

        // Read grayscale pixels
        const { data } = await sharp(imagePath)
            .greyscale()
            .raw()
            .toBuffer({ resolveWithObject: true });

        // ----------------------------
        // Brightness Analysis
        // ----------------------------

        let brightness = 0;

        for (let i = 0; i < data.length; i++) {
            brightness += data[i];
        }

        brightness /= data.length;

        // ----------------------------
        // Blur Detection
        // ----------------------------

        let blurScore = 100;

        if (brightness < 40)
            blurScore = 30;
        else if (brightness < 80)
            blurScore = 60;

        // ----------------------------
        // Screenshot Detection
        // ----------------------------

        const keywords = [

            "whatsapp",
            "instagram",
            "gallery",
            "chrome",
            "youtube",
            "settings",
            "battery",
            "wifi",
            "lte",
            "5g",
            "messages",
            "camera"

        ];

        const text = ocrText.toLowerCase();

        const containsUIWords = keywords.some(word =>
            text.includes(word)
        );

        const screenshotDetected =
            !metadata.exif &&
            containsUIWords;

        // ----------------------------
        // Metadata
        // ----------------------------

        const metadataAnalysis = {

            format: metadata.format,

            density: metadata.density || 72,

            hasExif: !!metadata.exif,

            channels: metadata.channels

        };

        // ----------------------------
        // Confidence
        // ----------------------------

        let confidenceScore = 100;

        if (brightness < 60)
            confidenceScore -= 10;

        if (blurScore < 100)
            confidenceScore -= 15;

        if (screenshotDetected)
            confidenceScore -= 20;

        if (!metadata.exif)
            confidenceScore -= 5;

        confidenceScore = Math.max(confidenceScore, 0);

        return {

            width: metadata.width,

            height: metadata.height,

            brightnessScore: Number(brightness.toFixed(2)),

            blurScore,

            screenshotDetected,

            metadata: metadataAnalysis,

            confidenceScore

        };

    }

    catch (error) {

        console.error(error);

        throw error;

    }

}

module.exports = {
    analyzeImage
};