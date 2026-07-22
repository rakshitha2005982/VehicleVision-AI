// Only create a real Redis connection if an external Redis host is configured.
// If we're running locally (127.0.0.1 / localhost) or no REDIS_HOST is set,
// return null so BullMQ / ioredis never tries to connect and never retries forever.

const host = process.env.REDIS_HOST || "";
const isRedisConfigured =
    host &&
    host !== "127.0.0.1" &&
    host !== "localhost";

if (!isRedisConfigured) {
    console.log("ℹ️ No external Redis configured. BullMQ queue is disabled. Jobs will run directly.");
    module.exports = null;
} else {
    const Redis = require("ioredis");
    const port = Number(process.env.REDIS_PORT || 6379);
    const tls = { servername: host };

    const connection = new Redis({
        host,
        port,
        username: process.env.REDIS_USERNAME || undefined,
        password: process.env.REDIS_PASSWORD || undefined,
        tls,
        lazyConnect: true,
        maxRetriesPerRequest: 3,
        connectTimeout: 5000,
        enableOfflineQueue: false,
    });

    connection.on("connect", () => {
        console.log("✅ Redis Connected Successfully");
    });

    connection.on("error", (err) => {
        console.warn("⚠️ Redis error:", err.message);
    });

    module.exports = connection;
}