const sharp = require("sharp");

async function analyzeImage(imagePath) {
    try {
        // Read image metadata
        const metadata = await sharp(imagePath).metadata();

        // Read raw pixel data
        const { data, info } = await sharp(imagePath)
            .greyscale()
            .raw()
            .toBuffer({ resolveWithObject: true });

        let brightness = 0;

        // Calculate average brightness
        for (let i = 0; i < data.length; i++) {
            brightness += data[i];
        }

        brightness = brightness / data.length;

        // Simple blur estimation
        let blurScore = 100;

        if (brightness < 40) {
            blurScore = 30;
        } else if (brightness < 80) {
            blurScore = 60;
        }

        return {
            width: metadata.width,
            height: metadata.height,
            brightnessScore: Number(brightness.toFixed(2)),
            blurScore: blurScore
        };

    } catch (error) {
        console.error("Image Analysis Error:", error);
        throw error;
    }
}

module.exports = {
    analyzeImage
};