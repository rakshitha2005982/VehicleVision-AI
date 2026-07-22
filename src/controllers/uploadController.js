const { v4: uuidv4 } = require("uuid");
const { saveImageMetadata } = require("../services/imageService");
const { processImageJob } = require("../workers/imageWorker");

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

        // Run background image processing asynchronously in the main process
        setImmediate(() => {
            processImageJob({ processingId, imagePath: req.file.path })
                .catch((err) => {
                    console.error(`Background job ${processingId} error:`, err);
                });
        });

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