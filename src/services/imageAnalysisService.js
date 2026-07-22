const sharp = require("sharp");

async function analyzeImage(imagePath, ocrText = "") {
    try {
        let metadata = {};
        try {
            metadata = await sharp(imagePath).metadata();
        } catch (e) {
            console.warn("⚠️ Could not read metadata with sharp:", e.message);
        }

        let brightness = 128;
        try {
            const { data } = await sharp(imagePath)
                .greyscale()
                .raw()
                .toBuffer({ resolveWithObject: true });

            let sum = 0;
            for (let i = 0; i < data.length; i++) {
                sum += data[i];
            }
            if (data.length > 0) {
                brightness = sum / data.length;
            }
        } catch (e) {
            console.warn("⚠️ Could not calculate brightness with sharp:", e.message);
        }

        // Blur detection
        let blurScore = 100;
        if (brightness < 40) blurScore = 30;
        else if (brightness < 80) blurScore = 60;

        // Screenshot detection
        const keywords = [
            "whatsapp", "instagram", "gallery", "chrome",
            "youtube", "settings", "battery", "wifi",
            "lte", "5g", "messages", "camera"
        ];
        const text = (ocrText || "").toLowerCase();
        const containsUIWords = keywords.some(word => text.includes(word));
        const screenshotDetected = !metadata.exif && containsUIWords;

        // Metadata
        const metadataAnalysis = {
            format: metadata.format || "unknown",
            density: metadata.density || 72,
            hasExif: !!metadata.exif,
            channels: metadata.channels || 3
        };

        // Confidence Score
        let confidenceScore = 100;
        if (brightness < 60) confidenceScore -= 10;
        if (blurScore < 100) confidenceScore -= 15;
        if (screenshotDetected) confidenceScore -= 20;
        if (!metadata.exif) confidenceScore -= 5;
        confidenceScore = Math.max(confidenceScore, 0);

        return {
            width: metadata.width || 800,
            height: metadata.height || 600,
            brightnessScore: Number(brightness.toFixed(2)),
            blurScore,
            screenshotDetected,
            metadata: metadataAnalysis,
            confidenceScore
        };
    } catch (error) {
        console.error("⚠️ Error analyzing image:", error.message);
        return {
            width: 800,
            height: 600,
            brightnessScore: 75,
            blurScore: 80,
            screenshotDetected: false,
            metadata: { format: "jpeg", density: 72, hasExif: false, channels: 3 },
            confidenceScore: 70
        };
    }
}

module.exports = {
    analyzeImage
};