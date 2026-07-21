const express = require("express");

const router = express.Router();

const { checkStatus } = require("../controllers/statusController");

router.get("/status/:processingId", checkStatus);

module.exports = router;