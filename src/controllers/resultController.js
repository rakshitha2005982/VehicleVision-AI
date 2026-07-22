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

        res.status(200).json({
            success: true,
            processingId: data.processing_id,
            status: data.status,
            originalName: data.original_name,
            filename: data.stored_name,
            vehicleNumber: data.vehicle_number,

            analysis: {
                width: data.width,
                height: data.height,
                brightnessScore: data.brightness_score,
                blurScore: data.blur_score,

                screenshotDetected: Boolean(data.screenshot_detected),

                metadata: data.metadata_json || {},

                confidenceScore: data.confidence_score
            }
        });

    });

};

module.exports = {
    getResult
};