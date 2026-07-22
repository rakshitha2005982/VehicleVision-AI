const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

function detectPlate(imagePath, options = {}) {

    return new Promise((resolve) => {

        const pythonScript = options.scriptPath || path.join(
            __dirname,
            "python",
            "detect_plate.py"
        );

        if (!fs.existsSync(pythonScript)) {
            console.warn("⚠️ Plate detection script not found. Skipping plate analysis.");
            return resolve(null);
        }

        const pythonExe = process.env.PYTHON_PATH || (process.platform === "win32" ? "python" : "python3");
        const command = `"${pythonExe}" "${pythonScript}" "${imagePath}"`;

        console.log("Running Command:", command);

        exec(command, { timeout: 8000 }, (error, stdout, stderr) => {

            if (error) {
                console.warn("⚠️ Plate detection failed. Continuing with original image.", error.message);
                return resolve(null);
            }

            console.log("Python Output:", stdout.trim());

            const lines = stdout
                .trim()
                .split("\n")
                .map(line => line.trim())
                .filter(line => line.length > 0);

            let platePath = lines[lines.length - 1] || "";
            platePath = platePath.replace(/^Saved:\s*/, "").trim();

            if (platePath.includes("NOT_FOUND") || platePath.includes("NO_IMAGE") || platePath.includes("IMAGE_NOT_FOUND")) {
                console.log("⚠️ Plate detection returned no plate.");
                return resolve(null);
            }

            console.log("Detected Plate Image:", platePath);

            resolve(platePath);

        });

    });

}

module.exports = {
    detectPlate
};