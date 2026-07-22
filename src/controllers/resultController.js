console.log("✅ RESULT CONTROLLER LOADED");

const { getProcessingResult } = require("../services/imageService");

const getResult = (req, res) => {

    const processingId = req.params.processingId;

    console.log("➡️ Request for:", processingId);

    getProcessingResult(processingId, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Processing ID not found"
            });
        }

        const data = result[0];

        console.log("DATABASE RESULT:");
        console.log(data);

        let metadataObj = {};
        try {
            metadataObj = typeof data.metadata_json === "string"
                ? JSON.parse(data.metadata_json)
                : (data.metadata_json || {});
        } catch (e) {
            metadataObj = {};
        }

        res.status(200).json({
            success: true,
            processingId: data.processing_id,
            status: data.status,
            originalName: data.original_name,
            filename: data.stored_name,
            vehicleNumber: data.vehicle_number || "NOT_DETECTED",

            analysis: {
                width: data.width || 0,
                height: data.height || 0,
                brightnessScore: data.brightness_score || 0,
                blurScore: data.blur_score || 0,

                screenshotDetected: Boolean(data.screenshot_detected),

                metadata: metadataObj,

                confidenceScore: data.confidence_score || 0
            }
        });

    });

};

module.exports = {
    getResult
};