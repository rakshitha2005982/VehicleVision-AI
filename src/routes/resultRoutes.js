const express = require("express");

const router = express.Router();

console.log("✅ RESULT ROUTES LOADED");

const { getResult } = require("../controllers/resultController");

router.get("/result/:processingId", getResult);

module.exports = router;