const fs = require("fs");
const crypto = require("crypto");

const generateImageHash = (imagePath) => {

    const fileBuffer = fs.readFileSync(imagePath);

    const hash = crypto
        .createHash("sha256")
        .update(fileBuffer)
        .digest("hex");

    return hash;
};

module.exports = {
    generateImageHash
};