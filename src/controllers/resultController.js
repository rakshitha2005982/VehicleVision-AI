const { getProcessingResult } = require("../services/imageService");

const getResult = (req, res) => {

    const processingId = req.params.processingId;

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
                blurScore: data.blur_score
            }
        });

    });

};

module.exports = {
    getResult
};