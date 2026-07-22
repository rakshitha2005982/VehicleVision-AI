const { v4: uuidv4 } = require("uuid");
const { spawn } = require("child_process");
const path = require("path");

const { saveImageMetadata, updateProcessingStatus } = require("../services/imageService");

const saveMetadata = (imageData) => {
    return new Promise((resolve, reject) => {
        saveImageMetadata(imageData, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

/**
 * Spawns image processing as a SEPARATE child process.
 *
 * This is critical for Render (and any cloud host with strict memory limits):
 * if the child process OOMs or crashes, the main HTTP server is NOT affected.
 * The main server stays alive and continues serving API requests.
 */
const spawnProcessingJob = (processingId, imagePath) => {
    const runnerPath = path.join(__dirname, "processJobRunner.js");
    const jobData = JSON.stringify({ processingId, imagePath });

    // Spawn a detached child process. It runs independently —
    // the HTTP server does not wait for it and is not harmed if it crashes.
    const child = spawn(process.execPath, [runnerPath, jobData], {
        detached: true,
        stdio: "pipe",
    });

    child.stdout.on("data", (data) => {
        console.log(`[Job ${processingId}] ${data.toString().trim()}`);
    });

    child.stderr.on("data", (data) => {
        console.error(`[Job ${processingId}] STDERR: ${data.toString().trim()}`);
    });

    child.on("close", (code) => {
        if (code === 0) {
            console.log(`✅ [Job ${processingId}] Child process completed successfully.`);
        } else {
            console.error(`❌ [Job ${processingId}] Child process exited with code ${code}. Marking as failed.`);
            // Mark as failed in the store if the child died
            updateProcessingStatus(processingId, "failed", () => {});
        }
    });

    child.on("error", (err) => {
        console.error(`❌ [Job ${processingId}] Failed to spawn child process:`, err.message);
        updateProcessingStatus(processingId, "failed", () => {});
    });

    // Unref so the parent can exit independently of the child
    child.unref();
};

const uploadImage = async (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No image uploaded."
        });
    }

    const processingId = uuidv4();

    const imageData = {
        processing_id: processingId,
        original_name: req.file.originalname,
        stored_name: req.file.filename,
        file_path: req.file.path,
        status: "pending"
    };

    try {
        await saveMetadata(imageData);

        // Spawn processing in an isolated child process —
        // a crash or OOM there will NOT bring down the HTTP server.
        spawnProcessingJob(processingId, req.file.path);

        return res.status(202).json({
            success: true,
            processingId,
            status: "pending",
            filename: req.file.filename,
            originalName: req.file.originalname,
            message: "Image uploaded successfully. Processing started."
        });

    } catch (error) {
        console.error("uploadImage error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to process the uploaded image."
        });
    }
};

module.exports = {
    uploadImage
};