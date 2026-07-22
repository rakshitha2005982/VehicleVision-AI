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

const worker = new Worker(
    "image-processing",
    async (job) => {

        const { processingId, imagePath } = job.data;

        console.log("🚀 Processing:", processingId);

        try {

            // ==============================
            // Update Status
            // ==============================

            updateProcessingStatus(processingId, "processing", () => {});

            // ==============================
            // Duplicate Image Detection
            // ==============================

            const imageHash = generateImageHash(imagePath);

            checkDuplicateImage(imageHash, (err, result) => {

                if (err) {
                    console.error("Duplicate Check Error:", err);
                } else {

                    if (result.length > 0)
                        console.log("⚠️ Duplicate Image Detected");
                    else
                        console.log("✅ New Image");

                }

            });

            updateImageHash(processingId, imageHash, (err) => {

                if (err)
                    console.error("Failed to save image hash:", err);
                else
                    console.log("✅ Image hash saved");

            });

            // ==============================
            // AI Detection
            // ==============================

            const aiOutput = await runAIDetection(imagePath);

            console.log("AI Output:", aiOutput);

            // ==============================
            // Plate Detection
            // ==============================

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

                console.log("⚠️ Plate detection failed.");
                console.log("Using original image for OCR.");

            }

            // ==============================
            // OCR
            // ==============================

            const fullText = await extractText(imageForOCR);

            console.log("OCR Full Text:", fullText);

            const vehicleNumber = await extractVehicleNumber(imageForOCR);

            console.log("Vehicle Number:", vehicleNumber);

            // ==============================
            // Vehicle Number Validation
            // ==============================

            const isValidVehicleNumber =
                validateVehicleNumber(vehicleNumber);

            if (isValidVehicleNumber)
                console.log("✅ Valid Indian Vehicle Number");
            else
                console.log("❌ Invalid Vehicle Number Format");

            updateVehicleNumber(processingId, vehicleNumber, (err) => {

                if (err)
                    console.error(err);
                else
                    console.log("✅ Vehicle number saved");

            });

            // ==============================
            // Image Analysis
            // ==============================

            const analysis = await analyzeImage(
                imagePath,
                fullText
            );

            updateImageAnalysis(processingId, analysis, (err) => {

                if (err)
                    console.error(err);
                else
                    console.log("✅ Image analysis saved");

            });

            // ==============================
            // Completed
            // ==============================

            updateProcessingStatus(processingId, "completed", () => {

                console.log("✅ Processing Completed");

            });

            console.log("🎉 Job Completed");

        }

        catch (error) {

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