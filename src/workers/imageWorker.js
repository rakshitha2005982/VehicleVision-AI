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

const {
    extractVehicleNumber,
    extractText
} = require("../services/ocrService");

const {
    detectPlate
} = require("../services/plateDetectionService");

const { runAIDetection } = require("../services/aiDetectionService");
const { generateImageHash } = require("../utils/hashImage");
const { validateVehicleNumber } = require("../utils/vehicleNumberValidator");

const processImageJob = async ({ processingId, imagePath }) => {

    console.log("🚀 Processing:", processingId);

    try {
        updateProcessingStatus(processingId, "processing", () => {});

        const imageHash = generateImageHash(imagePath);

        checkDuplicateImage(imageHash, (err, result) => {
            if (err) {
                console.error("Duplicate Check Error:", err);
            } else if (result.length > 0) {
                console.log("⚠️ Duplicate Image Detected");
            } else {
                console.log("✅ New Image");
            }
        });

        updateImageHash(processingId, imageHash, (err) => {
            if (err) {
                console.error("Failed to save image hash:", err);
            } else {
                console.log("✅ Image hash saved");
            }
        });

        let aiOutput = null;

        try {
            aiOutput = await runAIDetection(imagePath);
            console.log("AI Output:", aiOutput);
        } catch (error) {
            console.warn("⚠️ AI detection skipped.", error.message);
        }

        let imageForOCR = imagePath;

        try {
            const plateImage = await detectPlate(imagePath);
            console.log("Plate Detection:", plateImage);

            if (
                plateImage &&
                plateImage !== "NOT_FOUND" &&
                plateImage !== "NO_IMAGE" &&
                plateImage !== "IMAGE_NOT_FOUND"
            ) {
                imageForOCR = plateImage;
            }
        } catch (err) {
            console.warn("⚠️ Plate detection failed. Using the original image for OCR.");
        }

        const fullText = await extractText(imageForOCR);
        console.log("OCR Full Text:", fullText);

        const vehicleNumber = await extractVehicleNumber(fullText);
        console.log("Vehicle Number:", vehicleNumber);

        const isValidVehicleNumber = validateVehicleNumber(vehicleNumber);

        if (isValidVehicleNumber) {
            console.log("✅ Valid Indian Vehicle Number");
        } else {
            console.log("❌ Invalid Vehicle Number Format");
        }

        updateVehicleNumber(processingId, vehicleNumber, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log("✅ Vehicle number saved");
            }
        });

        const analysis = await analyzeImage(imagePath, fullText);

        updateImageAnalysis(processingId, analysis, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log("✅ Image analysis saved");
            }
        });

        updateProcessingStatus(processingId, "completed", () => {
            console.log("✅ Processing Completed");
        });

        console.log("🎉 Job Completed");
        return { success: true, processingId, aiOutput, vehicleNumber, analysis };
    } catch (error) {
        console.error("Processing Job Error:", error);

        updateProcessingStatus(processingId, "failed", () => {
            console.log("❌ Processing Failed");
        });

        return { success: false, processingId, error: error.message };
    }
};

const createImageWorker = () => {
    try {
        if (!process.env.REDIS_HOST || process.env.REDIS_HOST === "localhost" || process.env.REDIS_HOST === "127.0.0.1") {
            console.log("ℹ️ Standard local/in-memory mode: running jobs directly without Redis BullMQ worker.");
            return null;
        }

        const worker = new Worker(
            "image-processing",
            async (job) => processImageJob(job.data),
            { connection }
        );

        console.log("🚀 Image Worker Started");
        return worker;
    } catch (error) {
        console.warn("⚠️ Image worker could not start.", error.message);
        return null;
    }
};

module.exports = {
    processImageJob,
    createImageWorker
};