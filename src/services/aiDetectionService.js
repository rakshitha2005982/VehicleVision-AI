const { exec } = require("child_process");
const path = require("path");

const runAIDetection = (imagePath) => {

    return new Promise((resolve, reject) => {

        const pythonScript = path.join(
            __dirname,
            "ai",
            "detect.py"
        );

        // Use python3 on Render, python on Windows
        const pythonExe =
            process.platform === "win32" ? "python" : "python3";

        const command = `"${pythonExe}" "${pythonScript}" "${imagePath}"`;

        exec(command, (error, stdout, stderr) => {

            if (error) {
                console.error("AI Detection Error:", error);
                return reject(error);
            }

            if (stderr) {
                console.error(stderr);
            }

            const lines = stdout.trim().split("\n");
            const outputPath = lines[lines.length - 1]
                .replace("Saved: ", "")
                .trim();

            resolve(outputPath);

        });

    });

};

module.exports = {
    runAIDetection
};