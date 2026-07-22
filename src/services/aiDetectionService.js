const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const runAIDetection = (imagePath, options = {}) => {

    return new Promise((resolve) => {

        const scriptPath = options.scriptPath || path.join(__dirname, "ai", "detect.py");

        if (!fs.existsSync(scriptPath)) {
            console.warn("⚠️ AI detection script not found. Skipping AI analysis.");
            return resolve(null);
        }

        const pythonExe =
            process.platform === "win32" ? "python" : "python3";

        const command = `"${pythonExe}" "${scriptPath}" "${imagePath}"`;

        console.log("🚀 Running AI Detection");
        console.log("Command:", command);

        exec(command, (error, stdout, stderr) => {

            console.log("========== PYTHON OUTPUT ==========");
            console.log("STDOUT:");
            console.log(stdout);

            console.log("STDERR:");
            console.log(stderr);
            console.log("===================================");

            if (error) {
                console.warn("⚠️ AI Detection Error. Continuing without AI output.", error.message);
                return resolve(null);
            }

            const lines = stdout.trim().split("\n");
            const outputPath = lines[lines.length - 1]
                .replace("Saved: ", "")
                .trim();

            console.log("✅ AI Output Path:", outputPath);

            resolve(outputPath);

        });

    });

};

module.exports = {
    runAIDetection
};