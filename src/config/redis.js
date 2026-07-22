const Redis = require("ioredis");

const host = process.env.REDIS_HOST || "127.0.0.1";
const port = Number(process.env.REDIS_PORT || 6379);
const tls = host && host !== "127.0.0.1" && host !== "localhost"
  ? { servername: host }
  : undefined;

const connection = new Redis({
  host,
  port,
  username: process.env.REDIS_USERNAME || undefined,
  password: process.env.REDIS_PASSWORD || undefined,
  tls,
  lazyConnect: true,
  maxRetriesPerRequest: null,
  connectTimeout: 5000,
  enableOfflineQueue: true,
});

connection.on("connect", () => {
  console.log("✅ Redis Connected Successfully");
});

connection.on("error", (err) => {
  console.warn("⚠️ Redis unavailable. Queue processing will fall back to direct execution.", err.message);
});

module.exports = connection;