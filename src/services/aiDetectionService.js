const { exec } = require("child_process");
const path = require("path");

const runAIDetection = (imagePath) => {

    return new Promise((resolve, reject) => {

        // Path to detect.py
        const pythonScript = path.join(
            __dirname,
            "ai",
            "detect.py"
        );

        // Full path to Python 3.14
        const pythonExe =
            "C:\\Users\\Rakshitha\\AppData\\Local\\Programs\\Python\\Python314\\python.exe";

        // Command to execute
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
const outputPath = lines[lines.length - 1].replace("Saved: ", "").trim();

resolve(outputPath);

        });

    });

};

module.exports = {
    runAIDetection
};