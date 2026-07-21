const db = require("../config/database");

// Save uploaded image metadata
const saveImageMetadata = (imageData, callback) => {
  const sql = `
    INSERT INTO images
    (processing_id, original_name, stored_name, file_path, status)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      imageData.processing_id,
      imageData.original_name,
      imageData.stored_name,
      imageData.file_path,
      imageData.status,
    ],
    callback
  );
};

// Update image analysis results
const updateImageAnalysis = (processingId, analysis, callback) => {

  const sql = `
    UPDATE images
    SET
      width = ?,
      height = ?,
      brightness_score = ?,
      blur_score = ?
    WHERE processing_id = ?
  `;

  db.query(
    sql,
    [
      analysis.width,
      analysis.height,
      analysis.brightnessScore,
      analysis.blurScore,
      processingId,
    ],
    callback
  );
};

// Update detected vehicle number
const updateVehicleNumber = (processingId, vehicleNumber, callback) => {

  const sql = `
    UPDATE images
    SET vehicle_number = ?
    WHERE processing_id = ?
  `;

  db.query(
    sql,
    [
      vehicleNumber,
      processingId,
    ],
    callback
  );
};

// Update processing status
const updateProcessingStatus = (processingId, status, callback) => {

  const sql = `
    UPDATE images
    SET status = ?
    WHERE processing_id = ?
  `;

  db.query(
    sql,
    [
      status,
      processingId,
    ],
    callback
  );
};

// Get processing status
const getProcessingStatus = (processingId, callback) => {

  const sql = `
    SELECT processing_id, status
    FROM images
    WHERE processing_id = ?
  `;

  db.query(
    sql,
    [processingId],
    callback
  );

};

// Get complete processing result
const getProcessingResult = (processingId, callback) => {

  const sql = `
    SELECT *
    FROM images
    WHERE processing_id = ?
  `;

  db.query(
    sql,
    [processingId],
    callback
  );

};

// ✅ NEW: Save image hash
const updateImageHash = (processingId, imageHash, callback) => {

  const sql = `
    UPDATE images
    SET image_hash = ?
    WHERE processing_id = ?
  `;

  db.query(
    sql,
    [
      imageHash,
      processingId,
    ],
    callback
  );

};

// ✅ NEW: Check duplicate image
const checkDuplicateImage = (imageHash, callback) => {

  const sql = `
    SELECT processing_id
    FROM images
    WHERE image_hash = ?
  `;

  db.query(
    sql,
    [imageHash],
    callback
  );

};

module.exports = {
  saveImageMetadata,
  updateImageAnalysis,
  updateVehicleNumber,
  updateProcessingStatus,
  getProcessingStatus,
  getProcessingResult,

  // ✅ NEW
  updateImageHash,
  checkDuplicateImage,
};