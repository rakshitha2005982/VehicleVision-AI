const { v4: uuidv4 } = require("uuid");

const imageQueue = require("../queue/imageQueue");

const {
    saveImageMetadata
} = require("../services/imageService");

const uploadImage = (req, res) => {

    // Check whether an image was uploaded
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No image uploaded."
        });
    }

    // Generate Processing ID
    const processingId = uuidv4();

    // Prepare image metadata
    const imageData = {
        processing_id: processingId,
        original_name: req.file.originalname,
        stored_name: req.file.filename,
        file_path: req.file.path,
        status: "pending"
    };

    // Save metadata
    saveImageMetadata(imageData, async (err) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Failed to save image metadata."
            });
        }

        try {

            // ✅ Add Job to Redis Queue
            await imageQueue.add("process-image", {
                processingId,
                imagePath: req.file.path
            });

            console.log("✅ Job added to Redis Queue");

            // Return immediately
            res.status(202).json({
                success: true,
                processingId,
                status: "pending",
                filename: req.file.filename,
                originalName: req.file.originalname,
                message: "Image uploaded successfully. Processing started."
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "Failed to add job to Redis queue."
            });

        }

    });

};

module.exports = {
    uploadImage
};