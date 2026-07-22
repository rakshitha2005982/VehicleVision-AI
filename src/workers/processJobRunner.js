/**
 * processJobRunner.js
 *
 * This script is spawned as a SEPARATE child process by uploadController.js.
 * It receives the job data via command-line args (JSON), runs processImageJob,
 * and exits. If it crashes (OOM, etc.), the main HTTP server is NOT affected.
 */

require("dotenv").config();

const args = process.argv[2];

if (!args) {
    console.error("processJobRunner: No job data provided.");
    process.exit(1);
}

let jobData;
try {
    jobData = JSON.parse(args);
} catch (e) {
    console.error("processJobRunner: Failed to parse job data JSON:", e.message);
    process.exit(1);
}

const { processImageJob } = require("./imageWorker");

processImageJob(jobData)
    .then((result) => {
        console.log("processJobRunner: Job finished:", JSON.stringify(result));
        process.exit(0);
    })
    .catch((err) => {
        console.error("processJobRunner: Job failed:", err.message);
        process.exit(1);
    });
