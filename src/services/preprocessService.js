const sharp = require("sharp");
const path = require("path");

const preprocessImage = async (inputPath) => {

    const outputPath = path.join(
        __dirname,
        "../uploads/processed",
        "processed-" + Date.now() + ".png"
    );

    await sharp(inputPath)
        .grayscale()
        .normalize()
        .sharpen()
        .png()
        .toFile(outputPath);

    return outputPath;
};

module.exports = {
    preprocessImage
};