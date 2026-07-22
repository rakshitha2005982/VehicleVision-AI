const { exec } = require("child_process");
const path = require("path");

function detectPlate(imagePath) {

    return new Promise((resolve, reject) => {

        const pythonScript = path.join(
            __dirname,
            "python",
            "detect_plate.py"
        );

        const command = `py -3.14 "${pythonScript}" "${imagePath}"`;

        console.log("Running Command:", command);

        exec(command, (error, stdout, stderr) => {

            if (error) {
                console.error("Python Error:");
                console.error(stderr);
                return reject(error);
            }

            console.log("Python Output:");
            console.log(stdout);

            // Split output into lines
            const lines = stdout
                .trim()
                .split("\n")
                .map(line => line.trim())
                .filter(line => line.length > 0);

            // Last line is the cropped plate image path
            let platePath = lines[lines.length - 1];

            // Remove "Saved:" if present
            platePath = platePath.replace(/^Saved:\s*/, "").trim();

            console.log("Detected Plate Image:", platePath);

            resolve(platePath);

        });

    });

}

module.exports = {
    detectPlate
};