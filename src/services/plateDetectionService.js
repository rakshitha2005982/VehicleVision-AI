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

        const command = `py -3.14 "${pythonScript}" "${imagePath}"`;

        console.log("Running Command:", command);

        exec(command, (error, stdout, stderr) => {

            if (error) {
                console.warn("⚠️ Plate detection failed. Continuing with the original image.", stderr);
                return resolve(null);
            }

            console.log("Python Output:");
            console.log(stdout);

            const lines = stdout
                .trim()
                .split("\n")
                .map(line => line.trim())
                .filter(line => line.length > 0);

            let platePath = lines[lines.length - 1] || "";
            platePath = platePath.replace(/^Saved:\s*/, "").trim();

            console.log("Detected Plate Image:", platePath);

            resolve(platePath);

        });

    });

}

module.exports = {
    detectPlate
};