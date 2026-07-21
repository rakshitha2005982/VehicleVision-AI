const express = require("express");

const router = express.Router();

const { getResult } = require("../controllers/resultController");

// GET /api/result/:processingId
router.get("/result/:processingId", getResult);

module.exports = router;