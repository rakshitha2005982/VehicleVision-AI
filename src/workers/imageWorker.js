console.log(__filename);

const { Worker } = require("bullmq");
const connection = require("../config/redis");

const {
    updateImageAnalysis,
    updateVehicleNumber,
    updateProcessingStatus,
    updateImageHash,
    checkDuplicateImage
} = require("../services/imageService");

const { analyzeImage } = require("../services/imageAnalysisService");
const { extractVehicleNumber } = require("../services/ocrService");
const { runAIDetection } = require("../services/aiDetectionService");
const { generateImageHash } = require("../utils/hashImage");
const { validateVehicleNumber } = require("../utils/vehicleNumberValidator");

const worker = new Worker(
    "image-processing",
    async (job) => {

        const { processingId, imagePath } = job.data;

        console.log("🚀 Processing:", processingId);

        try {

            // Update status
            updateProcessingStatus(processingId, "processing", () => {});

            // ==============================
            // Duplicate Image Detection
            // ==============================

            // Generate SHA-256 hash
            const imageHash = generateImageHash(imagePath);

            // Check duplicate
            checkDuplicateImage(imageHash, (err, result) => {

                if (err) {
                    console.error("Duplicate Check Error:", err);
                } else {

                    if (result.length > 0) {
                        console.log("⚠️ Duplicate Image Detected");
                    } else {
                        console.log("✅ New Image");
                    }

                }

            });

            // Save image hash
            updateImageHash(processingId, imageHash, (err) => {

                if (err) {
                    console.error("Failed to save image hash:", err);
                } else {
                    console.log("✅ Image hash saved");
                }

            });

            // ==============================
            // Image Analysis
            // ==============================

            const analysis = await analyzeImage(imagePath);

            updateImageAnalysis(processingId, analysis, (err) => {

                if (err)
                    console.error(err);
                else
                    console.log("✅ Image analysis saved");

            });

            // ==============================
            // AI Detection
            // ==============================

            const aiOutput = await runAIDetection(imagePath);

            console.log("AI Output:", aiOutput);

            // ==============================
            // OCR
            // ==============================

            const vehicleNumber = await extractVehicleNumber(imagePath);

            console.log("Vehicle Number:", vehicleNumber);

            // Validate Vehicle Number
            const isValidVehicleNumber = validateVehicleNumber(vehicleNumber);

            if (isValidVehicleNumber) {
                console.log("✅ Valid Indian Vehicle Number");
            } else {
                console.log("❌ Invalid Vehicle Number Format");
            }

            updateVehicleNumber(processingId, vehicleNumber, (err) => {

                if (err)
                    console.error(err);
                else
                    console.log("✅ Vehicle number saved");

            });

            // ==============================
            // Processing Completed
            // ==============================

            updateProcessingStatus(processingId, "completed", () => {
                console.log("✅ Processing Completed");
            });

            console.log("🎉 Job Completed");

        } catch (error) {

            console.error(error);

            updateProcessingStatus(processingId, "failed", () => {
                console.log("❌ Processing Failed");
            });

        }

    },
    {
        connection,
    }
);

console.log("🚀 Image Worker Started");