// imageQueue.js — Only create the BullMQ queue if an external Redis is configured.
// If redis.js exports null, this module also exports null safely.

const redisConnection = require("../config/redis");

if (!redisConnection) {
    console.log("ℹ️ Image queue disabled — no external Redis configured.");
    module.exports = null;
} else {
    const { Queue } = require("bullmq");

    const imageQueue = new Queue("image-processing", {
        connection: redisConnection,
    });

    module.exports = imageQueue;
}