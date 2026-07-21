const { getProcessingStatus } = require("../services/imageService");

const checkStatus = (req, res) => {

    const processingId = req.params.processingId;

    getProcessingStatus(processingId, (err, result) => {

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

        res.status(200).json({
            success: true,
            processingId: result[0].processing_id,
            status: result[0].status
        });

    });

};

module.exports = {
    checkStatus
};