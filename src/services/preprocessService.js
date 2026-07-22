const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const preprocessImage = async (inputPath) => {

    const outputDir = path.join(__dirname, "../uploads/processed");

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(
        outputDir,
        "processed-" + Date.now() + ".png"
    );

    await sharp(inputPath)
        .resize({
            width: 1200,
            withoutEnlargement: false
        })
        .grayscale()
        .normalize()
        .modulate({
            brightness: 1.15,
            saturation: 0
        })
        .linear(1.4, -20)
        .sharpen({
            sigma: 2
        })
        .threshold(140)
        .png()
        .toFile(outputPath);

    return outputPath;
};

module.exports = {
    preprocessImage
};