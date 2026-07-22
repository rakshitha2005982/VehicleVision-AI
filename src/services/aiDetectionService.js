const { exec } = require("child_process");
const path = require("path");

const runAIDetection = (imagePath) => {

    return new Promise((resolve, reject) => {

        const pythonScript = path.join(
            __dirname,
            "ai",
            "detect.py"
        );

        // Use python on Windows and python3 on Linux (Render)
        const pythonExe =
            process.platform === "win32" ? "python" : "python3";

        const command = `"${pythonExe}" "${pythonScript}" "${imagePath}"`;

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
                console.error("❌ AI Detection Error:");
                console.error(error);
                return reject(error);
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